// Costanti pure (nessun import di next/headers), stesso motivo di
// i18n/locales.ts: componenti client devono poter leggere il tipo/cookie
// name senza trascinarsi dietro codice server nel bundle.
export const THEME_COOKIE = "NSK_THEME";
export type AppTheme = "dark" | "light";
export const defaultAppTheme: AppTheme = "dark";
