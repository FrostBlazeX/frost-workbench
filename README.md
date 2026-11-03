# Frost Workbench

https://frost-workbench.vercel.app/
https://frost-workbench-ui.vercel.app/?path=/docs/primitives-button--docs

A frontend for two AI apps (a RAG service and a GitHub tool agent), built on its own small design system, **Frost UI**.

```
frost-workbench/
├── apps/
│   └── workbench/        Next.js App Router app (deployed to Vercel)
├── packages/
│   └── ui/               Frost UI: tokens, components, Storybook, tests
├── .github/workflows/    CI: lint, typecheck, test, build, Storybook build
├── biome.json            Lint + format for the whole repo
├── tsconfig.base.json    Strict TypeScript settings every package extends
└── turbo.json            Task graph and caching
```

## Stack

- **Monorepo:** pnpm workspaces, Turborepo
- **App:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 7, Tailwind CSS v4
- **Design system:** design tokens as Tailwind v4 theme variables, Radix primitives, Storybook 10 with the a11y addon
- **Testing:** Vitest and Testing Library (Playwright arrives in week 5)
- **Quality:** Biome for linting and formatting, GitHub Actions CI

## Getting started

Requires Node 22+ and Corepack (bundled with Node).

```bash
npm install -g pnpm
pnpm install
pnpm dev                 # workbench on http://localhost:3000
pnpm storybook           # Frost UI on http://localhost:6006
```

## Scripts (run from the repo root)

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `pnpm dev`             | Runs every package's dev server through Turbo |
| `pnpm build`           | Production build of the workbench             |
| `pnpm test`            | Unit tests across the repo                    |
| `pnpm typecheck`       | Type-checks every package                     |
| `pnpm lint`            | Biome lint and format check                   |
| `pnpm format`          | Biome auto-fix and format                     |
| `pnpm storybook`       | Frost UI Storybook in dev mode                |
| `pnpm build-storybook` | Static Storybook build                        |

## How the pieces fit

- `@frost/ui` is an **internal package**: its `exports` point at TypeScript source, and the workbench compiles it via `transpilePackages`. There's no separate build step.
- **Tokens** live in `packages/ui/src/styles/tokens.css`. Raw `--frost-*` values switch under `.dark`, and `@theme inline` maps them to Tailwind utilities (`bg-accent`, `text-fg-muted`, `border-line`).
- That same file declares `@source "../"`, so any app importing the tokens also generates Frost UI's class names.
- **Dark mode** is class-based. An inline script in the root layout applies the saved theme before first paint, so there's no flash.

## Deploying to Vercel

Create two Vercel projects from this repo:

| Project   | Root directory   | Framework preset | Build command          | Output directory   |
| --------- | ---------------- | ---------------- | ---------------------- | ------------------ |
| Workbench | `apps/workbench` | Next.js          | default                | default            |
| Storybook | `packages/ui`    | Other            | `pnpm build-storybook` | `storybook-static` |

Vercel detects pnpm from the lockfile and `packageManager`, and installs the whole workspace even when the root directory is a subfolder.

## Roadmap

1. **Week 1:** foundations: monorepo, tokens, Button, Storybook, CI, deploy ← _you are here_
2. **Weeks 2–3:** RAG chat with streamed answers and citations
3. **Weeks 4–5:** agent runs with a live tool-call timeline
4. **Weeks 6–7:** Frost UI v1: extraction, a11y audit, docs → **v1 ships**
5. **Weeks 8–10:** eval explorer for Promptfoo runs
