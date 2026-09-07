import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Severity } from "@/content/schema";
import { STATION_COUNT } from "@/lib/stations";
import { Magnetic } from "./magnetic";
import { Reveal } from "./reveal";

export { Plane } from "./plane";
export { Reveal } from "./reveal";
export { Magnetic } from "./magnetic";

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

export { STATION_COUNT };

/**
 * A station: one section of the volume. Carries the mono index the rail
 * tracks, the display title, an optional lede and the ticked rule that draws
 * in when the station is revealed. `zone` tints the ground behind it.
 */
export function Station({
  index,
  id,
  eyebrow,
  title,
  lede,
  zone = "teal",
  width = "wide",
  className = "",
  children,
}: {
  index: number;
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  zone?: "teal" | "amber";
  width?: Width;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-station={index}
      data-station-label={eyebrow}
      data-zone={zone}
      className={`relative py-[var(--section-y)] ${className}`}
    >
      <Container width={width}>
        <Reveal>
          <p className="t-label">
            Station {String(index).padStart(2, "0")} / {STATION_COUNT}
            <span aria-hidden="true"> · </span>
            <span className="text-[var(--text-secondary)]">{eyebrow}</span>
          </p>
          <h2 id={`${id}-title`} className="t-h2 mt-5 max-w-[22ch]">
            {title}
          </h2>
          {lede ? <p className="t-lede mt-5">{lede}</p> : null}
          <hr className="rule rule--ticked mt-8" aria-hidden="true" />
        </Reveal>
        <div className="mt-12 md:mt-16">{children}</div>
      </Container>
    </section>
  );
}

/** Matte panel on one of two elevation planes. */
export function Panel({
  raised = false,
  className = "",
  as: Tag = "div",
  children,
}: {
  raised?: boolean;
  className?: string;
  as?: "div" | "article" | "li" | "aside";
  children: React.ReactNode;
}) {
  return (
    <Tag className={`panel ${raised ? "panel--raised" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

export function Rule({
  ticked = false,
  className = "",
}: {
  ticked?: boolean;
  className?: string;
}) {
  return (
    <hr
      className={`rule ${ticked ? "rule--ticked" : ""} ${className}`}
      aria-hidden="true"
    />
  );
}

export function MonoLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`t-label ${className}`}>{children}</span>;
}

/** Hairline mono chip. `xref` marks a chip that is cross-referenced elsewhere. */
export function Chip({
  children,
  xref,
  className = "",
}: {
  children: React.ReactNode;
  /** Tooltip text naming where else this appears, e.g. "Used in Recon, Discovery". */
  xref?: string;
  className?: string;
}) {
  return (
    <span
      className={`chip ${xref ? "chip--xref" : ""} ${className}`}
      title={xref}
    >
      {children}
    </span>
  );
}

/** Severity as word + dot + shape. Never colour alone. */
export function SeverityTag({ severity }: { severity: Severity }) {
  return (
    <span
      className={`sev sev--${severity}`}
      style={{ ["--sev" as string]: `var(--sev-${severity})` }}
    >
      <span className="sev__mark" aria-hidden="true" />
      {severity}
    </span>
  );
}

export function Button({
  href,
  variant = "primary",
  external = false,
  download = false,
  magnetic = false,
  children,
  className = "",
}: {
  href: string;
  variant?: "primary" | "ghost";
  external?: boolean;
  download?: boolean;
  magnetic?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = `btn btn--${variant} ${className}`;
  const inner =
    external || download ? (
      <a
        href={href}
        {...(download ? { download: "" } : {})}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={cls}
      >
        {children}
        {external ? (
          <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
        ) : null}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return magnetic ? <Magnetic>{inner}</Magnetic> : inner;
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

/** A register: label (mono) on the left, value on the right. */
export function KeyValue({
  rows,
  className = "",
}: {
  rows: { label: string; value: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={`register ${className}`}>
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="t-label pt-0.5">{row.label}</dt>
          <dd className="t-small">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
