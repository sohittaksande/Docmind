import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  async redirects() {
     return [
        {
        source: '/sign-in',
        destination: '/api/auth/login',
        permanent: true,
      },
      {
        source: '/sign-up',
        destination: '/api/auth/register',
        permanent: true,
      },
     ]
  },

   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gravatar.com",
        pathname: "/avatar/**",
      }
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
