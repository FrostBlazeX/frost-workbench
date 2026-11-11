import type { ChangeEvent, KeyboardEvent, SubmitEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useControllableState } from "../../hooks/use-controllable-state";

const STOP_CLICK_GUARD_MS = 500;

export type ChatStatus = "idle" | "submitting" | "streaming" | "disabled";

export type ComposerProps = {
  className?: string;
  status: ChatStatus;
  onSubmit: (text: string) => void;
  onStop: () => void;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
};

export function useComposer({
  status,
  onSubmit,
  onStop,
  value,
  defaultValue = "",
  onValueChange,
  placeholder,
  label = "Message",
}: ComposerProps) {
  const [text, setText] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stopAppearedAtRef = useRef<number | null>(null);

  const isBusy = status === "submitting" || status === "streaming";
  const isDisabled = status === "disabled";
  const isEmpty = !text.trim();

  useEffect(() => {
    if (isBusy) {
      stopAppearedAtRef.current = Date.now();
    } else {
      stopAppearedAtRef.current = null;
    }
  }, [isBusy]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Resize when text changes.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const maxHeight = Number.parseFloat(getComputedStyle(textarea).maxHeight);
    const nextHeight = Number.isFinite(maxHeight)
      ? Math.min(textarea.scrollHeight, maxHeight)
      : textarea.scrollHeight;

    textarea.style.height = `${nextHeight}px`;
  }, [text]);

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isDisabled || isBusy) return;

      const trimmed = text.trim();

      if (!trimmed) return;

      setText("");
      textareaRef.current?.focus();

      onSubmit(trimmed);
    },
    [isDisabled, isBusy, text, setText, onSubmit],
  );

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;

    if (event.shiftKey) return;

    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
      return;
    }

    event.preventDefault();

    event.currentTarget.form?.requestSubmit();
  }, []);

  const handleButtonClick = useCallback(() => {
    if (!isBusy) return;

    const stopAppearedAt = stopAppearedAtRef.current;

    if (stopAppearedAt === null || Date.now() - stopAppearedAt < STOP_CLICK_GUARD_MS) {
      return;
    }

    onStop();
  }, [isBusy, onStop]);

  return {
    formProps: {
      onSubmit: handleSubmit,
    },

    textareaProps: {
      ref: textareaRef,
      value: text,
      onChange: (event: ChangeEvent<HTMLTextAreaElement>) => setText(event.target.value),
      onKeyDown: handleKeyDown,
      placeholder,
      "aria-label": label,
      disabled: isDisabled,
      rows: 1,
    },

    buttonProps: {
      type: isBusy ? ("button" as const) : ("submit" as const),
      onClick: handleButtonClick,
      disabled: isDisabled || (!isBusy && isEmpty),
      "aria-label": isBusy ? "Stop generating" : "Send message",
    },

    buttonLabel: isBusy ? "Stop" : "Send",

    isBusy,
    isDisabled,
    textareaRef,
  };
}
