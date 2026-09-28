// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },

  transpilePackages: ['recharts', 'react-is', 'react-smooth'],

  // Remove X-Powered-By
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ── Security Headers ──────────────────────────────────────────────────────
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    const cspProduction = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.google.com https://www.gstatic.com https://accounts.google.com https://www.googletagmanager.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com blob:",
      "media-src 'self' https://res.cloudinary.com",
      "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.google-analytics.com https://accounts.google.com https://oauth2.googleapis.com",
      "frame-src https://checkout.razorpay.com https://api.razorpay.com https://www.google.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent DNS prefetch leakage
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Legacy XSS filter
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions: disable sensors and payment API (only COD)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()",
          },
          // HSTS: only in production
          ...(!isDev
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: isDev
              ? "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
              : cspProduction,
          },
          // Cross-Origin policies
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
