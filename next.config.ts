import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/pokemon",
        destination:
          "https://r5d2yrnr91.execute-api.eu-west-2.amazonaws.com/Prod/pokemon",
      },
      {
        source: "/api/pokemon/:id",
        destination:
          "https://r5d2yrnr91.execute-api.eu-west-2.amazonaws.com/Prod/pokemon/:id",
      },
    ];
  },
};

export default nextConfig;
