"use client";

import { useEffect, useRef, useState } from "react";

export type CaseCue = "tick" | "unlock" | "page" | "close" | "transition";
const CUE_TYPES = new Set<CaseCue>([
  "tick",
  "unlock",
  "page",
  "close",
  "transition",
]);

const MUSIC_URL = "/audio/case-notes-score.mp3";
const START_TIMEOUT_MS = 12000;
const MUTE_STORAGE_KEY = "jatin:case-soundtrack:muted";

type PlaybackState = "starting" | "on" | "blocked" | "off" | "error";
type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

type SoundSession = {
  start: () => Promise<void>;
  cue: (type: CaseCue) => void;
  stop: (immediate?: boolean) => void;
};

type Tone = {
  note: number;
  at: number;
  duration: number;
  level: number;
  bus: AudioNode;
  type?: OscillatorType;
  attack?: number;
  cutoff?: number;
  pan?: number;
  detune?: number;
};

/** Constructed only within the sound button's explicit activation handler. */
function createSession(onClosed: () => void): SoundSession {
  const AudioContextClass =
    window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!AudioContextClass) throw new Error("Web Audio is unavailable");
  const context = new AudioContextClass();
  const foley = context.createGain();
  const room = context.createConvolver();
  const roomLevel = context.createGain();
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const sources = new Map<AudioScheduledSourceNode, AudioNode[]>();
  const recentCues = new Map<CaseCue, number>();
  let stopped = false;
  let closed = false;
  let playing = false;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  // Deterministic noise is generated on demand, never during server rendering.
  function noiseBuffer(seconds: number, channels = 1, decay = false) {
    const buffer = context.createBuffer(
      channels,
      Math.ceil(context.sampleRate * seconds),
      context.sampleRate,
    );
    let seed = 173;
    for (let channel = 0; channel < channels; channel += 1) {
      const samples = buffer.getChannelData(channel);
      let softened = 0;
      for (let i = 0; i < samples.length; i += 1) {
        seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
        const white = (seed >>> 0) / 2147483648 - 1;
        softened = softened * 0.58 + white * 0.42;
        const tail = decay ? (1 - i / samples.length) ** 3 : 1;
        samples[i] = softened * tail;
      }
    }
    return buffer;
  }

  const noise = noiseBuffer(1);
  room.buffer = noiseBuffer(1.35, 2, true);
  foley.gain.value = 1.05;
  roomLevel.gain.value = 0.2;
  master.gain.value = 0;
  compressor.threshold.value = -19;
  compressor.knee.value = 16;
  compressor.ratio.value = 5;
  compressor.attack.value = 0.008;
  compressor.release.value = 0.24;
  foley.connect(master);
  foley.connect(room);
  room.connect(roomLevel);
  roomLevel.connect(master);
  master.connect(compressor);
  compressor.connect(context.destination);

  function track(source: AudioScheduledSourceNode, nodes: AudioNode[]) {
    sources.set(source, nodes);
    source.onended = () => {
      source.disconnect();
      nodes.forEach((node) => node.disconnect());
      sources.delete(source);
    };
  }

  function tone({
    note,
    at,
    duration,
    level,
    bus,
    type = "sawtooth",
    attack = 0.3,
    cutoff = 950,
    pan = 0,
    detune = 0,
  }: Tone) {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    const position = context.createStereoPanner();
    const rise = Math.min(attack, duration * 0.4);
    oscillator.type = type;
    oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
    oscillator.detune.value = detune;
    filter.type = "lowpass";
    filter.Q.value = 0.45;
    filter.frequency.setValueAtTime(cutoff * 0.6, at);
    filter.frequency.linearRampToValueAtTime(cutoff, at + rise);
    filter.frequency.exponentialRampToValueAtTime(cutoff * 0.55, at + duration);
    position.pan.value = pan;
    envelope.gain.setValueAtTime(0.00001, at);
    envelope.gain.linearRampToValueAtTime(level, at + rise);
    envelope.gain.linearRampToValueAtTime(level * 0.6, at + duration * 0.65);
    envelope.gain.exponentialRampToValueAtTime(0.00001, at + duration);
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(position);
    position.connect(bus);
    track(oscillator, [filter, envelope, position]);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.02);
  }

  function brush(
    at: number,
    duration: number,
    level: number,
    frequency: number,
    bus: AudioNode,
    attack = 0.015,
    pan = 0,
  ) {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    const position = context.createStereoPanner();
    source.buffer = noise;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(frequency, at);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(140, frequency * 0.55),
      at + duration,
    );
    filter.Q.value = 0.65;
    position.pan.setValueAtTime(pan, at);
    position.pan.linearRampToValueAtTime(-pan, at + duration);
    envelope.gain.setValueAtTime(0.00001, at);
    envelope.gain.linearRampToValueAtTime(
      level,
      at + Math.min(attack, duration * 0.7),
    );
    envelope.gain.exponentialRampToValueAtTime(0.00001, at + duration);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(position);
    position.connect(bus);
    track(source, [filter, envelope, position]);
    source.start(at);
    source.stop(at + duration + 0.02);
  }

  function cue(type: CaseCue) {
    if (!playing || stopped || context.state !== "running") return;
    const now = context.currentTime;
    if (
      now - (recentCues.get(type) ?? -Infinity) <
      (type === "tick" ? 0.065 : 0.12)
    )
      return;
    recentCues.set(type, now);
    const at = now + 0.008;
    switch (type) {
      case "tick":
        brush(at, 0.045, 0.12, 1600, foley, 0.003, -0.1);
        tone({
          note: 64,
          at,
          duration: 0.045,
          level: 0.06,
          bus: foley,
          type: "sine",
          attack: 0.002,
          cutoff: 950,
        });
        break;
      case "unlock":
        brush(at, 0.07, 0.2, 1200, foley, 0.004, -0.15);
        brush(at + 0.075, 0.22, 0.12, 2100, foley, 0.015, 0.15);
        tone({
          note: 45,
          at: at + 0.065,
          duration: 0.14,
          level: 0.16,
          bus: foley,
          type: "sine",
          attack: 0.004,
          cutoff: 600,
        });
        break;
      case "page":
        brush(at, 0.38, 0.17, 1800, foley, 0.11, -0.45);
        brush(at + 0.1, 0.25, 0.065, 3400, foley, 0.025, 0.25);
        break;
      case "close":
        tone({
          note: 34,
          at,
          duration: 0.26,
          level: 0.22,
          bus: foley,
          type: "sine",
          attack: 0.004,
          cutoff: 300,
        });
        brush(at, 0.17, 0.2, 650, foley, 0.005);
        break;
      case "transition":
        brush(at, 0.85, 0.1, 1100, foley, 0.5, -0.35);
        tone({
          note: 48,
          at: at + 0.38,
          duration: 0.9,
          level: 0.035,
          bus: foley,
          attack: 0.15,
          cutoff: 700,
          detune: -5,
        });
        tone({
          note: 55,
          at: at + 0.4,
          duration: 0.85,
          level: 0.025,
          bus: foley,
          attack: 0.18,
          cutoff: 850,
          detune: 5,
        });
        break;
    }
  }

  function close() {
    if (closed) return;
    closed = true;
    stopped = true;
    clearTimeout(closeTimer);
    context.removeEventListener("statechange", onStateChange);
    for (const [source, nodes] of sources) {
      source.onended = null;
      source.stop();
      source.disconnect();
      nodes.forEach((node) => node.disconnect());
    }
    sources.clear();
    [foley, room, roomLevel, master, compressor].forEach((node) =>
      node.disconnect(),
    );
    if (context.state !== "closed") void context.close().catch(() => undefined);
    onClosed();
  }

  function stop(immediate = false) {
    if (closed) return;
    stopped = true;
    if (immediate || context.state !== "running") {
      close();
      return;
    }
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.3);
    clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 340);
  }

  function onStateChange() {
    if (playing && !stopped && context.state !== "running") stop(true);
  }
  context.addEventListener("statechange", onStateChange);

  return {
    async start() {
      await context.resume();
      if (stopped) return;
      if (context.state !== "running") throw new Error("Audio could not start");
      playing = true;
      const now = context.currentTime;
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(0.5, now + 0.12);
    },
    cue,
    stop,
  };
}

