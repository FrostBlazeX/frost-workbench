export type UserMessage = {
  author: "user";
  content: string;
  status: "sent" | "failed";
  onEdit?: () => void;
};

export type AssistantMessage = {
  author: "assistant";
  content: string;
  status: "waiting" | "streaming" | "done" | "stopped" | "error";
  waitingLabel?: string;
  errorMessage?: string;
  onRetry?: () => void;
};

export type MessageProps = UserMessage | AssistantMessage;
