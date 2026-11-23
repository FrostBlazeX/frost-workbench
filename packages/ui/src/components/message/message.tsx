import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import type { MessageProps } from "./message.types";

function Message(props: MessageProps) {
  const isUser = props.author === "user";
  if (isUser) {
    const isFailed = props.status === "failed";
    const onEdit = props.onEdit;
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
            <p className="mt-2 text-sm text-danger" role="status">
              Not sent
            </p>
          )}

          {!isFailed && onEdit && (
            <div className="mt-2 flex justify-end">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { content, status, waitingLabel = "Thinking...", errorMessage, onRetry } = props;
  return (
    <div className="w-full">
      <span className="sr-only">Assistant:</span>

      {status === "waiting" ? (
        <div
          className="flex items-center gap-2 text-sm text-fg-muted"
          role="status"
          aria-live="polite"
        >
          <span
            className="size-2 motion-safe:animate-pulse rounded-full bg-accent"
            aria-hidden="true"
          />
          {waitingLabel}
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
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-danger">
            <span aria-hidden="true">!</span>
            <span>{errorMessage ?? "Something went wrong."}</span>
          </div>

          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export { Message };
