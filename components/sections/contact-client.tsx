"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The copy-to-clipboard control beside the email address. Progressive
 * enhancement only: the mailto link in the server component is the primary
 * route, so this receives just the address as a plain prop and never touches
 * the content modules or the primitives. Success is announced in an
 * aria-live="polite" region so it reaches assistive technology.
 */
export function ContactCopy({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-3">
      <button type="button" onClick={copy} className="btn btn--ghost">
        {copied ? "Copied" : "Copy"}
      </button>
      <span aria-live="polite" className="t-caption">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </span>
  );
}
