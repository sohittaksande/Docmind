import type { NextConfig } from "next";

const nextConfig: NextConfig = {

   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Prevent webpack from bundling "canvas" on the client
      config.externals.push({
        canvas: "commonjs canvas",
      });
    }

    return config;
  },
};

export default nextConfig;
