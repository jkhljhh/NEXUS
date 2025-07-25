import type { NextConfig } from "next";
import "./env";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ["@t3-oss/env-nextjs"],
  devIndicators: false,
  images: {
    remotePatterns: [new URL("https://*.supabase.co/**")],
  },
};

export default nextConfig;
