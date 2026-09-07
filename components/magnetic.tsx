/**
 * Wraps a control so it drifts toward a fine pointer and springs back. The
 * behaviour lives in components/interactions.tsx; this is only the marker.
 */
export function Magnetic({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`magnetic inline-flex transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] ${className}`}
    >
      {children}
    </span>
  );
}
