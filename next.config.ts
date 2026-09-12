import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    // Product photos are validated to 5 MB in the admin action. Leave room for
    // multipart form data so a valid photo reaches that action.
    serverActions: { bodySizeLimit: "6mb" },
  },
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
