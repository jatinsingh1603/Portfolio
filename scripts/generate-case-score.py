#!/usr/bin/env python3
"""Compose and render the original Case Notes instrumental loop.

Provenance: this composition, note patterns, envelopes, and synthesized timbres
were created for Jatin's portfolio. No recordings, samples, downloaded music,
or third-party compositions are used. This is a deterministic procedural score,
not an imitation or transcription of a particular artist or soundtrack.

Run: python3 scripts/generate-case-score.py
Requires Python with numpy/scipy and ffmpeg on PATH; no runtime web dependency.
WAV intermediates live in a temporary directory and are removed on completion.

Musical form: 16 bars of 4/4 at 78 BPM, D minor. Quiet bowed harmony, felt-like
keys, a sparse answering cello line, rounded bass, and brushed percussion.
Events and room reflections wrap around the loop, preserving natural tails.
The final mono MP3 prioritizes clear phone playback and a small transfer size;
it includes the encoder's gapless metadata. Browsers use native looping.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import subprocess
import tempfile

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt


SAMPLE_RATE = 44_100
BPM = 78
BEAT = 60.0 / BPM
BARS = 16
DURATION = BARS * 4 * BEAT
FRAMES = round(DURATION * SAMPLE_RATE)
RNG = np.random.default_rng(1603)

# MIDI note numbers: Dm(add9), Dm/C, Bbmaj7, A7sus -> A7, Gm9,
# Bbmaj7, Dm/A, and A7(b9). Four-bar sentences repeat with small variations.
HARMONY = [
    (50, 57, 60, 64, 65), (48, 57, 62, 64, 65),
    (46, 53, 57, 62, 65), (45, 52, 55, 61, 64),
    (43, 50, 57, 58, 62), (46, 53, 57, 62, 65),
    (45, 53, 57, 62, 64), (45, 52, 55, 58, 61),
    (50, 57, 60, 64, 65), (48, 55, 57, 62, 65),
    (46, 53, 57, 62, 65), (45, 52, 55, 61, 64),
    (43, 50, 57, 58, 62), (46, 53, 57, 62, 65),
    (45, 53, 57, 62, 64), (45, 52, 55, 58, 61),
]
BASS = [38, 36, 34, 33, 31, 34, 33, 33] * 2

# Each tuple is (bar, beat offset, MIDI pitch, sounding beats, strength).
# Space between phrases is intentional; the music supports reading.
KEYS = [
    (0, 0.5, 69, 1.8, .80), (0, 2.5, 72, 1.5, .58),
    (1, 1.0, 76, 1.6, .68), (1, 3.0, 74, 1.8, .54),
    (2, 0.5, 69, 1.8, .70), (2, 2.5, 65, 1.6, .55),
    (3, 1.0, 64, 2.0, .65), (3, 3.0, 61, 1.2, .48),
    (4, 0.5, 62, 1.8, .74), (4, 2.5, 65, 1.5, .54),
    (5, 1.0, 69, 2.0, .68), (5, 3.0, 74, 1.6, .52),
    (6, 0.5, 72, 1.8, .68), (6, 2.5, 69, 1.6, .56),
    (7, 1.0, 68, 2.5, .58),
    (8, 0.5, 69, 1.8, .83), (8, 2.5, 72, 1.5, .64),
    (9, 1.0, 76, 1.4, .73), (9, 2.5, 77, 1.1, .47),
    (9, 3.5, 74, 1.3, .55),
    (10, 0.5, 69, 1.8, .76), (10, 2.5, 65, 1.6, .58),
    (11, 1.0, 64, 2.0, .68), (11, 3.0, 61, 1.2, .52),
    (12, 0.5, 62, 1.8, .79), (12, 2.5, 65, 1.5, .57),
    (13, 1.0, 69, 1.5, .72), (13, 2.5, 70, 1.1, .45),
    (13, 3.5, 69, 1.3, .51),
    (14, 0.5, 65, 1.7, .70), (14, 2.5, 64, 1.4, .54),
    (15, 1.0, 61, 2.2, .60), (15, 3.0, 64, 1.8, .43),
]
CELLO = [
    (1, 1.5, 57, 2.3), (3, 1.5, 55, 2.0),
    (5, 1.5, 53, 2.5), (7, 1.0, 52, 2.6),
    (9, 1.5, 57, 2.3), (11, 1.5, 55, 2.0),
    (13, 1.5, 53, 2.5), (15, 1.0, 52, 2.6),
]


def frequency(note: int) -> float:
    return 440 * 2 ** ((note - 69) / 12)


def times(seconds: float) -> np.ndarray:
    return np.arange(round(seconds * SAMPLE_RATE), dtype=np.float64) / SAMPLE_RATE


def envelope(t: np.ndarray, attack: float, release: float) -> np.ndarray:
    """Raised-cosine edges avoid sharp clicks without hiding articulation."""
    end = max(float(t[-1]), attack + release)
    rise = np.sin(np.minimum(t / attack, 1) * np.pi / 2) ** 2
    fall = np.sin(np.minimum((end - t) / release, 1) * np.pi / 2) ** 2
    return rise * fall


def bowed(note: int, seconds: float, voice: int, cello: bool = False) -> np.ndarray:
    t = times(seconds)
    f = frequency(note)
    out = np.zeros_like(t)
    # Independent, quiet detuned players give an ensemble rather than a buzzer.
    for player, cents in enumerate((-5.4, 0.7, 5.0)):
        phase = RNG.uniform(0, 2 * np.pi)
        vibrato = .0035 * np.sin(2 * np.pi * (4.5 + .13 * voice) * t + phase)
        fundamental = 2 * np.pi * f * 2 ** (cents / 1200) * t + vibrato
        for harmonic in range(1, 8 if cello else 6):
            weight = harmonic ** (-1.85 if cello else -2.1)
            weight *= np.exp(-harmonic * f / 3300)
            out += weight * np.sin(harmonic * fundamental + phase + player * .3)
    out /= 3.8
    slow_bow = .91 + .09 * np.sin(2 * np.pi * .38 * t + voice)
    return out * envelope(t, .22 if cello else .48, .65) * slow_bow


def felt_key(note: int, seconds: float) -> np.ndarray:
    t = times(seconds + 1.6)
    f = frequency(note)
    result = np.zeros_like(t)
    # A damped, near-harmonic struck string with a soft hammer attack.
    for harmonic, strength in ((1, 1), (2, .33), (3, .12), (4, .038), (6, .008)):
        decay = np.exp(-t / (1.12 / harmonic ** .58))
        for detune in (-.0008, .0008):
            result += strength * .5 * np.sin(2 * np.pi * f * harmonic * (1 + detune) * t) * decay
    return result * envelope(t, .012, .65)


def bass_note(note: int, seconds: float, soft: bool = False) -> np.ndarray:
    t = times(seconds)
    f = frequency(note)
    phase = 2 * np.pi * f * t
    # Second and third harmonics keep the bass audible on phone speakers.
    wave = np.sin(phase) + .47 * np.sin(2 * phase) + .14 * np.sin(3 * phase)
    return wave * np.exp(-t / (1.15 if soft else .8)) * envelope(t, .025, .30)


def brushed_hit(seconds: float, low: bool = False) -> np.ndarray:
    t = times(seconds)
    noise = RNG.normal(0, 1, len(t))
    filtered = sosfilt(butter(2, (350, 2300) if low else (1800, 4800),
                              btype="bandpass", fs=SAMPLE_RATE, output="sos"), noise)
    return filtered * np.exp(-t / (.10 if low else .035)) * envelope(t, .004, .03)


def add(track: np.ndarray, mono: np.ndarray, start: float, level: float, pan: float = 0) -> None:
    """Place a mono event on the circular stereo timeline with equal-power pan."""
    index = (round(start * SAMPLE_RATE) + np.arange(len(mono))) % FRAMES
    angle = (pan + 1) * np.pi / 4
    track[index, 0] += mono * level * np.cos(angle)
    track[index, 1] += mono * level * np.sin(angle)


def room(track: np.ndarray) -> np.ndarray:
    result = track.copy()
    # Circular reflections retain the final chord's tail across the loop seam.
    for delay, gain, swap in ((.073, .11, True), (.119, .09, False),
                              (.211, .075, True), (.337, .065, False),
                              (.487, .053, True), (.691, .042, False),
                              (.937, .033, True), (1.271, .022, False)):
        tail = np.roll(track, round(delay * SAMPLE_RATE), axis=0)
        result += gain * (tail[:, ::-1] if swap else tail)
    return result


def render() -> np.ndarray:
    strings = np.zeros((FRAMES, 2), dtype=np.float64)
    keys = np.zeros_like(strings)
    rhythm = np.zeros_like(strings)
    for bar, chord in enumerate(HARMONY):
        for voice, note in enumerate(chord):
            pan = (-.72, .45, -.3, .7, .12)[voice]
            dynamic = 1.08 if 8 <= bar < 14 else 1.0
            add(strings, bowed(note, 4 * BEAT + .9, voice), bar * 4 * BEAT - .2,
                .038 * dynamic, pan)
        for beat, strength in ((0, .16), (2.5, .08)):
            add(rhythm, bass_note(BASS[bar], 1.8, beat > 0),
                (bar * 4 + beat) * BEAT, strength, -.03)
        for beat in (1, 3):
            add(rhythm, brushed_hit(.35, True), (bar * 4 + beat) * BEAT, .015, .24)
        for beat in (.5, 2.5, 3.5):
            add(rhythm, brushed_hit(.20), (bar * 4 + beat) * BEAT, .008, -.24)
    for bar, beat, note, length, strength in KEYS:
        add(keys, felt_key(note, length * BEAT), (bar * 4 + beat) * BEAT,
            .12 * strength, -.16 if bar % 2 == 0 else .16)
    for bar, beat, note, length in CELLO:
        add(strings, bowed(note, length * BEAT, bar, cello=True),
            (bar * 4 + beat) * BEAT, .055, -.28)

    # A periodic, band-limited noise bed: no edge discontinuity or sample source.
    spectral_noise = np.fft.rfft(RNG.normal(0, 1, FRAMES))
    bins = np.fft.rfftfreq(FRAMES, 1 / SAMPLE_RATE)
    spectral_noise *= np.exp(-(bins / 1500) ** 2) * (1 - np.exp(-(bins / 160) ** 2))
    texture = np.fft.irfft(spectral_noise, n=FRAMES)
    texture /= max(float(np.std(texture)), 1e-9)
    texture *= .00065 * (1 + .18 * np.sin(2 * np.pi * np.arange(FRAMES) / FRAMES * 4))
    mix = room(strings) + room(keys) + rhythm
    mix[:, 0] += texture
    mix[:, 1] += np.roll(texture, 937)

    # Apply a circular frequency-domain tone filter: warm, clean, and seamless.
    spectrum = np.fft.rfft(mix, axis=0)
    tone = (1 - np.exp(-(bins / 38) ** 4)) * np.exp(-(bins / 6500) ** 4)
    mix = np.fft.irfft(spectrum * tone[:, None], n=FRAMES, axis=0)
    mix -= mix.mean(axis=0)
    mix *= .78 / max(float(np.max(np.abs(mix))), 1e-9)
    return mix.astype(np.float32)


def ffmpeg(*args: str) -> str:
    result = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", *args],
                            check=True, capture_output=True, text=True)
    return result.stderr


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).resolve().parents[1] / "public/audio/case-notes-score.mp3")
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # Fold the complete room mix to mono before measuring loudness. A 48 kbps
    # mono stream keeps this optional background asset under the site budget.
    audio = render().mean(axis=1)
    with tempfile.TemporaryDirectory(prefix="case-notes-score-") as temp:
        raw = Path(temp) / "original-score.wav"
        wavfile.write(raw, SAMPLE_RATE, audio)
        log = ffmpeg("-i", str(raw), "-af", "loudnorm=I=-19:TP=-2.5:LRA=7:print_format=json",
                     "-f", "null", "-")
        measured = json.loads(re.findall(r'\{[^{}]+\}', log)[-1])
        normalizer = (
            "loudnorm=I=-19:TP=-2.5:LRA=7:linear=true:"
            f"measured_I={measured['input_i']}:measured_TP={measured['input_tp']}:"
            f"measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}:"
            f"offset={measured['target_offset']}"
        )
        ffmpeg("-y", "-i", str(raw), "-af", normalizer, "-ar", str(SAMPLE_RATE),
               "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "48k", "-write_xing", "1",
               "-metadata", "title=Case Notes — Original Portfolio Score",
               "-metadata", "artist=Jatin Kumar Singh Portfolio",
               "-metadata", "comment=Original procedural composition. No samples. 78 BPM; 16 bars; D minor.",
               str(args.output))
    # Measure the delivered encoded asset, not just the pre-encoding WAV.
    analysis = ffmpeg("-i", str(args.output), "-af",
                      "loudnorm=I=-19:TP=-2.5:LRA=7:print_format=json,silencedetect=noise=-50dB:d=0.25",
                      "-f", "null", "-")
    final = json.loads(re.findall(r'\{[^{}]+\}', analysis)[-1])
    print(json.dumps({
        "file": str(args.output), "bytes": args.output.stat().st_size,
        "composition_seconds": FRAMES / SAMPLE_RATE, "bpm": BPM, "bars": BARS,
        "channels": 1, "bitrate_kbps": 48,
        "integrated_lufs": final["input_i"], "true_peak_dbtp": final["input_tp"],
        "loudness_range_lu": final["input_lra"],
        "silence_events": len(re.findall("silence_start:", analysis)),
        "pre_encode_seam_max_delta": float(np.max(np.abs(audio[0] - audio[-1]))),
    }, indent=2))


if __name__ == "__main__":
    main()
