import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @frost/ui ships TypeScript source, not compiled JS, so Next compiles it alongside the app.
  transpilePackages: ["@frost/ui"],
};

export default nextConfig;
