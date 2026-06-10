import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@architecture-ai/core", "@architecture-ai/catalog"],
};

export default nextConfig;
