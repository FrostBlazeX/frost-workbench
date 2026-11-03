import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

addons.setConfig({
  theme: create({
    base: prefersDark ? "dark" : "light",
    brandTitle: "Frost UI",
    brandUrl: "https://frost-workbench.vercel.app",
    brandTarget: "_self",
  }),
});
