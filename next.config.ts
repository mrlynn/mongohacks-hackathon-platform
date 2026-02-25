import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Cache landing pages at CDN for 60s, serve stale up to 5min while revalidating
        source: "/:slug((?!api|_next|favicon\\.ico).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
