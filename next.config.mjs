/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/generate-invite-bg": ["./prompts/invite-background.txt"],
    },
  },
};

export default nextConfig;
