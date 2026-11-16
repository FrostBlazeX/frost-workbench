import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirror tsconfig's "@/*" path alias so imports like "@/components/chat" work in tests.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    // Components run in a simulated browser. Route handlers opt into Node per file with
    // a `// @vitest-environment node` comment at the top of the test file.
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["{app,components,lib}/**/*.test.{ts,tsx}"],
    pool: "vmThreads",
    // Do not fail CI while the app has no tests yet.
    passWithNoTests: true,
    // Fakes made with vi.stubGlobal (a fake fetch) and vi.stubEnv (fake env vars) are undone after every test.
    unstubGlobals: true,
    unstubEnvs: true,
  },
});
