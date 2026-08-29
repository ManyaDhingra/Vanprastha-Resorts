/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
      },
    ],
  },
  // Self-contained output for deployment (next start runs from
  // .next/standalone with only node_modules for runtime deps + public/).
  output: "standalone",
};

export default nextConfig;
