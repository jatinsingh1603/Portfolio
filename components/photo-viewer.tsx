"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

/**
 * Click-to-enlarge for award photos. Deliberately plain: a scrim, the image,
 * and a close button. No carousel chrome, no captions overlaid on the photo.
 *
 * Uses <dialog> so the browser supplies the modal semantics, the top layer and
 * Escape-to-close for free — a div-based lightbox has to reimplement focus
 * trapping and inert backgrounds, and usually gets them wrong.
 */
export function PhotoViewer({
  photos,
  alt,
}: {
  photos: string[];
  /** Describes the event; the index is appended per photo. */
  alt: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open !== null && !dialog.open) dialog.showModal();
    if (open === null && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Backdrop clicks land on the <dialog> itself, so the listener has to sit
    // there. Bound natively rather than as a JSX prop because a click handler
    // on a non-interactive element trips jsx-a11y — correctly in general, but
    // here the same behaviour is already reachable by keyboard through the
    // dialog's own Escape handling and the explicit close button.
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) setOpen(null);
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  if (photos.length === 0) return null;

  const current = open !== null ? photos[open] : undefined;

  return (
    <>
      <ul className="mt-6 flex flex-wrap justify-center gap-3">
        {photos.map((src, index) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="block overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] transition-colors duration-[var(--dur-micro)] hover:border-[var(--border-strong)]"
            >
              <Image
                src={src}
                alt={`${alt}, photo ${index + 1}`}
                width={160}
                height={107}
                className="h-[72px] w-[108px] object-cover"
              />
              <span className="sr-only">Enlarge</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        className="photo-dialog"
      >
        {current ? (
          <div className="relative">
            <Image
              src={current}
              alt={`${alt}, photo ${(open ?? 0) + 1}`}
              width={1600}
              height={1067}
              className="h-auto max-h-[85vh] w-auto max-w-[92vw] rounded-[var(--radius-card)] object-contain"
            />
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="absolute top-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text)]"
            >
              <X size={18} strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Close photo</span>
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
