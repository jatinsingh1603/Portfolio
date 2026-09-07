"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";

type Theme = "light" | "dark";

/**
 * Two states. Dark is the canonical design and the default; light is an
 * explicit choice persisted in localStorage. Starts unknown so the server and
 * client agree on first paint — the pre-paint script has already applied the
 * right theme by the time this reads it.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(
      document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark",
    );
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    const root = document.documentElement;
    root.classList.add("theme-switching");
    window.setTimeout(() => root.classList.remove("theme-switching"), 320);
    root.setAttribute("data-theme", next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setTheme(next);
  }

  const label =
    theme === "light" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--text)] ${className}`}
    >
      {theme === "light" ? (
        <Moon size={18} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Sun size={18} strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}
