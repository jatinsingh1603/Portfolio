"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { identity, nav } from "@/content/site";
import { ThemeToggle } from "./theme-toggle";

/**
 * Fixed bar: transparent over the hero, glass after 40px. The mobile sheet is
 * a dialog in behaviour — focus-trapped, Escape closes and returns focus to
 * the trigger — which the accessibility suite asserts.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = sheetRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    sheetRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="fixed top-0 right-0 left-[var(--rail)] z-50">
      <div className={`header-bar ${scrolled || open ? "is-scrolled" : ""}`}>
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full items-center justify-between px-[var(--gutter)]"
          style={{ maxWidth: "var(--container-wide)" }}
        >
          <Link
            href="/"
            className="nameplate"
            aria-label={`${identity.name}, home`}
          >
            JKS
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="t-label text-[var(--text-secondary)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--text)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/resume"
              className="btn btn--ghost hidden !min-h-9 !px-4 text-[0.875rem] lg:inline-flex"
            >
              Résumé
            </Link>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            >
              {open ? (
                <X size={20} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
              )}
              <span className="sr-only">
                {open ? "Close menu" : "Open menu"}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          ref={sheetRef}
          className="sheet border-b border-[var(--border)] lg:hidden"
        >
          <ul className="mx-auto flex w-full flex-col px-[var(--gutter)] py-3">
            {[...nav, { label: "Résumé", href: "/resume" }].map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[52px] items-center gap-4 border-b border-[var(--border)] text-[1.125rem] last:border-0"
                >
                  <span className="t-data text-[var(--text-tertiary)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
