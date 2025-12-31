import type { NextConfig } from "next";

const nextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // 👇 1. 여기에 명시적으로 환경변수를 박아줍니다.
  env: {
    NEXT_PUBLIC_API_URL: '/api/v1',
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // 👇 2. 백엔드 주소 뒤에 '/api/:path*'를 붙이는 게 맞는지 확인하세요.
        // 백엔드 컨트롤러가 @RequestMapping("/api/v1/...") 로 시작한다면,
        // 여기서는 destination 끝에 '/api/:path*'를 붙여야 합니다.
        destination: 'http://backend-app:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
