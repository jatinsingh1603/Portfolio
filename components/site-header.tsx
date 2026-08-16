"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { identity, nav } from "@/content/site";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // The hairline appears after 8px of scroll — its opacity animates, never
    // its width, so the bar never shifts the layout beneath it.
    const onScroll = () => setScrolled(window.scrollY > 8);
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

      // Focus trap: the sheet is a dialog, so tabbing must cycle inside it.
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
    <header className="sticky top-0 z-50">
      <div
        className="border-b transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]"
        style={{
          // Apple's actual nav treatment; the only backdrop-filter on the site.
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          backgroundColor: "color-mix(in oklab, var(--bg) 72%, transparent)",
          borderColor: scrolled ? "var(--border)" : "transparent",
        }}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-12 w-full items-center justify-between px-[var(--gutter)]"
          style={{ maxWidth: "var(--container-wide)" }}
        >
          <Link
            href="/"
            className="font-medium tracking-[-0.02em]"
            style={{ fontSize: "0.9375rem" }}
          >
            {identity.shortName}
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="t-small text-[var(--text-secondary)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--text)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/resume"
              className="hidden h-9 items-center rounded-full border border-[var(--border-strong)] px-4 text-[0.9375rem] transition-colors duration-[var(--dur-micro)] hover:bg-[var(--bg-subtle)] lg:inline-flex"
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
          className="border-b border-[var(--border)] bg-[var(--bg)] lg:hidden"
          style={{
            animation: "sheet-in var(--dur-fast) var(--ease-emphasized)",
          }}
        >
          <ul className="mx-auto flex w-full flex-col px-[var(--gutter)] py-2">
            {[...nav, { label: "Résumé", href: "/resume" }].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center border-b border-[var(--border)] text-[1.0625rem] last:border-0"
                >
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
