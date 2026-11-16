import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount whatever each test rendered so the next test starts from an empty document.
afterEach(() => {
  cleanup();
});
