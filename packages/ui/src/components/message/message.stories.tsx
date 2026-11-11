import type { Meta, StoryObj } from "@storybook/react-vite";
import { Message } from "./message";

const meta = {
  title: "Components/Message",
  component: Message,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Message>;

export default meta;

type Story = StoryObj<typeof meta>;

export const UserSent: Story = {
  args: {
    author: "user",
    content: "How do React Server Components work?",
    status: "sent",
  },
};

export const UserFailed: Story = {
  args: {
    author: "user",
    content: "Can you explain the difference between SSR and CSR?",
    status: "failed",
  },
};

export const AssistantWaiting: Story = {
  args: {
    author: "assistant",
    content: "",
    status: "waiting",
  },
};

export const AssistantStreaming: Story = {
  args: {
    author: "assistant",
    content: "React Server Components allow you to...",
    status: "streaming",
  },
};

export const AssistantDone: Story = {
  args: {
    author: "assistant",
    content:
      "React Server Components allow components to render on the server. They can access server-side resources directly and reduce the amount of JavaScript sent to the browser.",
    status: "done",
  },
};

export const AssistantStopped: Story = {
  args: {
    author: "assistant",
    content: "There are several important differences between...",
    status: "stopped",
  },
};

export const AssistantError: Story = {
  args: {
    author: "assistant",
    content: "React Server Components are useful because...",
    status: "error",
  },
};

export const Conversation: Story = {
  args: {
    author: "user",
    content: "",
    status: "sent",
  },
  render: () => (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Message
        author="user"
        content="What are React Server Components, and how are they different from Client Components?"
        status="sent"
      />

      <Message
        author="assistant"
        content="React Server Components are components that render exclusively on the server. They allow you to fetch data and access server-side resources without sending their implementation to the browser."
        status="done"
      />

      <Message author="user" content="Can you give me a practical example?" status="sent" />

      <Message
        author="assistant"
        content="Imagine a product page. You can use a Server Component to fetch product information from your database, then use a Client Component for an interactive quantity selector or add-to-cart button."
        status="done"
      />

      <Message
        author="user"
        content="That makes sense. What about when a response is still generating?"
        status="sent"
      />

      <Message
        author="assistant"
        content="While the response is being generated, you can display the streamed content..."
        status="streaming"
      />
    </div>
  ),
};