/** A local, continuous music loop; Web Audio is only an optional foley layer. */
export function CaseSoundtrack() {
  const [state, setState] = useState<PlaybackState>("starting");
  const [message, setMessage] = useState("");
  const control = useRef<{ toggle: () => void } | null>(null);

  useEffect(() => {
    let wanted = true;
    try {
      wanted = sessionStorage.getItem(MUTE_STORAGE_KEY) !== "1";
    } catch {
      // Storage may be unavailable in private or embedded browsing contexts.
    }
    const audio = new Audio();
    audio.preload = "none";
    audio.src = MUSIC_URL;
    audio.loop = true;
    audio.volume = 0.8;
    audio.muted = false;
    let disposed = false;
    let phase: PlaybackState = wanted ? "starting" : "off";
    let attempt = 0;
    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let effectsTimer: ReturnType<typeof setTimeout> | undefined;
    let effects: SoundSession | null = null;

    function rememberMute(muted: boolean) {
      try {
        sessionStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
      } catch {
        // The in-memory choice still applies when the browser denies storage.
      }
    }
    function show(next: PlaybackState, text = "") {
      phase = next;
      if (!disposed) {
        setState(next);
        setMessage(text);
      }
    }
    function clearStart() {
      attempt += 1;
      clearTimeout(startTimer);
    }
    function stopEffects() {
      clearTimeout(effectsTimer);
      const session = effects;
      effects = null;
      session?.stop(true);
    }
    function prepareEffects() {
      if (effects || disposed || !wanted) return;
      // Foley never controls whether the music can play. Older or interrupted
      // Web Audio implementations still get the regular HTML audio soundtrack.
      try {
        const session = createSession(() => {
          if (effects === session) effects = null;
        });
        effects = session;
        const started = session.start();
        effectsTimer = setTimeout(() => {
          if (effects === session) stopEffects();
        }, 4000);
        void started.then(
          () => {
            if (effects === session) clearTimeout(effectsTimer);
          },
          () => {
            if (effects === session) stopEffects();
          },
        );
      } catch {
        stopEffects();
      }
    }
    function fail(error: unknown) {
      clearStart();
      stopEffects();
      const blocked =
        error instanceof DOMException && error.name === "NotAllowedError";
      show(
        blocked ? "blocked" : "error",
        blocked
          ? "Tap anywhere or press Enter to start music."
          : "Music could not load. Tap Retry music to try again.",
      );
      audio.pause();
    }
    function play(fromGesture = false) {
      if (disposed || !wanted || document.hidden) return;
      clearStart();
      const current = attempt;
      show("starting");
      try {
        // Call play directly in this stack: a gesture-backed retry must not
        // await a fetch, import, decoder, or Web Audio resume first.
        const playback = audio.play();
        if (fromGesture) prepareEffects();
        startTimer = setTimeout(() => {
          if (disposed || current !== attempt) return;
          clearStart();
          stopEffects();
          show("error", "Music is taking too long to load. Tap Retry music.");
          audio.pause();
        }, START_TIMEOUT_MS);
        void playback.then(
          () => {
            if (disposed || current !== attempt || !wanted) return;
            clearTimeout(startTimer);
            show("on");
          },
          (error: unknown) => {
            if (!disposed && current === attempt && wanted) fail(error);
          },
        );
      } catch (error) {
        fail(error);
      }
    }
    function stop() {
      clearStart();
      stopEffects();
      show("off");
      audio.pause();
    }
    function onActivation(event: Event) {
      if (!event.isTrusted || !wanted || document.hidden) return;
      if (
        event.type === "keydown" &&
        !["Enter", " "].includes((event as KeyboardEvent).key)
      )
        return;
      const target = event.target;
      // The sound button has its own action. A capture listener must not start
      // playback just before that same click asks to mute it.
      if (target instanceof Element && target.closest(".ms-sound-button"))
        return;
      if (phase === "blocked") play(true);
      else if (phase === "on") prepareEffects();
    }
    function onVisibility() {
      if (document.hidden) stop();
      else if (wanted) play();
    }
    function onPlaying() {
      if (disposed) return;
      if (!wanted || document.hidden || phase === "error" || phase === "off") {
        audio.pause();
        return;
      }
      clearTimeout(startTimer);
      show("on");
    }
    function onPause() {
      if (!disposed && wanted && phase === "on") {
        clearStart();
        stopEffects();
        show("blocked", "Music paused. Tap to resume.");
      }
    }
    function onError() {
      if (!disposed && wanted) fail(audio.error);
    }
    function onCue(event: Event) {
      if (phase !== "on") return;
      const detail: unknown = (event as CustomEvent<unknown>).detail;
      if (!detail || typeof detail !== "object" || !("type" in detail)) return;
      if (
        typeof detail.type === "string" &&
        CUE_TYPES.has(detail.type as CaseCue)
      ) {
        effects?.cue(detail.type as CaseCue);
      }
    }

    control.current = {
      toggle() {
        if (phase === "on" || phase === "starting") {
          wanted = false;
          rememberMute(true);
          stop();
        } else {
          wanted = true;
          rememberMute(false);
          play(true);
        }
      },
    };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    window.addEventListener("click", onActivation, true);
    window.addEventListener("keydown", onActivation, true);
    window.addEventListener("case:cue", onCue);
    document.addEventListener("visibilitychange", onVisibility);
    // Default-on applies only without an explicit mute in this browser session.
    if (wanted) play();
    else show("off");

    return () => {
      disposed = true;
      wanted = false;
      control.current = null;
      clearStart();
      stopEffects();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      window.removeEventListener("click", onActivation, true);
      window.removeEventListener("keydown", onActivation, true);
      window.removeEventListener("case:cue", onCue);
      document.removeEventListener("visibilitychange", onVisibility);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  const label =
    state === "on"
      ? "Sound on"
      : state === "starting"
        ? "Starting…"
        : state === "blocked"
          ? "Play music"
          : state === "error"
            ? "Retry music"
            : "Sound off";
  return (
    <>
      <button
        className="ms-sound-button"
        type="button"
        aria-pressed={state === "on"}
        aria-busy={state === "starting"}
        aria-label={`${label}: ${state === "on" || state === "starting" ? "mute soundtrack and effects" : "play continuous detective soundtrack"}`}
        title={
          message ||
          (state === "on"
            ? "Music is playing. Check your device's media volume if you cannot hear it."
            : "Continuous original detective music")
        }
        onClick={() => control.current?.toggle()}
      >
        <span aria-hidden="true">{state === "on" ? "◖))" : "◖×"}</span>
        {label}
      </button>
      <span
        className="ms-sound-status"
        role="status"
        style={{
          position: "absolute",
          right: 0,
          bottom: "calc(100% + 10px)",
          width: "min(240px, calc(100vw - 36px))",
          maxWidth: 240,
          boxSizing: "border-box",
          padding: message ? "10px 12px" : 0,
          borderRadius: 8,
          background: "#19181a",
          fontSize: 14,
          lineHeight: 1.45,
          overflowWrap: "anywhere",
        }}
      >
        {message}
      </span>
    </>
  );
}
