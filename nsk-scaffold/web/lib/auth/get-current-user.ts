import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "customer" | "chef" | "admin";

export interface CurrentUserInfo {
  id: string;
  email: string | null;
  role: AppRole;
}

// Helper condiviso per i layout server-side (header, sidebar pro): legge
// l'utente autenticato e il suo ruolo dal claim JWT sincronizzato
// dall'Auth Hook (stessa fonte usata da middleware.ts). Ritorna null se
// nessuno è loggato — i componenti che lo usano devono gestire entrambi i casi.
export async function getCurrentUserInfo(): Promise<CurrentUserInfo | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const role = (user.app_metadata?.role as AppRole | undefined) ?? "customer";

  return { id: user.id, email: user.email ?? null, role };
}
