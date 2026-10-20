import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  agentRules: false,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
