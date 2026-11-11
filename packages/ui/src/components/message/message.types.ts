export type UserMessage = {
  author: "user";
  content: string;
  status: "sent" | "failed";
};

export type AssistantMessage = {
  author: "assistant";
  content: string;
  status: "waiting" | "streaming" | "done" | "stopped" | "error";
};

export type MessageProps = UserMessage | AssistantMessage;
