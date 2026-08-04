import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { invokeAgent } from "@/lib/ai/agent-client";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/waste/items/{id}/suggestions — genera suggerimenti AI per
// ridurre/riutilizzare uno spreco specifico. Il testo dell'item viene letto
// qui (scoped a RLS "waste_items_owner", quindi già verificato di appartenere
// all'utente) e passato come input all'agente: l'agente stesso persiste i
// suggerimenti strutturati tramite il tool save_waste_suggestion, non li
// restituisce come testo libero — vedi supabase/functions/agent-orchestrator.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: item, error } = await supabase
    .from("waste_items")
    .select("id, ingredient_name, quantity, unit, reason")
    .eq("id", id)
    .single();

  if (error || !item) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const input = JSON.stringify({
    waste_item_id: item.id,
    ingredient_name: item.ingredient_name,
    quantity: item.quantity,
    unit: item.unit,
    reason: item.reason ?? "non specificato",
  });

  const result = await invokeAgent("waste_reduction_advisor", input);

  if (result.error) {
    return NextResponse.json({ data: null, error: result.error, meta: null }, { status: 502 });
  }

  const { data: suggestions } = await supabase
    .from("waste_suggestions")
    .select("id, suggestion_type, title, content, sustainability_score, created_at")
    .eq("waste_item_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    data: { suggestions: suggestions ?? [], agent_response: result.data?.response ?? null },
    error: null,
    meta: result.meta,
  });
}
