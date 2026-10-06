import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EvidenceRecord } from "@/components/evidence-sheet";
import { MotionStudy } from "@/components/motion-study";
import { motionStudyContent } from "@/content/motion-study";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}));

// Selection belongs to MotionStudy. Native dialog animation, focus restoration,
// and audio have their own tests; expose only the selected record here.
vi.mock("next/dynamic", () => ({
  default: () =>
    function MockDynamic({
      evidence,
      onClose,
    }: {
      evidence?: EvidenceRecord;
      onClose?: () => void;
    }) {
      if (!evidence) return null;
      return (
        <dialog open aria-label={evidence.title} data-record-id={evidence.id}>
          <h2>{evidence.title}</h2>
          <p>{evidence.summary}</p>
          {evidence.link && (
            <a href={evidence.link.href}>{evidence.link.label}</a>
          )}
          <button type="button" onClick={onClose}>
            Close record
          </button>
        </dialog>
      );
    },
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)",
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  // These tests exercise controls in the reading layout, not the scroll timeline.
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function expectRecord(evidence: EvidenceRecord) {
  const sheet = screen.getByRole("dialog", { name: evidence.title });
  expect(sheet.getAttribute("data-record-id")).toBe(evidence.id);
  expect(within(sheet).getByRole("heading", { level: 2 }).textContent).toBe(
    evidence.title,
  );
  expect(within(sheet).getByText(evidence.summary)).toBeTruthy();
  if (evidence.link) {
    expect(
      within(sheet)
        .getByRole("link", { name: evidence.link.label })
        .getAttribute("href"),
    ).toBe(evidence.link.href);
  }
  return sheet;
}

function closeRecord() {
  fireEvent.click(screen.getByRole("button", { name: "Close record" }));
  expect(screen.queryByRole("dialog")).toBeNull();
}

describe("homepage report selection", () => {
  it("offers ten distinct public reports, including separate Meta and NorthCap records", () => {
    render(<MotionStudy content={motionStudyContent} />);
    expect(
      screen.getAllByRole("button", { name: /^Open report:/ }),
    ).toHaveLength(10);
    const labels = screen
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(labels).toEqual(
      motionStudyContent.findingEvidence.map((report) => report.label),
    );
    expect(labels).toEqual(
      expect.arrayContaining([
        "Blinkit",
        "Google MCP",
        "Meesho",
        "Meta AI",
        "Mapillary",
        "NorthCap web / ERP",
        "NorthCap biometric",
      ]),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.each(motionStudyContent.findingEvidence)(
    "opens the matching $label record directly from its report button",
    ({ previewTitle, evidence }) => {
      render(<MotionStudy content={motionStudyContent} />);
      const button = screen.getByRole("button", {
        name: `Open report: ${previewTitle}`,
      });
      expect(button.getAttribute("aria-haspopup")).toBe("dialog");
      fireEvent.click(button);
      expectRecord(evidence);
      closeRecord();
    },
  );

  it("opens the newly selected report, without opening a sheet merely on selection", () => {
    render(<MotionStudy content={motionStudyContent} />);
    const picker = screen.getByRole("combobox", { name: "Choose a report" });
    // Reverse order and then return to the first report to catch stale selection.
    for (const index of motionStudyContent.findingEvidence
      .map((_, index) => index)
      .reverse()) {
      fireEvent.change(picker, { target: { value: String(index) } });
      expect((picker as HTMLSelectElement).value).toBe(String(index));
      expect(screen.queryByRole("dialog")).toBeNull();
      fireEvent.click(
        screen.getByRole("button", {
          name: "Open selected report",
        }),
      );
      expectRecord(motionStudyContent.findingEvidence[index]!.evidence);
      closeRecord();
    }
  });

  it("keeps the report picker synchronized after using a direct report button", () => {
    render(<MotionStudy content={motionStudyContent} />);
    const selectedIndex = motionStudyContent.findingEvidence.findIndex(
      (report) => report.label === "NorthCap web / ERP",
    );
    const report = motionStudyContent.findingEvidence[selectedIndex]!;
    fireEvent.click(
      screen.getByRole("button", {
        name: `Open report: ${report.previewTitle}`,
      }),
    );
    expectRecord(report.evidence);
    closeRecord();
    expect(
      (
        screen.getByRole("combobox", {
          name: "Choose a report",
        }) as HTMLSelectElement
      ).value,
    ).toBe(String(selectedIndex));
    fireEvent.click(
      screen.getByRole("button", { name: "Open selected report" }),
    );
    expectRecord(report.evidence);
  });

  it("links the top Resume action to the résumé and opens only swiftPentest as a project", () => {
    render(<MotionStudy content={motionStudyContent} />);
    const links = screen.getByRole("navigation", { name: "Quick links" });
    expect(
      within(links).getByRole("link", { name: "Resume" }).getAttribute("href"),
    ).toBe("/resume");
    expect(
      screen.queryByRole("button", {
        name: /Vendor risk|CSCRF|Inspect the project/,
      }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Explore swiftPentest" }),
    );
    expectRecord(motionStudyContent.swiftEvidence);
  });
});

describe("media-change reading position", () => {
  let restoreScrollIntoView = () => {};

  afterEach(() => restoreScrollIntoView());

  function viewportHarness() {
    let compact = false;
    let scrollY = 0;
    let nextFrame = 0;
    const frames = new Map<number, FrameRequestCallback>();
    const mediaListeners = new Set<() => void>();
    const sectionVisits: string[] = [];
    const isStatic = () =>
      document
        .querySelector(".motion-study")
        ?.classList.contains("ms-static") ?? false;
    const sectionTop = (id: string) =>
      id === "ms-contact"
        ? isStatic()
          ? 4000
          : 10000
        : Number(id.replace("ms-static-", "")) * 1000;

    vi.stubGlobal("innerHeight", 900);
    vi.stubGlobal("scrollY", 0);
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return query === "(max-height: 480px)" && compact;
      },
      media: query,
      addEventListener: (_type: string, listener: () => void) => {
        if (query === "(max-height: 480px)") mediaListeners.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) =>
        mediaListeners.delete(listener),
    }));
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      const id = ++nextFrame;
      frames.set(id, callback);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    const updateScroll = (top: number) => {
      scrollY = top;
      vi.stubGlobal("scrollY", top);
      window.dispatchEvent(new Event("scroll"));
    };
    vi.mocked(window.scrollTo).mockImplementation(
      (optionsOrX: ScrollToOptions | number, y?: number) => {
        updateScroll(
          typeof optionsOrX === "number" ? (y ?? 0) : (optionsOrX.top ?? 0),
        );
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
      function (this: HTMLElement) {
        return this.classList.contains("ms-sequence")
          ? isStatic()
            ? 4000
            : 10000
          : 300;
      },
    );
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        if (this.classList.contains("ms-sequence"))
          return new DOMRect(0, -scrollY, 400, isStatic() ? 4000 : 10000);
        if (this.id.startsWith("ms-static-") || this.id === "ms-contact")
          return new DOMRect(
            0,
            sectionTop(this.id) - scrollY,
            400,
            this.id === "ms-contact" ? 900 : 500,
          );
        return new DOMRect(0, 0, 400, 300);
      },
    );
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollIntoView",
    );
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: function (this: HTMLElement) {
        sectionVisits.push(this.id);
        updateScroll(sectionTop(this.id));
      },
    });
    restoreScrollIntoView = () => {
      if (descriptor)
        Object.defineProperty(
          HTMLElement.prototype,
          "scrollIntoView",
          descriptor,
        );
      else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
    };

    const flushFrames = () => {
      // A layout switch schedules its scroll restoration, then one scroll frame.
      for (let pass = 0; pass < 4 && frames.size; pass += 1) {
        act(() => {
          const callbacks = [...frames.values()];
          frames.clear();
          callbacks.forEach((callback) => callback(0));
        });
      }
    };
    return {
      sectionVisits,
      flushFrames,
      scrollY: () => scrollY,
      contactTop: () => sectionTop("ms-contact"),
      rotate(toCompact: boolean) {
        act(() => {
          compact = toCompact;
          vi.stubGlobal("innerHeight", compact ? 400 : 900);
          mediaListeners.forEach((listener) => listener());
        });
        flushFrames();
      },
    };
  }

  it("keeps the latest chapter when rotating to reading view and back", () => {
    const viewport = viewportHarness();
    render(<MotionStudy content={motionStudyContent} />);
    viewport.flushFrames(); // Complete initial hash setup before rotating.
    const chapters = screen.getByRole("navigation", { name: "Story chapters" });
    fireEvent.click(
      within(chapters).getByRole("button", { name: "The evidence" }),
    );
    viewport.flushFrames();
    expect(
      within(chapters)
        .getByRole("button", { name: "The evidence" })
        .getAttribute("aria-current"),
    ).toBe("step");

    viewport.rotate(true);
    expect(viewport.sectionVisits.at(-1)).toBe("ms-static-2");
    expect(viewport.scrollY()).toBe(2000);
    expect(screen.getByRole("main").classList.contains("ms-static")).toBe(true);

    viewport.rotate(false);
    expect(screen.getByRole("main").classList.contains("ms-static")).toBe(
      false,
    );
    expect(
      within(chapters)
        .getByRole("button", { name: "The evidence" })
        .getAttribute("aria-current"),
    ).toBe("step");
    expect(viewport.scrollY()).toBeGreaterThan(5000);
  });

  it("keeps contact in view across both layout changes instead of returning to chapter three", () => {
    const viewport = viewportHarness();
    render(<MotionStudy content={motionStudyContent} />);
    viewport.flushFrames();
    act(() => window.scrollTo({ top: viewport.contactTop() }));
    viewport.flushFrames();

    viewport.rotate(true);
    expect(viewport.sectionVisits.at(-1)).toBe("ms-contact");
    expect(viewport.scrollY()).toBe(viewport.contactTop());

    viewport.rotate(false);
    expect(viewport.sectionVisits.at(-1)).toBe("ms-contact");
    expect(viewport.scrollY()).toBe(viewport.contactTop());
  });
});
