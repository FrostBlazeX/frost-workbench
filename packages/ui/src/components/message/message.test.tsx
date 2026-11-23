import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Message } from "./message";
import type { MessageProps } from "./message.types";

describe("Message", () => {
  it("renders the user speaker label", () => {
    render(<Message author="user" content="Hello" status="sent" />);

    expect(screen.getByText("You:")).toBeInTheDocument();
  });

  it("renders the assistant speaker label", () => {
    render(<Message author="assistant" content="Hello" status="done" />);

    expect(screen.getByText("Assistant:")).toBeInTheDocument();
  });

  it("shows Not sent for a failed user message", () => {
    render(<Message author="user" content="Hello" status="failed" />);

    expect(screen.getByText("Not sent")).toBeInTheDocument();
  });

  it("shows Thinking when the assistant is waiting with no content", () => {
    render(<Message author="assistant" content="" status="waiting" />);

    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("shows Generation stopped for a stopped message", () => {
    render(<Message author="assistant" content="Partial response" status="stopped" />);

    expect(screen.getByText("Generation stopped")).toBeInTheDocument();
  });

  it("does not show a status label for a completed message", () => {
    render(<Message author="assistant" content="Completed response" status="done" />);

    expect(screen.getByText("Completed response")).toBeInTheDocument();
    expect(screen.queryByText("Generation stopped")).not.toBeInTheDocument();
    expect(screen.queryByText("Something went wrong.")).not.toBeInTheDocument();
    expect(screen.queryByText("Thinking...")).not.toBeInTheDocument();
  });

  it("shows the generic fallback for an error without a specific message", () => {
    render(<Message author="assistant" content="" status="error" />);

    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("shows only the specific message when an error message is provided", () => {
    render(<Message author="assistant" content="" status="error" errorMessage="Connection lost" />);

    expect(screen.getByText("Connection lost")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong.")).not.toBeInTheDocument();
  });

  it("keeps partial content visible alongside a specific error", () => {
    render(
      <Message
        author="assistant"
        content="Partial response"
        status="error"
        errorMessage="Connection lost"
      />,
    );

    expect(screen.getByText("Partial response")).toBeInTheDocument();
    expect(screen.getByText("Connection lost")).toBeInTheDocument();
  });

  it("calls onRetry when Try again is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<Message author="assistant" content="" status="error" onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("calls onEdit when Edit is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<Message author="user" content="Original question" status="sent" onEdit={onEdit} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(onEdit).toHaveBeenCalledOnce();
  });

  const messageCases: MessageProps[] = [
    { author: "user", status: "sent", content: "" },
    { author: "assistant", status: "done", content: "" },
  ];

  it.each(messageCases)("preserves line breaks in $author content", (message) => {
    const content = "First line\nSecond line\nThird line";

    const { container } = render(<Message {...message} content={content} />);

    const paragraph = container.querySelector("p");

    expect(paragraph).toHaveClass("whitespace-pre-wrap");
    expect(paragraph?.textContent).toBe(content);
  });
});
