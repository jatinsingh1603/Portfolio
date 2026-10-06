"use client";

import { useEffect, useId, useRef } from "react";
import "@/app/evidence-sheet.css";

export type EvidenceRecord = {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  status: string;
  summary: string;
  sections: { label: string; body: string }[];
  annotation: string;
  link?: { href: string; label: string };
};

type EvidenceSheetProps = {
  evidence: EvidenceRecord | null;
  origin: DOMRect | null;
  onClose: () => void;
};

function preserveStyles(element: HTMLElement, properties: string[]) {
  const saved = properties.map((property) => ({
    property,
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
  }));
  return () => {
    for (const { property, value, priority } of saved) {
      if (value) element.style.setProperty(property, value, priority);
      else element.style.removeProperty(property);
    }
  };
}

/** Each new record gets its own native modal and restores its own opener. */
export function EvidenceSheet(props: EvidenceSheetProps) {
  if (!props.evidence) return null;
  return (
    <EvidenceSheetDialog
      key={props.evidence.id}
      evidence={props.evidence}
      origin={props.origin}
      onClose={props.onClose}
    />
  );
}

function EvidenceSheetDialog({
  evidence,
  origin,
  onClose,
}: EvidenceSheetProps & { evidence: EvidenceRecord }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const paperRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const originRef = useRef(origin);
  const onCloseRef = useRef(onClose);
  const requestCloseRef = useRef<() => void>(() => undefined);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const paper = paperRef.current;
    if (!dialog || !paper) return;

    const initialOrigin = originRef.current;
    const scroll = { x: window.scrollX, y: window.scrollY };
    const focused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    // Some touch browsers do not focus a tapped button. Recover that opener
    // from its supplied bounds before the dialog enters the top layer.
    const hit = initialOrigin
      ? document.elementFromPoint(
          initialOrigin.left + initialOrigin.width / 2,
          initialOrigin.top + initialOrigin.height / 2,
        )
      : null;
    const trigger =
      hit?.closest<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      ) ?? focused;
    const body = document.body;
    const html = document.documentElement;
    const restoreBody = preserveStyles(body, ["padding-right"]);
    const restoreRoot = preserveStyles(html, [
      "overflow",
      "overscroll-behavior",
    ]);
    const scrollbar = window.innerWidth - html.clientWidth;
    const padding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
    let restored = false;
    let disposed = false;
    let closing = false;
    let animation: Animation | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const restorePage = () => {
      if (restored) return;
      restored = true;
      const restoreScrollBehavior = preserveStyles(html, ["scroll-behavior"]);
      html.style.setProperty("scroll-behavior", "auto", "important");
      restoreBody();
      restoreRoot();
      window.scrollTo(scroll.x, scroll.y);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      window.scrollTo(scroll.x, scroll.y);
      restoreScrollBehavior();
    };

    // Keep the document in its original coordinate space. Fixing the body
    // resets scrollY and moves scroll-driven sticky scenes under the modal.
    // Lock only the root, so the body cannot become a new sticky container.
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    if (scrollbar > 0) body.style.paddingRight = `${padding + scrollbar}px`;

    dialog.showModal();
    closeButtonRef.current?.focus({ preventScroll: true });
    dialog.dataset.phase = "open";
    window.dispatchEvent(
      new CustomEvent("case:cue", { detail: { type: "page" } }),
    );

    const folderTransform = (rect: DOMRect | null, lifted = false) => {
      if (!rect || rect.width <= 0 || rect.height <= 0) {
        return `translateY(${lifted ? 12 : 36}px) scale(${lifted ? 0.97 : 0.93})`;
      }
      const target = paper.getBoundingClientRect();
      const scale = Math.min(0.72, Math.max(0.12, rect.width / target.width));
      const x = rect.left + rect.width / 2 - (target.left + target.width / 2);
      const y =
        rect.top + rect.height * 0.38 - (target.top + target.height / 2);
      return `translate(${x}px, ${y - (lifted ? 64 : 0)}px) rotate(${lifted ? -3 : -7}deg) scale(${scale * (lifted ? 1.08 : 1)})`;
    };

    if (!reduced.matches && typeof paper.animate === "function") {
      const start = folderTransform(initialOrigin);
      const lifted = folderTransform(initialOrigin, true);
      const opening = paper.animate(
        [
          { transform: start, opacity: 0 },
          { transform: lifted, opacity: 1, offset: 0.28 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 620, easing: "cubic-bezier(.2,.72,.2,1)", fill: "both" },
      );
      animation = opening;
      void opening.finished.then(
        () => {
          if (!disposed && animation === opening) {
            opening.cancel();
            animation = null;
          }
        },
        () => undefined,
      );
    }

    const finishClose = () => {
      if (disposed) return;
      animation?.cancel();
      animation = null;
      if (dialog.open) dialog.close();
      restorePage();
      onCloseRef.current();
    };

    requestCloseRef.current = () => {
      if (closing || disposed) return;
      closing = true;
      dialog.dataset.phase = "closing";
      window.dispatchEvent(
        new CustomEvent("case:cue", { detail: { type: "close" } }),
      );
      if (reduced.matches || typeof paper.animate !== "function") {
        finishClose();
        return;
      }
      const current = getComputedStyle(paper);
      const from = { transform: current.transform, opacity: current.opacity };
      // Capture the visible frame first, then measure the untransformed paper.
      // This also makes Escape during the opening animation return correctly.
      animation?.cancel();
      const destination = trigger?.isConnected
        ? trigger.getBoundingClientRect()
        : initialOrigin;
      const tucked = folderTransform(destination);
      const lifted = folderTransform(destination, true);
      const returning = paper.animate(
        [
          from,
          { transform: lifted, opacity: 1, offset: 0.68 },
          { transform: tucked, opacity: 0 },
        ],
        { duration: 420, easing: "cubic-bezier(.4,0,.3,1)", fill: "both" },
      );
      animation = returning;
      void returning.finished.then(finishClose, () => undefined);
    };

    const onMotionChange = () => {
      if (!reduced.matches) return;
      animation?.cancel();
      animation = null;
      if (closing) finishClose();
    };
    // Native cancel handles Escape. A backdrop dismissal must also begin
    // outside the paper, so text selection cannot accidentally close it.
    let backdropPointer = false;
    const onBackdropPointerDown = (event: PointerEvent) => {
      backdropPointer = event.target === dialog;
    };
    const onBackdropClick = (event: MouseEvent) => {
      if (backdropPointer && event.target === dialog) requestCloseRef.current();
      backdropPointer = false;
    };
    dialog.addEventListener("pointerdown", onBackdropPointerDown);
    dialog.addEventListener("click", onBackdropClick);
    reduced.addEventListener("change", onMotionChange);

    return () => {
      disposed = true;
      requestCloseRef.current = () => undefined;
      dialog.removeEventListener("pointerdown", onBackdropPointerDown);
      dialog.removeEventListener("click", onBackdropClick);
      reduced.removeEventListener("change", onMotionChange);
      animation?.cancel();
      if (dialog.open) dialog.close();
      restorePage();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="evidence-sheet-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestCloseRef.current();
      }}
    >
      <div className="evidence-sheet-stage">
        <div className="evidence-sheet-folder" aria-hidden="true">
          <span>Case file / {evidence.id}</span>
        </div>
        <article className="evidence-sheet-paper" ref={paperRef}>
          <div className="evidence-sheet-toolbar">
            <span>{evidence.id} / Public record</span>
            <button
              ref={closeButtonRef}
              type="button"
              className="evidence-sheet-close"
              onClick={() => requestCloseRef.current()}
            >
              Close <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="evidence-sheet-content">
            <header className="evidence-sheet-heading">
              <p className="evidence-sheet-kicker">{evidence.kicker}</p>
              <h2 id={titleId}>{evidence.title}</h2>
              <p className="evidence-sheet-subtitle">{evidence.subtitle}</p>
              <p className="evidence-sheet-status">
                <span>Status</span> {evidence.status}
              </p>
            </header>
            <p className="evidence-sheet-summary">{evidence.summary}</p>
            {evidence.sections.map((section, index) => (
              <section
                className="evidence-sheet-section"
                key={`${section.label}-${index}`}
              >
                <h3>{section.label}</h3>
                <p>{section.body}</p>
              </section>
            ))}
            <aside className="evidence-sheet-annotation">
              <span>Investigator’s note</span>
              <p>{evidence.annotation}</p>
            </aside>
            {evidence.link ? (
              <a className="evidence-sheet-source" href={evidence.link.href}>
                {evidence.link.label}
              </a>
            ) : null}
            <p className="evidence-sheet-end">End of record / {evidence.id}</p>
          </div>
        </article>
      </div>
    </dialog>
  );
}
