"use server";

import { cookies } from "next/headers";
import { locales, LOCALE_COOKIE, type Locale } from "@/i18n/locales";

// Server action richiamata dal language switcher (footer landing). Scrive
// il cookie letto da i18n/request.ts — nessun redirect, la pagina chiamante
// fa router.refresh() per rirenderizzare coi nuovi messages.
export async function setLocale(locale: string) {
  if (!(locales as readonly string[]).includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale as Locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
