"use client";

import { useMagnetic } from "@/lib/hooks/use-magnetic";

/** Wraps a control so it drifts toward a fine pointer and springs back. */
export function Magnetic({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, handlers } = useMagnetic(0.22, 8);
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={`inline-flex transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] ${className}`}
      {...handlers}
    >
      {children}
    </span>
  );
}
