import { cookies } from "next/headers";
import { getCurrentUserInfo } from "@/lib/auth/get-current-user";
import { THEME_COOKIE, type AppTheme } from "@/lib/theme/theme";
import { AppNavClient } from "./AppNavClient";

// Server wrapper: legge l'utente e il tema una volta per request e passa
// solo i dati serializzabili al client component interattivo (dropdown,
// menu mobile, toggle tema).
export async function AppNav() {
  const user = await getCurrentUserInfo();
  const isPro = user?.role === "chef" || user?.role === "admin";
  const cookieStore = await cookies();
  const theme: AppTheme = cookieStore.get(THEME_COOKIE)?.value === "light" ? "light" : "dark";

  return <AppNavClient email={user?.email ?? null} isPro={isPro} theme={theme} />;
}
