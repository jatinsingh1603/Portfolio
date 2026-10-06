import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CaseSoundtrack } from "@/components/case-soundtrack";

function audioParameter() {
  return {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  };
}

// A minimal Web Audio surface: lifecycle tests do not inspect the composition,
// note pitches, envelopes, node topology, or the number of scheduled voices.
function audioNode() {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
    type: "",
    gain: audioParameter(),
    frequency: audioParameter(),
    detune: audioParameter(),
    buffer: null,
    Q: audioParameter(),
    delayTime: audioParameter(),
    threshold: audioParameter(),
    knee: audioParameter(),
    ratio: audioParameter(),
    attack: audioParameter(),
    release: audioParameter(),
    pan: audioParameter(),
  };
}

let contexts: MockAudioContext[];
let resumeFailure: boolean;
let tabHidden: boolean;

class MockAudioContext extends EventTarget {
  state: AudioContextState = "suspended";
  currentTime = 0;
  sampleRate = 44100;
  scheduledSources = 0;
  destination = audioNode();
  createBiquadFilter = audioNode;
  createDelay = audioNode;
  createGain = audioNode;
  createDynamicsCompressor = audioNode;
  createConvolver = audioNode;
  createBuffer = () => ({ getChannelData: () => new Float32Array(16) });
  createOscillator = () => {
    this.scheduledSources += 1;
    return audioNode();
  };
  createBufferSource = () => {
    this.scheduledSources += 1;
    return audioNode();
  };
  createStereoPanner = audioNode;

  constructor() {
    super();
    contexts.push(this);
  }

  resume = vi.fn(async () => {
    if (resumeFailure) throw new Error("Playback blocked by browser");
    this.state = "running";
    this.dispatchEvent(new Event("statechange"));
  });

  close = vi.fn(async () => {
    this.state = "closed";
    this.dispatchEvent(new Event("statechange"));
  });
}

type PlayBehavior = "allow" | "blocked" | "failure" | "pending";
let playback: PlayBehavior;
let players: MockAudio[];
let activationListeners: { click: EventListener[]; keydown: EventListener[] };

class MockAudio extends EventTarget {
  loop = false;
  preload = "";
  volume = 1;
  muted = false;
  paused = true;
  currentTime = 0;
  error = null;
  constructor(public src = "") {
    super();
    players.push(this);
  }
  play = vi.fn((): Promise<void> => {
    if (playback === "blocked")
      return Promise.reject(
        new DOMException("Gesture required", "NotAllowedError"),
      );
    if (playback === "failure")
      return Promise.reject(
        new DOMException("Decode failure", "NotSupportedError"),
      );
    if (playback === "pending") return new Promise(() => undefined);
    this.paused = false;
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  });
  pause = vi.fn(() => {
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  });
  removeAttribute = vi.fn((attribute: string) => {
    if (attribute === "src") this.src = "";
  });
  load = vi.fn();
}

async function mount() {
  const result = render(<CaseSoundtrack />);
  await act(async () => {});
  return result;
}

async function activate(type: "click" | "keydown" = "click", key = "Enter") {
  // A real browser marks trusted user gestures. jsdom's synthetic DOM events
  // cannot carry that flag, so deliver the platform callback explicitly.
  await act(async () => {
    const event = {
      type,
      key,
      target: document.body,
      isTrusted: true,
    } as unknown as Event;
    activationListeners[type].forEach((listener) => listener(event));
  });
}

