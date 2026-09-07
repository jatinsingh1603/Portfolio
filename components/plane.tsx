import Link from "next/link";

/**
 * A panel that lives in perspective: it tilts toward the pointer inside a
 * `.perspective` parent and carries a specular that follows it. The tilt is
 * driven by one delegated pointer handler in components/interactions.tsx, so
 * this stays a server component. Renders as a link when `href` is given.
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
  const cls = `plane panel ${raised ? "panel--raised" : ""} block ${className}`;

  if (href?.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label ? `${label} (opens in a new tab)` : undefined}
        className={cls}
      >
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} aria-label={label} className={cls}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}
