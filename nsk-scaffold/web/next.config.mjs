import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Foto piatti caricate su Supabase Storage (bucket "recipe-photos",
    // vedi MediaGallery.tsx) — next/image le ottimizza solo se l'host è
    // esplicitamente autorizzato.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xjvrhoweghzfvwjsvwla.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

// withSentryConfig aggiunge l'upload dei sourcemap al build solo se
// SENTRY_AUTH_TOKEN è impostato (vedi SENTRY-SETUP.md); senza, il plugin resta
// inattivo e il build funziona come prima, invariato.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  telemetry: false,
  webpack: { treeshake: { removeDebugLogging: true } },
});
