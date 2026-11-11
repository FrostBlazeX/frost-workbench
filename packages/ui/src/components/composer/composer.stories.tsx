import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { fn } from "storybook/test";
import { Composer } from "./composer";

const meta = {
  title: "Components/Composer",
  component: Composer,
  tags: ["autodocs"],
  args: {
    placeholder: "Ask the workbench...",
    onSubmit: fn(),
    onStop: fn(),
  },
  argTypes: {
    status: { control: "inline-radio", options: ["idle", "submitting", "streaming", "disabled"] },
  },
} satisfies Meta<typeof Composer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = { args: { status: "idle" } };

export const WithDraft: Story = {
  args: { status: "idle", defaultValue: "Help me build a responsive dashboard" },
};

export const Submitting: Story = { args: { status: "submitting" } };

export const Streaming: Story = { args: { status: "streaming" } };

export const Disabled: Story = { args: { status: "disabled" } };

//Interactive lifecycle demonstration
function InteractiveComposer(args: React.ComponentProps<typeof Composer>) {
  const [status, setStatus] = useState<"idle" | "submitting" | "streaming" | "disabled">("idle");

  useEffect(() => {
    if (status === "submitting") {
      const timer = setTimeout(() => {
        setStatus("streaming");
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (status === "streaming") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = (text: string) => {
    args.onSubmit?.(text);
    setStatus("submitting");
  };

  const handleStop = () => {
    args.onStop?.();
    setStatus("idle");
  };

  return <Composer {...args} status={status} onSubmit={handleSubmit} onStop={handleStop} />;
}

export const Interactive: Story = {
  args: { status: "idle", defaultValue: "Explain how React Server Components work" },
  render: (args) => <InteractiveComposer {...args} />,
};
