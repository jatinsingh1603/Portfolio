import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DetectiveScore } from "@/components/detective-score";

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
  destination = audioNode();
  createBiquadFilter = audioNode;
  createDelay = audioNode;
  createGain = audioNode;
  createDynamicsCompressor = audioNode;
  createOscillator = audioNode;
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

async function turnOn() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Sound off:/ }));
  });
}

function setTabHidden(hidden: boolean) {
  act(() => {
    tabHidden = hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

beforeEach(() => {
  contexts = [];
  resumeFailure = false;
  tabHidden = false;
  vi.useFakeTimers();
  vi.stubGlobal("AudioContext", MockAudioContext);
  vi.spyOn(document, "hidden", "get").mockImplementation(() => tabHidden);
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("opt-in detective soundtrack", () => {
  it("starts off and creates no audio context without a click", () => {
    render(<DetectiveScore />);
    const button = screen.getByRole("button", { name: /Sound off:/ });
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.textContent).toContain("Sound off");

    setTabHidden(true);
    setTabHidden(false);
    act(() => vi.advanceTimersByTime(3000));
    expect(contexts).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("starts on an explicit click and closes playback after toggling off", async () => {
    render(<DetectiveScore />);
    await turnOn();

    expect(contexts).toHaveLength(1);
    const context = contexts[0]!;
    expect(context.resume).toHaveBeenCalledOnce();
    const onButton = screen.getByRole("button", { name: /Sound on:/ });
    expect(onButton.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(onButton);
    expect(
      screen
        .getByRole("button", { name: /Sound off:/ })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    // Allow the short fade to finish; its exact duration is not the contract.
    act(() => vi.advanceTimersByTime(1000));
    expect(context.close).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops when hidden and requires another click after becoming visible", async () => {
    render(<DetectiveScore />);
    await turnOn();
    const original = contexts[0]!;

    setTabHidden(true);
    expect(original.close).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /Sound off:/ })).toBeTruthy();
    expect(vi.getTimerCount()).toBe(0);

    setTabHidden(false);
    act(() => vi.advanceTimersByTime(3000));
    expect(contexts).toHaveLength(1);
    expect(original.resume).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /Sound off:/ })).toBeTruthy();

    await turnOn();
    expect(contexts).toHaveLength(2);
    expect(contexts[1]!.resume).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /Sound on:/ })).toBeTruthy();
  });

  it("announces playback failure, releases resources, and allows retry", async () => {
    resumeFailure = true;
    render(<DetectiveScore />);
    await turnOn();

    expect(screen.getByRole("status").textContent).toContain(
      "Sound could not start",
    );
    const offButton = screen.getByRole("button", { name: /Sound off:/ });
    expect(offButton.getAttribute("aria-pressed")).toBe("false");
    expect(offButton.hasAttribute("disabled")).toBe(false);
    expect(contexts[0]!.close).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);

    resumeFailure = false;
    await turnOn();
    expect(screen.getByRole("button", { name: /Sound on:/ })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("announces unsupported audio without trying to create a context", async () => {
    vi.stubGlobal("AudioContext", undefined);
    render(<DetectiveScore />);
    await turnOn();

    expect(screen.getByRole("status").textContent).toContain(
      "does not support the soundtrack",
    );
    expect(contexts).toHaveLength(0);
    expect(screen.getByRole("button", { name: /Sound off:/ })).toBeTruthy();
  });

  it.each(["playing", "fading"])(
    "closes audio and clears timers when unmounted while %s",
    async (state) => {
      const { unmount } = render(<DetectiveScore />);
      await turnOn();
      const context = contexts[0]!;
      if (state === "fading") {
        fireEvent.click(screen.getByRole("button", { name: /Sound on:/ }));
      }

      unmount();
      expect(context.close).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toBe(0);
      setTabHidden(false);
      expect(contexts).toHaveLength(1);
    },
  );
});
