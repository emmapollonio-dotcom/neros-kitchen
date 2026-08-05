import { getCurrentUserInfo } from "@/lib/auth/get-current-user";
import { AppNavClient } from "./AppNavClient";

// Server wrapper: legge l'utente una volta per request e passa solo i dati
// serializzabili al client component interattivo (dropdown, menu mobile).
export async function AppNav() {
  const user = await getCurrentUserInfo();
  const isPro = user?.role === "chef" || user?.role === "admin";

  return <AppNavClient email={user?.email ?? null} isPro={isPro} />;
}
