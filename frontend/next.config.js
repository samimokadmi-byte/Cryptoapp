/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Empty string = same origin (Vercel). Fallback to local dev server.
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
  },
};

module.exports = nextConfig;
