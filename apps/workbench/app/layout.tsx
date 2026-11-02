import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frost Workbench",
  description: "A workbench for a RAG app and a tool-using agent.",
};

// Runs before first paint, so a returning dark-mode visitor never sees a white flash.
// It must be plain inline JS: React hasn't loaded yet when it runs.
const themeScript = `(() => {
  try {
    const stored = localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch {}
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The script above may add .dark before React hydrates; this tells React that's expected.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string we control, needed before hydration */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <span className="font-semibold tracking-tight">
              Frost <span className="text-fg-muted">Workbench</span>
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="mx-auto max-w-5xl px-4 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
