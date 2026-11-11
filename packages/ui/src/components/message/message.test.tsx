import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

  it("keeps existing content visible when an error occurs", () => {
    render(<Message author="assistant" content="Partial response" status="error" />);

    expect(screen.getByText("Partial response")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
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
