import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Composer } from "./composer";
import type { ChatStatus } from "./use-composer";

type HarnessProps = {
  onSubmit: (text: string) => void;
  onStop: () => void;
};

function ComposerHarness({ onSubmit, onStop }: HarnessProps) {
  const [status, setStatus] = useState<ChatStatus>("idle");

  const handleSubmit = (text: string) => {
    onSubmit(text);
    setStatus("submitting");
  };

  return <Composer status={status} onSubmit={handleSubmit} onStop={onStop} />;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Composer", () => {
  it("does not stop generation when Send is double-clicked", async () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();

    const user = userEvent.setup();

    render(<ComposerHarness onSubmit={onSubmit} onStop={onStop} />);

    const textarea = screen.getByRole("textbox", {
      name: "Message",
    });

    await user.type(textarea, "Hello world");

    await user.click(screen.getByRole("button", { name: "Send message" }));

    await user.click(screen.getByRole("button", { name: "Stop generating" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("Hello world");
    expect(onStop).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("");
  });

  it("calls onStop when Stop is clicked after the guard time", async () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();

    const user = userEvent.setup();

    render(<ComposerHarness onSubmit={onSubmit} onStop={onStop} />);

    const textarea = screen.getByRole("textbox", {
      name: "Message",
    });

    await user.type(textarea, "Hello world");

    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(onSubmit).toHaveBeenCalledWith("Hello world");

    // Move the clock forward by the 500ms guard period.
    vi.setSystemTime(Date.now() + 500);

    await user.click(screen.getByRole("button", { name: "Stop generating" }));

    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
