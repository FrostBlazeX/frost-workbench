import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Chat } from "./chat";
import type { AskOutcome } from "./chat.types";

function askResponse(answer: string, outcome: AskOutcome = "answered") {
  return Response.json({
    answer,
    sources: [],
    outcome,
  });
}

function errorResponse(message: string, status = 429) {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getComposer() {
  return screen.getByRole("textbox", { name: "Message" });
}

async function submitQuestion(user: ReturnType<typeof userEvent.setup>, question: string) {
  const composer = getComposer();

  await user.type(composer, question);
  await user.keyboard("{Enter}");
}

describe("Chat", () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });

    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("submits a question and displays the answer", async () => {
    let resolveFetch!: (response: Response) => void;

    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    fetchMock.mockReturnValueOnce(pendingFetch);

    const user = userEvent.setup();

    render(<Chat />);

    await submitQuestion(user, "What time does happy hour start?");

    expect(screen.getByText("What time does happy hour start?")).toBeInTheDocument();

    expect(await screen.findByText("Thinking...")).toBeInTheDocument();

    await act(async () => {
      resolveFetch(askResponse("Happy hour starts at 5 PM."));
      await pendingFetch;
    });

    expect(await screen.findByText("Happy hour starts at 5 PM.")).toBeInTheDocument();
  });

  it("shows a rate-limit error without marking the user message as failed", async () => {
    fetchMock.mockResolvedValueOnce(errorResponse("Too many requests. Please try again later."));

    const user = userEvent.setup();

    render(<Chat />);

    await submitQuestion(user, "What time does happy hour start?");

    expect(
      await screen.findByText("Too many requests. Please try again later."),
    ).toBeInTheDocument();

    expect(screen.queryByText("Not sent")).not.toBeInTheDocument();
  });

  it("marks the user message as failed when the connection is lost", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const user = userEvent.setup();

    render(<Chat />);

    await submitQuestion(user, "What time does happy hour start?");

    expect(await screen.findByText("Not sent")).toBeInTheDocument();

    expect(
      screen.getByText("Couldn't connect to the server. Check your connection and try again."),
    ).toBeInTheDocument();
  });

  it("retries after a connection loss and displays only the new degraded explanation", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(askResponse("The catalog is temporarily unavailable.", "degraded"));

    const user = userEvent.setup();

    render(<Chat />);

    await submitQuestion(user, "What time does happy hour start?");

    expect(await screen.findByText("Not sent")).toBeInTheDocument();

    expect(
      await screen.findByText(
        "Couldn't connect to the server. Check your connection and try again.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      screen.queryByText("Couldn't connect to the server. Check your connection and try again."),
    ).not.toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(await screen.findAllByText("The catalog is temporarily unavailable.")).toHaveLength(1);
  });

  it("displays a degraded answer only once without the generic error", async () => {
    fetchMock.mockResolvedValueOnce(
      askResponse("The catalog is temporarily unavailable.", "degraded"),
    );

    const user = userEvent.setup();

    render(<Chat />);

    await submitQuestion(user, "What time does happy hour start?");

    expect(await screen.findAllByText("The catalog is temporarily unavailable.")).toHaveLength(1);

    expect(screen.queryByText("Something went wrong.")).not.toBeInTheDocument();
  });

  it("stops generation without marking the user message as failed", async () => {
    fetchMock.mockImplementationOnce(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal;

          if (signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }

          signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    );

    const user = userEvent.setup();

    render(<Chat />);

    await submitQuestion(user, "What time does happy hour start?");

    expect(await screen.findByText("Thinking...")).toBeInTheDocument();

    //Move past Composer's 500ms Stop guard.
    vi.setSystemTime(Date.now() + 500);

    await user.click(screen.getByRole("button", { name: "Stop generating" }));

    expect(await screen.findByText("Generation stopped")).toBeInTheDocument();

    expect(screen.queryByText("Not sent")).not.toBeInTheDocument();
  });

  it("removes later messages and sends the edited question", async () => {
    fetchMock
      .mockResolvedValueOnce(askResponse("First answer."))
      .mockResolvedValueOnce(askResponse("Second answer."))
      .mockResolvedValueOnce(askResponse("Edited answer."));

    const user = userEvent.setup();

    render(<Chat />);

    await submitQuestion(user, "First question");

    expect(await screen.findByText("First answer.")).toBeInTheDocument();

    await submitQuestion(user, "Second question");

    expect(await screen.findByText("Second answer.")).toBeInTheDocument();

    const editButtons = screen.getAllByRole("button", { name: "Edit" });

    expect(editButtons[0]).toBeInTheDocument();
    const firstEditButton = editButtons[0];

    if (!firstEditButton) {
      throw new Error("Expected an Edit button for the first message.");
    }

    await user.click(firstEditButton);

    expect(screen.getByText("Editing your message")).toBeInTheDocument();

    const composer = getComposer();

    await user.clear(composer);
    await user.type(composer, "Edited question");
    await user.keyboard("{Enter}");

    expect(await screen.findByText("Edited answer.")).toBeInTheDocument();

    expect(screen.getByText("Edited question")).toBeInTheDocument();

    expect(screen.queryByText("Second question")).not.toBeInTheDocument();
    expect(screen.queryByText("Second answer.")).not.toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(3);

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/ask",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ question: "Edited question" }),
      }),
    );
  });

  it("shows the server wake-up label after five seconds", async () => {
    vi.useRealTimers();
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout"],
    });

    fetchMock.mockReturnValue(new Promise<Response>(() => {}));

    render(<Chat />);

    const composer = getComposer();

    fireEvent.change(composer, {
      target: { value: "What time does happy hour start?" },
    });

    fireEvent.keyDown(composer, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    expect(screen.getByText("Thinking...")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("Waking up the server...")).toBeInTheDocument();
  });
});
