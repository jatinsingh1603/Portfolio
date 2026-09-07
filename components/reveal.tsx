import type { CSSProperties } from "react";

/**
 * The site's entrance animation: opacity 0→1 with a 24px rise (planes also
 * tip back from 6°), fired once when the element leads into view. This is a
 * plain server-rendered element; a single client controller
 * (components/interactions.tsx) observes every `[data-reveal]` on the page,
 * so a page with sixty reveals hydrates one component, not sixty.
 *
 * Reduced motion and no-JS are handled in CSS: content is always visible.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  style,
}: {
  children: React.ReactNode;
  /** Stagger in ms. Cap groups at 6 — past that, reveal as one unit. */
  delay?: number;
  as?: "div" | "section" | "li" | "tr" | "article" | "figure";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Tag
      data-reveal="out"
      style={{ ...(delay ? { transitionDelay: `${delay}ms` } : {}), ...style }}
      className={className}
    >
      {children}
    </Tag>
  );
}
