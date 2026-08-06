// Costanti pure (nessun import di next/headers) — separate da request.ts
// apposta: request.ts è server-only (usa cookies()), ma componenti client
// come LandingFooter devono poter leggere l'elenco locali senza trascinarsi
// dietro codice server nel bundle client (Next.js lo blocca a build-time).
export const locales = ["it", "en", "es", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "it";
export const rtlLocales: Locale[] = ["ar"];
export const LOCALE_COOKIE = "NSK_LOCALE";
