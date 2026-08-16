"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";

type Choice = "system" | "light" | "dark";

const options: { value: Choice; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

function apply(choice: Choice) {
  const resolved =
    choice === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : choice;
  document.documentElement.setAttribute("data-theme", resolved);
}

export function ThemeToggle() {
  // Starts as null so the server and client agree on first paint; the real
  // choice is read after mount. The pre-paint script has already applied the
  // correct theme by then, so there is no flash either way.
  const [choice, setChoice] = useState<Choice | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    setChoice(stored === "light" || stored === "dark" ? stored : "system");
  }, []);

  useEffect(() => {
    if (choice !== "system") return;
    // Only track the OS while the user is actually deferring to it.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [choice]);

  function select(next: Choice) {
    // macOS cross-fades an appearance change rather than snapping. The class is
    // added only for the duration of the switch so it never affects first paint.
    const root = document.documentElement;
    root.classList.add("theme-switching");
    window.setTimeout(() => root.classList.remove("theme-switching"), 300);

    setChoice(next);
    if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);
    apply(next);
  }

  return (
    <fieldset className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] p-1">
      <legend className="sr-only">Colour theme</legend>
      {options.map(({ value, label, Icon }) => {
        const active = choice === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => select(value)}
            aria-pressed={active}
            title={label}
            /* 44px — the §2.5 touch target floor, not the visual size of the pill. */
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]"
            style={{
              backgroundColor: active ? "var(--bg-subtle)" : "transparent",
              color: active ? "var(--text)" : "var(--text-tertiary)",
            }}
          >
            <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </fieldset>
  );
}
