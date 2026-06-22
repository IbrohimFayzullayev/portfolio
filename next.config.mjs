import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Content now comes from the Go API at request time (see src/lib/content.ts),
// so there is no Velite build step here anymore.

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal self-contained server bundle (.next/standalone) for a small Docker
  // runtime image — required by the Dockerfile.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default withNextIntl(nextConfig);
