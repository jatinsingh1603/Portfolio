"use client";

import Link from "next/link";
import { usePointerTilt } from "@/lib/hooks/use-pointer-tilt";

/**
 * A panel that lives in perspective: it tilts toward the pointer inside a
 * `.perspective` parent and carries a specular that follows it. Renders as a
 * link when `href` is given (internal → next/link, external → new tab).
 * Nothing happens on touch or under reduced motion; the hook returns early.
 */
export function Plane({
  href,
  label,
  raised = false,
  className = "",
  children,
}: {
  href?: string;
  /** Accessible name for link planes whose visible text is not enough. */
  label?: string;
  raised?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, handlers, style } = usePointerTilt(5);
  const cls = `plane panel ${raised ? "panel--raised" : ""} block ${className}`;

  if (href?.startsWith("http")) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label ? `${label} (opens in a new tab)` : undefined}
        className={cls}
        style={style}
        {...handlers}
      >
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        aria-label={label}
        className={cls}
        style={style}
        {...handlers}
      >
        {children}
      </Link>
    );
  }
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={cls}
      style={style}
      {...handlers}
    >
      {children}
    </div>
  );
}
