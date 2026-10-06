import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EvidenceSheet,
  type EvidenceRecord,
} from "@/components/evidence-sheet";

const record: EvidenceRecord = {
  id: "01",
  kicker: "The journey",
  title: "Following the evidence",
  subtitle: "A public portfolio record",
  status: "In progress",
  summary: "A readable summary.",
  sections: [{ label: "Background", body: "The supporting details." }],
  annotation: "The next question matters.",
};

type MockAnimation = {
  frames: Keyframe[];
  finished: Promise<void>;
  finish: () => void;
  cancel: () => void;
};

let animations: MockAnimation[];
let currentAnimation: MockAnimation | null;
let restoreMethods: (() => void)[];
let trigger: HTMLButtonElement;
let reduced: boolean;
let cues: string[];
const origin = new DOMRect(650, 350, 240, 200);

function replaceProperty(object: object, key: PropertyKey, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(object, key);
  Object.defineProperty(object, key, {
    configurable: true,
    writable: true,
    value,
  });
  restoreMethods.push(() => {
    if (original) Object.defineProperty(object, key, original);
    else Reflect.deleteProperty(object, key);
  });
}

beforeEach(() => {
  animations = [];
  currentAnimation = null;
  restoreMethods = [];
  reduced = false;
  cues = [];
  trigger = document.createElement("button");
  trigger.textContent = "Open folder";
  document.body.append(trigger);
  trigger.focus();

  replaceProperty(window, "scrollX", 0);
  replaceProperty(window, "scrollY", 1480);
  replaceProperty(window, "matchMedia", () => ({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  replaceProperty(document, "elementFromPoint", () => trigger);
  replaceProperty(
    HTMLDialogElement.prototype,
    "showModal",
    function (this: HTMLDialogElement) {
      this.open = true;
    },
  );
  replaceProperty(
    HTMLDialogElement.prototype,
    "close",
    function (this: HTMLDialogElement) {
      this.open = false;
    },
  );
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      if (this === trigger) return origin;
      // A transformed rectangle deliberately differs from the reading position.
      // Returning from an interrupted opening must measure after cancelling it.
      if (currentAnimation) return new DOMRect(630, 290, 260, 220);
      return new DOMRect(100, 50, 800, 650);
    },
  );
  replaceProperty(HTMLElement.prototype, "animate", (frames: Keyframe[]) => {
    let finish!: () => void;
    let reject!: () => void;
    const finished = new Promise<void>((resolve, rejectPromise) => {
      finish = resolve;
      reject = () => rejectPromise(new Error("Animation cancelled"));
    });
    const animation: MockAnimation = {
      frames,
      finished,
      finish,
      cancel: () => {
        if (currentAnimation === animation) currentAnimation = null;
        reject();
      },
    };
    animations.push(animation);
    currentAnimation = animation;
    return animation;
  });
  const onCue = (event: Event) => cues.push((event as CustomEvent).detail.type);
  window.addEventListener("case:cue", onCue);
  restoreMethods.push(() => window.removeEventListener("case:cue", onCue));
});

afterEach(() => {
  cleanup();
  trigger.remove();
  restoreMethods.reverse().forEach((restore) => restore());
  vi.restoreAllMocks();
  document.body.removeAttribute("style");
  document.documentElement.removeAttribute("style");
});

describe("evidence sheet modal lifecycle", () => {
  it("returns an interrupted opening to its original folder on Escape, then restores focus and scroll", async () => {
    document.body.style.paddingRight = "7px";
    document.body.style.overflow = "clip";
    document.documentElement.style.scrollBehavior = "smooth";
    const onClose = vi.fn();
    render(
      <EvidenceSheet evidence={record} origin={origin} onClose={onClose} />,
    );
    const dialog = screen.getByRole("dialog");

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Close" }),
    );
    expect(window.scrollY).toBe(1480);
    expect(document.body.style.position).not.toBe("fixed");
    expect(cues).toEqual(["page"]);

    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(dialog, cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
    expect(animations).toHaveLength(2);
    expect(animations[1]!.frames.at(-1)!.transform).toBe(
      animations[0]!.frames[0]!.transform,
    );
    // Repeated Escape must not start a second close or send duplicate cues.
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(animations).toHaveLength(2);

    await act(async () => animations[1]!.finish());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(trigger);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 1480);
    expect(document.body.style.paddingRight).toBe("7px");
    expect(document.body.style.overflow).toBe("clip");
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.documentElement.style.scrollBehavior).toBe("smooth");
    expect(cues).toEqual(["page", "close"]);
  });

  it("dismisses a backdrop press instantly for reduced motion, but preserves a drag begun inside the document", () => {
    reduced = true;
    const onClose = vi.fn();
    render(
      <EvidenceSheet evidence={record} origin={origin} onClose={onClose} />,
    );
    const dialog = screen.getByRole("dialog");

    fireEvent.pointerDown(screen.getByText(record.summary));
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(animations).toHaveLength(0);
    expect(document.activeElement).toBe(trigger);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 1480);
  });

  it("cleans up an unmounted opening without completing a stale close callback", async () => {
    const onClose = vi.fn();
    const view = render(
      <EvidenceSheet evidence={record} origin={origin} onClose={onClose} />,
    );
    view.unmount();
    await act(async () => undefined);

    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.activeElement).toBe(trigger);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 1480);
    expect(onClose).not.toHaveBeenCalled();
    expect(currentAnimation).toBeNull();
  });
});
