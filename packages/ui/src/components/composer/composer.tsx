import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import type { ComposerProps } from "./use-composer";
import { useComposer } from "./use-composer";

export function Composer({ className, ...props }: ComposerProps) {
  const { formProps, textareaProps, buttonProps, buttonLabel } = useComposer(props);

  return (
    <form
      {...formProps}
      className={cn(
        "flex items-end gap-2 rounded-lg border border-line bg-surface p-3",
        "transition-shadow duration-150",
        "focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <textarea
        {...textareaProps}
        className={cn(
          "min-w-0 flex-1 resize-none bg-transparent outline-none",
          "px-0 py-2 text-fg placeholder:text-fg-muted",
          "max-h-40 overflow-y-auto",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />

      <Button {...buttonProps} size="md">
        {buttonLabel}
      </Button>
    </form>
  );
}
