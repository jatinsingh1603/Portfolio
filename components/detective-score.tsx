"use client";

import { useEffect, useRef, useState } from "react";

/** An original, sparse minor-key score. Nothing plays before a deliberate click. */
const PHRASES = [
  { bass: 36, chord: [60, 63, 67, 74], melody: [79, 74, 75, 72] },
  { bass: 32, chord: [60, 63, 67, 70], melody: [75, 74, 70, 72] },
  { bass: 38, chord: [60, 65, 68, 72], melody: [77, 72, 74, 68] },
  { bass: 31, chord: [59, 62, 65, 68], melody: [74, 71, 68, 67] },
] as const;

const EIGHTH_NOTE = 60 / 68 / 2;
const FADE_SECONDS = 0.28;

type Score = {
  start: () => Promise<void>;
  stop: (immediate?: boolean) => void;
};

function createScore(onClosed: () => void): Score {
  const context = new AudioContext();
  const filter = context.createBiquadFilter();
  const echo = context.createDelay(1);
  const feedback = context.createGain();
  const echoLevel = context.createGain();
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const voices = new Map<OscillatorNode, [GainNode, StereoPannerNode]>();

  // Rounded tones, a short room-like echo, and a deliberately quiet output.
  filter.type = "lowpass";
  filter.frequency.value = 2100;
  filter.Q.value = 0.3;
  echo.delayTime.value = EIGHTH_NOTE * 1.5;
  feedback.gain.value = 0.2;
  echoLevel.gain.value = 0.16;
  master.gain.value = 0;
  compressor.threshold.value = -22;
  compressor.knee.value = 12;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.01;
  compressor.release.value = 0.3;

  filter.connect(master);
  filter.connect(echo);
  echo.connect(feedback);
  feedback.connect(echo);
  echo.connect(echoLevel);
  echoLevel.connect(master);
  master.connect(compressor);
  compressor.connect(context.destination);

  let stopped = false;
  let closed = false;
  let playing = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let step = 0;
  let nextNote = 0;

  function tone(
    note: number,
    at: number,
    duration: number,
    volume: number,
    type: OscillatorType,
    pan = 0,
  ) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const panner = context.createStereoPanner();
    oscillator.type = type;
    oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
    panner.pan.value = pan;
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(volume, at + 0.08);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(envelope);
    envelope.connect(panner);
    panner.connect(filter);
    voices.set(oscillator, [envelope, panner]);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
      panner.disconnect();
      voices.delete(oscillator);
    };
    oscillator.start(at);
    oscillator.stop(at + duration + 0.02);
  }

  function schedule() {
    if (stopped || context.state !== "running") return;
    // Do not catch up a burst of old notes after a busy main thread.
    if (nextNote < context.currentTime) nextNote = context.currentTime + 0.04;
    while (nextNote < context.currentTime + 0.18) {
      const phrase = PHRASES[Math.floor(step / 16) % PHRASES.length]!;
      const beat = step % 16;
      if (beat === 0) {
        phrase.chord.forEach((note, index) => {
          tone(
            note,
            nextNote + index * 0.035,
            5.7,
            0.035,
            "triangle",
            (index - 1.5) * 0.12,
          );
        });
      }
      if (beat === 0 || beat === 8) {
        tone(phrase.bass, nextNote, 2.6, 0.13, "sine");
        tone(phrase.bass + 12, nextNote, 1.8, 0.025, "sine");
      }
      // A four-note question, with breathing room between each answer.
      const melodyIndex = [3, 7, 10, 14].indexOf(beat);
      if (melodyIndex !== -1) {
        const note = phrase.melody[melodyIndex];
        if (note !== undefined) tone(note, nextNote, 2.1, 0.055, "sine", 0.18);
      }
      nextNote += EIGHTH_NOTE;
      step = (step + 1) % (PHRASES.length * 16);
    }
  }

  function close() {
    if (closed) return;
    closed = true;
    stopped = true;
    clearInterval(timer);
    clearTimeout(closeTimer);
    context.removeEventListener("statechange", onStateChange);
    for (const [oscillator, nodes] of voices) {
      oscillator.onended = null;
      oscillator.stop();
      oscillator.disconnect();
      nodes.forEach((node) => node.disconnect());
    }
    voices.clear();
    [filter, echo, feedback, echoLevel, master, compressor].forEach((node) =>
      node.disconnect(),
    );
    if (context.state !== "closed") void context.close().catch(() => undefined);
    onClosed();
  }

  function stop(immediate = false) {
    if (closed) return;
    stopped = true;
    clearInterval(timer);
    if (immediate || context.state !== "running") {
      close();
      return;
    }
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + FADE_SECONDS);
    clearTimeout(closeTimer);
    closeTimer = setTimeout(close, (FADE_SECONDS + 0.04) * 1000);
  }

  function onStateChange() {
    // Browser or operating-system interruptions leave the control safely off.
    if (playing && !stopped && context.state !== "running") stop(true);
  }
  context.addEventListener("statechange", onStateChange);

  return {
    async start() {
      await context.resume();
      if (stopped) return;
      if (context.state !== "running") throw new Error("Audio did not start");
      playing = true;
      const now = context.currentTime;
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(0.3, now + 0.9);
      nextNote = now + 0.05;
      schedule();
      timer = setInterval(schedule, 80);
    },
    stop,
  };
}

export function DetectiveScore() {
  const [enabled, setEnabled] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const active = useRef<Score | null>(null);
  const sessions = useRef(new Set<Score>());
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const liveSessions = sessions.current;
    const onVisibilityChange = () => {
      if (!document.hidden) return;
      // Immediate close avoids background timer throttling. Never auto-resume.
      liveSessions.forEach((score) => score.stop(true));
      active.current = null;
      setEnabled(false);
      setStarting(false);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      liveSessions.forEach((score) => score.stop(true));
      active.current = null;
    };
  }, []);

  async function toggle() {
    setError("");
    if (active.current) {
      const score = active.current;
      active.current = null;
      score.stop();
      setEnabled(false);
      return;
    }
    if (typeof window.AudioContext !== "function") {
      setError("This browser does not support the soundtrack.");
      return;
    }
    setStarting(true);
    let score: Score | null = null;
    try {
      score = createScore(() => {
        if (!score) return;
        sessions.current.delete(score);
        if (active.current === score) {
          active.current = null;
          if (mounted.current) {
            setEnabled(false);
            setStarting(false);
          }
        }
      });
      sessions.current.add(score);
      active.current = score;
      await score.start();
      if (mounted.current && active.current === score) setEnabled(true);
    } catch {
      const wasActive = !score || active.current === score;
      score?.stop(true);
      if (mounted.current && wasActive) {
        setError("Sound could not start. Select Sound off to try again.");
      }
    } finally {
      if (mounted.current && (!active.current || active.current === score)) {
        setStarting(false);
      }
    }
  }

  return (
    <>
      <button
        className="film-sound-toggle"
        type="button"
        aria-pressed={enabled}
        aria-label={
          enabled
            ? "Sound on: turn detective soundtrack off"
            : "Sound off: turn detective soundtrack on"
        }
        disabled={starting}
        onClick={() => void toggle()}
        title="Original ambient detective score. Plays only when selected."
      >
        <span aria-hidden="true">{enabled ? "♫" : "♪"}</span>
        {enabled ? "Sound on" : "Sound off"}
      </button>
      <span className="sr-only" role="status">
        {error}
      </span>
    </>
  );
}
