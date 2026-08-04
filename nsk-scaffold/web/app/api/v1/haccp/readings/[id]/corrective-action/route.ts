import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { invokeAgent } from "@/lib/ai/agent-client";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/haccp/readings/{id}/corrective-action — genera un'azione
// correttiva AI per una rilevazione non conforme. Il dettaglio della
// rilevazione + soglia del punto di controllo vengono letti qui (scoped a
// RLS "haccp_readings_owner"/"haccp_control_points_owner", quindi già
// verificato che appartengano all'utente) e passati come input all'agente:
// l'agente stesso persiste il risultato tramite il tool
// save_corrective_action — vedi supabase/functions/agent-orchestrator.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: reading, error } = await supabase
    .from("haccp_readings")
    .select("id, control_point_id, temperature, is_non_conforming")
    .eq("id", id)
    .single();

  if (error || !reading) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  if (!reading.is_non_conforming) {
    return NextResponse.json(
      { data: null, error: "questa rilevazione è conforme, nessuna azione correttiva necessaria", meta: null },
      { status: 400 }
    );
  }

  const { data: controlPoint } = await supabase
    .from("haccp_control_points")
    .select("name, type, temp_min, temp_max")
    .eq("id", reading.control_point_id)
    .single();

  const input = JSON.stringify({
    reading_id: reading.id,
    temperature: reading.temperature,
    control_point_name: controlPoint?.name ?? "sconosciuto",
    control_point_type: controlPoint?.type ?? "sconosciuto",
    temp_min: controlPoint?.temp_min,
    temp_max: controlPoint?.temp_max,
  });

  const result = await invokeAgent("haccp_advisor", input);

  if (result.error) {
    return NextResponse.json({ data: null, error: result.error, meta: null }, { status: 502 });
  }

  const { data: actions } = await supabase
    .from("haccp_corrective_actions")
    .select("id, title, content, urgency, created_at")
    .eq("reading_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    data: { actions: actions ?? [], agent_response: result.data?.response ?? null },
    error: null,
    meta: result.meta,
  });
}