function setTabHidden(hidden: boolean) {
  act(() => {
    tabHidden = hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

beforeEach(() => {
  sessionStorage.clear();
  contexts = [];
  players = [];
  playback = "blocked";
  resumeFailure = false;
  tabHidden = false;
  activationListeners = { click: [], keydown: [] };
  vi.useFakeTimers();
  vi.stubGlobal("Audio", MockAudio);
  vi.stubGlobal("AudioContext", MockAudioContext);
  vi.spyOn(document, "hidden", "get").mockImplementation(() => tabHidden);
  const add = window.addEventListener.bind(window);
  vi.spyOn(window, "addEventListener").mockImplementation(
    (type, listener, options) => {
      if (
        (type === "click" || type === "keydown") &&
        typeof listener === "function"
      )
        activationListeners[type].push(listener);
      add(type, listener, options);
    },
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function emitCue(type: unknown) {
  act(() =>
    window.dispatchEvent(new CustomEvent("case:cue", { detail: { type } })),
  );
}

describe("continuous detective music", () => {
  it("attempts the local loop by default and reports actual playback", async () => {
    playback = "allow";
    await mount();
    expect(players).toHaveLength(1);
    expect(players[0]!.src).toBe("/audio/case-notes-score.mp3");
    expect(players[0]!.loop).toBe(true);
    expect(players[0]!.volume).toBeGreaterThanOrEqual(0.7);
    expect(players[0]!.play).toHaveBeenCalledOnce();
    expect(
      screen
        .getByRole("button", { name: /Sound on:/ })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(contexts).toHaveLength(0); // Music never depends on Web Audio startup.
    act(() => vi.advanceTimersByTime(60000));
    expect(players[0]!.paused).toBe(false);
    expect(players[0]!.loop).toBe(true);
    expect(players[0]!.play).toHaveBeenCalledOnce();
  });

  it("shows blocked autoplay honestly, then starts on the first trusted interaction", async () => {
    await mount();
    expect(
      screen
        .getByRole("button", { name: /Play music:/ })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(screen.getByRole("status").textContent).toContain("Tap anywhere");
    expect(screen.getByRole("status").className).not.toContain("sr-only");
    expect(contexts).toHaveLength(0);
    fireEvent.click(document.body);
    expect(players[0]!.play).toHaveBeenCalledOnce();

    playback = "allow";
    await activate();
    expect(players[0]!.play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: /Sound on:/ })).toBeTruthy();
  });

  it("uses activation keys without treating every keystroke as consent", async () => {
    await mount();
    playback = "allow";
    await activate("keydown", "a");
    expect(players[0]!.play).toHaveBeenCalledOnce();
    await activate("keydown", "Enter");
    expect(players[0]!.play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: /Sound on:/ })).toBeTruthy();
  });

  it("remembers explicit mute through scrolling, gestures, and visibility changes", async () => {
    playback = "allow";
    await mount();
    const player = players[0]!;
    player.currentTime = 13;
    fireEvent.click(screen.getByRole("button", { name: /Sound on:/ }));
    expect(player.paused).toBe(true);
    expect(screen.getByRole("button", { name: /Sound off:/ })).toBeTruthy();
    fireEvent.scroll(window);
    await activate();
    setTabHidden(true);
    setTabHidden(false);
    await activate("keydown");
    expect(player.play).toHaveBeenCalledOnce();

    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: /Sound off:/ })),
    );
    expect(player.play).toHaveBeenCalledTimes(2);
    expect(player.currentTime).toBe(13);
    expect(screen.getByRole("button", { name: /Sound on:/ })).toBeTruthy();
  });

  it("can cancel pending autoplay without later gestures undoing that mute", async () => {
    playback = "pending";
    await mount();
    const button = screen.getByRole("button", { name: /Starting/ });
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.hasAttribute("disabled")).toBe(false);
    fireEvent.click(button);
    playback = "allow";
    await activate();
    expect(players[0]!.play).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /Sound off:/ })).toBeTruthy();
    act(() => vi.advanceTimersByTime(0)); // jsdom queues a storage notification.
    expect(vi.getTimerCount()).toBe(0);
  });

  it("times out pending playback and offers an actionable visible retry", async () => {
    playback = "pending";
    await mount();
    act(() => vi.advanceTimersByTime(13000));
    expect(screen.getByRole("button", { name: /Retry music:/ })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("taking too long");
    expect(players[0]!.paused).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    playback = "allow";
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: /Retry music:/ })),
    );
    expect(screen.getByRole("button", { name: /Sound on:/ })).toBeTruthy();
  });

  it("reports failed media decoding visibly and recovers on retry", async () => {
    playback = "failure";
    await mount();
    expect(
      screen
        .getByRole("button", { name: /Retry music:/ })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(screen.getByRole("status").textContent).toContain(
      "Music could not load",
    );
    playback = "allow";
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: /Retry music:/ })),
    );
    expect(screen.getByRole("button", { name: /Sound on:/ })).toBeTruthy();
  });

  it("keeps the music playing even when Web Audio foley fails", async () => {
    await mount();
    resumeFailure = true;
    playback = "allow";
    await activate();
    expect(screen.getByRole("button", { name: /Sound on:/ })).toBeTruthy();
    expect(players[0]!.paused).toBe(false);
    expect(contexts[0]!.close).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("plays foley over the continuous loop without restarting its music", async () => {
    await mount();
    playback = "allow";
    await activate();
    const context = contexts[0]!;
    const playCalls = players[0]!.play.mock.calls.length;
    for (const type of ["tick", "unlock", "page", "close", "transition"]) {
      const before = context.scheduledSources;
      emitCue(type);
      expect(context.scheduledSources, type).toBeGreaterThan(before);
    }
    expect(players[0]!.play).toHaveBeenCalledTimes(playCalls);
    const after = context.scheduledSources;
    fireEvent.click(screen.getByRole("button", { name: /Sound on:/ }));
    emitCue("unlock");
    expect(context.scheduledSources).toBe(after);
    expect(context.close).toHaveBeenCalledOnce();
  });

  it("pauses hidden tabs, resumes permitted music on return, and cleans up on unmount", async () => {
    const { unmount } = await mount();
    playback = "allow";
    await activate();
    setTabHidden(true);
    expect(players[0]!.paused).toBe(true);
    expect(contexts[0]!.close).toHaveBeenCalledOnce();
    setTabHidden(false);
    expect(players[0]!.play).toHaveBeenCalledTimes(3);
    await activate(); // Re-enable the optional foley layer after its interruption.
    expect(players[0]!.play).toHaveBeenCalledTimes(3);
    unmount();
    expect(players[0]!.paused).toBe(true);
    expect(players[0]!.src).toBe("");
    expect(players[0]!.load).toHaveBeenCalledOnce();
    expect(contexts[1]!.close).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps an explicit mute after remount and saves an explicit unmute", async () => {
    playback = "allow";
    const first = await mount();
    fireEvent.click(screen.getByRole("button", { name: /Sound on:/ }));
    expect(sessionStorage.getItem("jatin:case-soundtrack:muted")).toBe("1");
    first.unmount();

    const second = await mount();
    expect(players[1]!.play).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Sound off:/ })).toBeTruthy();
    await activate();
    expect(players[1]!.play).not.toHaveBeenCalled();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: /Sound off:/ })),
    );
    expect(sessionStorage.getItem("jatin:case-soundtrack:muted")).toBe("0");
    second.unmount();

    await mount();
    expect(players[2]!.play).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /Sound on:/ })).toBeTruthy();
  });

  it("remains usable when reading or writing session storage is denied", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage denied", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage denied", "SecurityError");
    });
    playback = "allow";
    await mount();
    expect(players[0]!.play).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: /Sound on:/ }));
    await activate();
    expect(players[0]!.play).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /Sound off:/ })).toBeTruthy();
  });

  it("offers gesture recovery when the browser blocks resuming a visible tab", async () => {
    playback = "allow";
    await mount();
    setTabHidden(true);
    playback = "blocked";
    setTabHidden(false);
    await act(async () => {});
    expect(players[0]!.play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: /Play music:/ })).toBeTruthy();
    const status = screen.getByRole("status");
    expect(status.style.fontSize).toBe("14px");
    expect(status.style.maxWidth).toBe("240px");
    expect(status.style.position).toBe("absolute");
    playback = "allow";
    await activate();
    expect(players[0]!.play).toHaveBeenCalledTimes(3);
    expect(screen.getByRole("button", { name: /Sound on:/ })).toBeTruthy();
  });
});
