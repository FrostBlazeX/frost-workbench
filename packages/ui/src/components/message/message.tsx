import { cn } from "../../lib/cn";
import type { MessageProps } from "./message.types";

function Message(props: MessageProps) {
  const isUser = props.author === "user";
  if (isUser) {
    const isFailed = props.status === "failed";

    return (
      <div className="flex w-full justify-end">
        <div
          className={cn(
            "max-w-[85%] rounded-lg px-4 py-3",
            "bg-accent-muted text-fg",
            isFailed && "border border-danger",
          )}
        >
          <span className="sr-only">You:</span>

          <p className="whitespace-pre-wrap">{props.content}</p>

          {isFailed && (
            <div className="mt-2 flex items-center gap-2 text-sm text-danger">
              <span aria-hidden="true">!</span>
              <span>Not sent</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { content, status } = props;

  return (
    <div className="w-full">
      <span className="sr-only">Assistant:</span>

      {status === "waiting" ? (
        <div className="flex items-center gap-2 text-sm text-fg-muted">
          <span
            className="size-2 motion-safe:animate-pulse rounded-full bg-accent"
            aria-hidden="true"
          />
          Thinking...
        </div>
      ) : (
        <p className="whitespace-pre-wrap">
          {content}
          {status === "streaming" && (
            <span className="ml-2 inline-flex items-center align-middle">
              <span
                className="size-2 motion-safe:animate-pulse rounded-full bg-accent"
                aria-hidden="true"
              />
              <span className="sr-only">Generating response</span>
            </span>
          )}
        </p>
      )}

      {status === "stopped" && <p className="mt-2 text-sm text-fg-muted">Generation stopped</p>}

      {status === "error" && (
        <div className="mt-2 flex items-center gap-2 text-sm text-danger">
          <span aria-hidden="true">!</span>
          <span>Something went wrong.</span>
        </div>
      )}
    </div>
  );
}

export { Message };
