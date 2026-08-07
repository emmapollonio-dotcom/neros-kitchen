"use server";

import { cookies } from "next/headers";
import { THEME_COOKIE, type AppTheme } from "@/lib/theme/theme";

// Server action richiamata dal ThemeToggle (nav condivisa). Stesso pattern
// di setLocale (app/actions/set-locale.ts): scrive il cookie letto da
// app/layout.tsx per decidere la classe su <html>, il chiamante fa
// router.refresh() per rirenderizzare col nuovo tema lato server.
export async function setTheme(theme: AppTheme) {
  if (theme !== "dark" && theme !== "light") return;
  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
