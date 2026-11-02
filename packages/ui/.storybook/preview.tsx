import type { Preview } from "@storybook/react-vite";
import { useEffect } from "react";
import "./preview.css";

const preview: Preview = {
  // A toolbar switch that flips the .dark class, the same mechanism the app uses.
  globalTypes: {
    theme: {
      description: "Colour theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      const isDark = context.globals.theme === "dark";
      useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
      }, [isDark]);
      return (
        <div className="bg-canvas p-6 text-fg">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    // Fail the a11y panel's checks loudly instead of just listing them.
    a11y: { test: "error" },
  },
};

export default preview;
