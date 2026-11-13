import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Player portraits live in this repository (public/portraits) and are served from GitHub.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/psygo/go_hall_of_fame/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // The address carries a one-time secret: keep it out of Referer headers and caches.
        source: "/admin/reset-password",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ]
  },
}

export default nextConfig
