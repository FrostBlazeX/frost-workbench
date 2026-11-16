import type { MessageProps } from "@frost/ui";

export type MessageItem = MessageProps & {
  id: string;
  replyTo?: string;
};

export type AskOutcome = "answered" | "rejected" | "degraded";

export type AskSuccessResponse = {
  answer: string;
  sources: unknown[];
  outcome: AskOutcome;
};

export type AskErrorResponse = {
  error: {
    message: string;
  };
};

export type AskResponse = AskSuccessResponse | AskErrorResponse;
