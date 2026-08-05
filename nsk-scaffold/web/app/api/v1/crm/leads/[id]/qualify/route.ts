import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { invokeAgent } from "@/lib/ai/agent-client";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/crm/leads/{id}/qualify — invoca l'agente crm_lead_qualifier:
// legge lead + ultime attività, gli chiede punteggio aggiornato/prossimo
// passo/bozza di follow-up. L'agente salva tutto da sé (score sul lead,
// prossimo passo+bozza come crm_activity type="ai_suggestion") tramite il
// tool qualify_lead — qui rileggiamo solo il risultato per la UI.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, full_name, email, source, stage, score, created_at")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const { data: activities } = await supabase
    .from("crm_activities")
    .select("type, content, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const input = JSON.stringify({
    lead_id: lead.id,
    full_name: lead.full_name,
    source: lead.source,
    stage: lead.stage,
    current_score: lead.score,
    lead_since: lead.created_at,
    recent_activities: activities ?? [],
  });

  const result = await invokeAgent("crm_lead_qualifier", input);
  if (result.error) {
    return NextResponse.json({ data: null, error: result.error, meta: null }, { status: 502 });
  }

  const { data: updatedLead } = await supabase
    .from("leads")
    .select("id, score, stage")
    .eq("id", id)
    .single();

  const { data: latestActivity } = await supabase
    .from("crm_activities")
    .select("id, type, content, created_at")
    .eq("lead_id", id)
    .eq("type", "ai_suggestion")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    data: { lead: updatedLead, activity: latestActivity, agent_response: result.data?.response ?? null },
    error: null,
    meta: result.meta,
  });
}
