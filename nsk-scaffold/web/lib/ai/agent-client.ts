import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AgentName =
  | "chef_assistant"
  | "food_cost_analyst"
  | "booking_assistant"
  | "waste_reduction_advisor"
  | "social_content_creator"
  | "haccp_advisor"
  | "crm_lead_qualifier"
  | "academy_tutor"
  | "review_responder"
  | "allergen_advisor";

export interface AgentResponse {
  data: { response: string } | null;
  error: string | null;
  meta: { agent: string; tokens_used: number; latency_ms: number } | null;
}

// Invoca l'Agent Orchestrator (Supabase Edge Function) passando il JWT
// dell'utente corrente — la Edge Function usa quel token per far rispettare
// le RLS sui tool che leggono/scrivono dati (vedi supabase/functions/agent-orchestrator).
export async function invokeAgent(agentName: AgentName, input: string): Promise<AgentResponse> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { data: null, error: "unauthorized", meta: null };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/agent-orchestrator`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent_name: agentName, input }),
    }
  );

  return res.json();
}
