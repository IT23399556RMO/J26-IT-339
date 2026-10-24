import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/sign/login",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/sign/register",
        permanent: true,
      },
      {
        source: "/sign",
        destination: "/sign/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
