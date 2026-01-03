import type { NextConfig } from "next";

const nextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  env: {
    NEXT_PUBLIC_API_URL: '/api/v1',
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://backend-app:8080'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
