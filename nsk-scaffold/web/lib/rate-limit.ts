import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Wrapper riutilizzabile attorno a public.check_rate_limit (funzione Postgres
// SECURITY DEFINER, migration add_rate_limiting). Stessa funzione usata anche
// dall'Agent Orchestrator (supabase/functions/agent-orchestrator/index.ts) per
// limitare le chiamate AI: qui la applichiamo alle scritture più esposte ad
// abuso (creazione prenotazioni/recensioni), usando l'user id come chiave.
//
// Fail-open: se l'RPC stessa fallisce (es. problema di rete/infra) non
// blocchiamo un utente legittimo per un problema del rate limiter — non è
// una difesa di ultima istanza contro attacchi sofisticati, ma un freno
// ragionevole contro spam/loop involontari o script poco sofisticati.
export async function checkRateLimit(
  supabase: SupabaseClient,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("rate_limit_check_failed", error);
    return true;
  }

  return data === true;
}

// Risposta 429 pronta all'uso nello stesso formato { data, error, meta } delle altre API v1.
export function rateLimitResponse(message = "troppe richieste, riprova tra qualche minuto") {
  return NextResponse.json({ data: null, error: message, meta: null }, { status: 429 });
}
