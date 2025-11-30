import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/learnus/:path*',
        destination: 'https://ys.learnus.org/:path*',
      },
      {
        source: '/api/menu/:path*',
        destination: 'https://yonseicoop.co.kr/m/:path*',
      },
    ];
  },
};

export default nextConfig;