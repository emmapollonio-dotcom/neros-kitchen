import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

// i18n: locale letta da cookie (NSK_LOCALE), niente prefisso /it /en nell'URL
// — vedi i18n/request.ts. Nessuna route esistente cambia percorso.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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
      {
        // Placeholder fotografici per la pagina /nero-tapas-bar (vedi
        // components/nero-tapas-bar/) — da sostituire con foto reali del
        // locale quando disponibili.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

const configWithIntl = withNextIntl(nextConfig);

// withSentryConfig aggiunge l'upload dei sourcemap al build solo se
// SENTRY_AUTH_TOKEN è impostato (vedi SENTRY-SETUP.md); senza, il plugin resta
// inattivo e il build funziona come prima, invariato.
export default withSentryConfig(configWithIntl, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  telemetry: false,
  webpack: { treeshake: { removeDebugLogging: true } },
});
