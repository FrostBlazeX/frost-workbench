"use client";

import type { ChatStatus } from "@frost/ui";

import { Button, Composer, Message } from "@frost/ui";
import { useEffect, useRef, useState } from "react";
import type { AskSuccessResponse, MessageItem } from "./chat.types";

function isAskSuccessResponse(data: unknown): data is AskSuccessResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "answer" in data &&
    typeof data.answer === "string" &&
    "sources" in data &&
    Array.isArray(data.sources) &&
    "outcome" in data &&
    (data.outcome === "answered" || data.outcome === "rejected" || data.outcome === "degraded")
  );
}

function getAskErrorMessage(data: unknown): string | null {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "object" &&
    data.error !== null &&
    "message" in data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  return null;
}

export function Chat() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [chatStatus, setChatStatus] = useState<ChatStatus>("idle");

  const [isWakingUp, setIsWakingUp] = useState(false);

  const wakeUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();

      if (wakeUpTimerRef.current !== null) {
        clearTimeout(wakeUpTimerRef.current);
      }
    };
  }, []);

  async function sendQuestion(question: string, userMessageId: string, assistantMessageId: string) {
    let responseReceived = false;

    // Prevent overlapping requests.
    if (abortControllerRef.current !== null) return;

    setChatStatus("submitting");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsWakingUp(false);

    if (wakeUpTimerRef.current !== null) {
      clearTimeout(wakeUpTimerRef.current);
    }

    wakeUpTimerRef.current = setTimeout(() => {
      setIsWakingUp(true);
    }, 5000);

    function setAssistantError(errorMessage: string) {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id === assistantMessageId && message.author === "assistant") {
            return {
              ...message,
              errorMessage,
              status: "error",
            };
          }

          return message;
        }),
      );
    }

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      responseReceived = true;

      let data: unknown = null;

      try {
        data = await response.json();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }
      }

      if (!response.ok) {
        const errorMessage =
          getAskErrorMessage(data) ?? "The request could not be completed. Please try again.";

        setAssistantError(errorMessage);
        return;
      }

      if (!isAskSuccessResponse(data)) {
        setAssistantError("We couldn't process the response. Please try again.");
        return;
      }

      setMessages((prev) =>
        prev.map((message) => {
          if (message.id === assistantMessageId && message.author === "assistant") {
            if (data.outcome === "degraded") {
              return {
                ...message,
                errorMessage: data.answer,
                status: "error",
              };
            }

            return {
              ...message,
              content: data.answer,
              errorMessage: undefined,
              status: "done",
            };
          }

          return message;
        }),
      );
    } catch (error) {
      const isAborted = error instanceof Error && error.name === "AbortError";

      if (isAborted) {
        setMessages((prev) =>
          prev.map((message) => {
            if (message.id === assistantMessageId && message.author === "assistant") {
              return {
                ...message,
                status: "stopped",
              };
            }

            return message;
          }),
        );

        return;
      }

      // Only mark the user message failed when no HTTP response arrived.
      if (!responseReceived) {
        setMessages((prev) =>
          prev.map((message) => {
            if (message.id === userMessageId && message.author === "user") {
              return {
                ...message,
                status: "failed",
              };
            }

            if (message.id === assistantMessageId && message.author === "assistant") {
              return {
                ...message,
                errorMessage:
                  "Couldn't connect to the server. Check your connection and try again.",
                status: "error",
              };
            }

            return message;
          }),
        );

        return;
      }

      // An unexpected error after receiving a response must not expose
      // raw JavaScript or parsing errors to the user.
      setAssistantError("The request could not be completed. Please try again.");
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      if (wakeUpTimerRef.current !== null) {
        clearTimeout(wakeUpTimerRef.current);
        wakeUpTimerRef.current = null;
      }

      setIsWakingUp(false);
      setChatStatus("idle");
    }
  }

  async function handleSubmit(text: string) {
    if (abortControllerRef.current !== null) return;

    if (editingMessageId !== null) {
      await handleEditSubmit(text);
      return;
    }

    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    const userMessage: MessageItem = {
      id: userMessageId,
      author: "user",
      content: text,
      status: "sent",
    };

    const assistantMessage: MessageItem = {
      id: assistantMessageId,
      author: "assistant",
      content: "",
      status: "waiting",
      replyTo: userMessageId,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    setDraft("");

    await sendQuestion(text, userMessageId, assistantMessageId);
  }

  async function handleRetry(assistantMessageId: string) {
    if (abortControllerRef.current !== null) {
      return;
    }

    const assistantMessage = messages.find(
      (message) => message.id === assistantMessageId && message.author === "assistant",
    );

    if (assistantMessage?.status !== "error") {
      return;
    }

    const userMessage = messages.find(
      (message) => message.id === assistantMessage.replyTo && message.author === "user",
    );

    if (!userMessage) {
      return;
    }

    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === userMessage.id && message.author === "user") {
          return {
            ...message,
            status: "sent",
          };
        }

        if (message.id === assistantMessageId && message.author === "assistant") {
          return {
            ...message,
            content: "",
            errorMessage: undefined,
            status: "waiting",
          };
        }

        return message;
      }),
    );

    await sendQuestion(userMessage.content, userMessage.id, assistantMessageId);
  }

  function handleEdit(messageId: string) {
    if (abortControllerRef.current !== null) return;

    const userMessage = messages.find(
      (message) => message.id === messageId && message.author === "user",
    );

    if (!userMessage || userMessage.status === "failed") return;

    setDraft(userMessage.content);
    setEditingMessageId(userMessage.id);
  }

  async function handleEditSubmit(text: string) {
    if (editingMessageId === null || abortControllerRef.current !== null) {
      return;
    }

    const userMessage = messages.find(
      (message) => message.id === editingMessageId && message.author === "user",
    );

    if (userMessage?.author !== "user") return;

    const assistantMessage = messages.find(
      (message) => message.author === "assistant" && message.replyTo === editingMessageId,
    );

    if (assistantMessage?.author !== "assistant") return;

    const userIndex = messages.findIndex((message) => message.id === userMessage.id);

    const assistantIndex = messages.findIndex((message) => message.id === assistantMessage.id);

    if (userIndex === -1 || assistantIndex <= userIndex) return;

    setMessages((prev) => [
      ...prev.slice(0, userIndex),
      {
        ...userMessage,
        content: text,
        status: "sent",
      },
      {
        ...assistantMessage,
        content: "",
        errorMessage: undefined,
        status: "waiting",
      },
    ]);

    setDraft("");
    setEditingMessageId(null);

    await sendQuestion(text, userMessage.id, assistantMessage.id);
  }

  function handleCancelEdit() {
    setEditingMessageId(null);
    setDraft("");
  }

  function handleStop() {
    abortControllerRef.current?.abort();
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-6">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col justify-center gap-4 py-12">
            <h1 className="text-2xl font-semibold">Welcome to The Frost Arena</h1>

            <p className="text-fg-muted">
              Ask a question about The Frost Arena, and I'll help you find the information you need.
            </p>

            <div className="mt-2 space-y-3">
              <p className="text-sm font-medium">Try asking:</p>

              <ul className="space-y-2 text-sm text-fg-muted">
                <li>What time does happy hour start?</li>
                <li>When are children allowed?</li>
                <li>What's the Wi-Fi password?</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message) => {
          if (message.author === "user") {
            return (
              <Message
                key={message.id}
                author="user"
                content={message.content}
                status={message.status}
                onEdit={message.status === "sent" ? () => handleEdit(message.id) : undefined}
              />
            );
          }

          return (
            <Message
              key={message.id}
              author="assistant"
              content={message.content}
              status={message.status}
              waitingLabel={isWakingUp ? "Waking up the server..." : "Thinking..."}
              errorMessage={message.errorMessage}
              onRetry={() => handleRetry(message.id)}
            />
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        {editingMessageId !== null && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-fg-muted">Editing your message</p>

            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>
        )}

        <Composer
          value={draft}
          onValueChange={setDraft}
          status={chatStatus}
          onSubmit={handleSubmit}
          onStop={handleStop}
          placeholder="Ask about The Frost Arena..."
        />
      </div>
    </div>
  );
}
