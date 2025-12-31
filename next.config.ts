import type { NextConfig } from "next";

const nextConfig = {
  output: 'standalone', // ✅ Docker 최적화를 위해 필수!
  
  async rewrites() {
    return [
      {
        // 1. 브라우저가 '/api/...' 로 요청하면
        source: '/api/:path*',
        // 2. 내부망의 백엔드 주소로 몰래 연결해준다.
        // (docker-compose에서 서비스 이름을 'backend-app'으로 지을 예정)
        destination: `${process.env.BACKEND_INTERNAL_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
