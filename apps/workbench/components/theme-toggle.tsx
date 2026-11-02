"use client";

import { Button } from "@frost/ui";
import { useSyncExternalStore } from "react";

// The source of truth is the .dark class on <html>, which lives outside React.
// useSyncExternalStore is React's built-in way to read external state and re-render when it changes.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains("dark");

// The server can't know the theme, so it renders "unknown" and the client fills it in.
// Rendering a guess instead would cause a hydration mismatch for dark-mode visitors.
const getServerSnapshot = () => null;

export function ThemeToggle() {
  const isDark = useSyncExternalStore<boolean | null>(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Storage can be blocked (private mode); the toggle still works for this visit.
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={isDark === null}
      aria-label="Dark theme"
      aria-pressed={isDark ?? undefined}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
