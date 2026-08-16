import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Width = "text" | "default" | "wide";

const widths: Record<Width, string> = {
  text: "var(--container-text)",
  default: "var(--container)",
  wide: "var(--container-wide)",
};

/** Centres content in one of three fixed measures. Never a bare max-w-* class. */
export function Container({
  width = "default",
  className = "",
  children,
}: {
  width?: Width;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`mx-auto w-full px-[var(--gutter)] ${className}`}
      style={{ maxWidth: widths[width] }}
    >
      {children}
    </div>
  );
}

/**
 * One idea per viewport. `wash` paints the full-bleed band; the container
 * inside keeps the optical left edge identical across every section, which is
 * most of what makes a long page read as one document.
 */
export function Section({
  id,
  title,
  eyebrow,
  wash = false,
  width = "default",
  className = "",
  children,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  wash?: boolean;
  width?: Width;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`py-[var(--section-y)] ${wash ? "bg-[var(--bg-subtle)]" : ""} ${className}`}
    >
      <Container width={width}>
        {eyebrow ? <p className="t-caption mb-3">{eyebrow}</p> : null}
        <h2 id={`${id}-heading`} className="t-h2">
          {title}
        </h2>
        {children}
      </Container>
    </section>
  );
}

/** Hairline, no fill, no icon. The site's only chip form. */
export function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  /** Severity tone tints the text and border only — never a filled block. */
  tone?: "critical" | "high" | "medium" | "low" | "info";
}) {
  const color = tone ? `var(--sev-${tone})` : undefined;
  return (
    <span
      className="t-caption inline-flex items-center rounded-[var(--radius-chip)] border px-2.5 py-1 whitespace-nowrap"
      style={{
        color: color ?? "var(--text-secondary)",
        borderColor: color
          ? `color-mix(in oklab, ${color} 40%, transparent)`
          : "var(--border-strong)",
      }}
    >
      {children}
    </span>
  );
}

const buttonBase =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-card)] px-5 text-[0.9375rem] font-medium transition-colors duration-[var(--dur-micro)] ease-[var(--ease-standard)]";

export function Button({
  href,
  variant = "primary",
  external = false,
  download = false,
  children,
  className = "",
}: {
  href: string;
  variant?: "primary" | "secondary";
  external?: boolean;
  download?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent-hover)]"
      : "border border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--bg-subtle)]";

  if (external || download) {
    return (
      <a
        href={href}
        {...(download ? { download: "" } : {})}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`${buttonBase} ${styles} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`${buttonBase} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

/**
 * Every off-site link routes through here so `noopener noreferrer` and an
 * accessible name naming the destination can never be forgotten.
 */
export function ExternalLink({
  href,
  label,
  children,
  className = "",
  showIcon = true,
}: {
  href: string;
  /** Destination in plain words, e.g. "GitHub profile". */
  label: string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      className={`group inline-flex items-center gap-1 text-[var(--accent)] underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:underline ${className}`}
    >
      {children}
      {showIcon ? (
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          aria-hidden="true"
          className="shrink-0"
        />
      ) : null}
    </a>
  );
}
