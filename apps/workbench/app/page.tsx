import { Button } from "@frost/ui";

const views = [
  {
    name: "Chat",
    detail: "Ask the RAG app a question and see the sources behind each answer.",
    arrives: "Weeks 2–3",
  },
  {
    name: "Agent runs",
    detail: "Watch the GitHub tool agent call its tools, step by step, as it works.",
    arrives: "Weeks 4–5",
  },
  {
    name: "Evals",
    detail: "Browse Promptfoo runs, filter failures and compare prompt versions.",
    arrives: "Weeks 8–10",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="max-w-2xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          One place to talk to your AI apps and see what they're doing.
        </h1>
        <p className="text-fg-muted text-pretty">
          The shell is live. Each view below lands on the roadmap date shown, built from Frost UI
          components.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button disabled>Start a chat</Button>
          <Button asChild variant="secondary">
            <a href="https://github.com/FrostBlazeX/frost-workbench">View the code</a>
          </Button>
        </div>
      </section>

      <section aria-labelledby="views-heading" className="space-y-4">
        <h2 id="views-heading" className="text-sm font-medium text-fg-muted">
          Coming up
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {views.map((view) => (
            <li key={view.name} className="rounded-lg border border-line bg-surface p-5">
              <p className="font-medium">{view.name}</p>
              <p className="mt-1 text-sm text-fg-muted">{view.detail}</p>
              <p className="mt-4 text-xs font-medium text-accent">{view.arrives}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
