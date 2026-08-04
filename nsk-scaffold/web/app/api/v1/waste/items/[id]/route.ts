import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/v1/waste/items/{id} — dettaglio spreco + suggerimenti AI già generati.
export async function GET(_req: NextRequest, { params }: Params) {
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
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const { data: suggestions } = await supabase
    .from("waste_suggestions")
    .select("id, suggestion_type, title, content, sustainability_score, created_at")
    .eq("waste_item_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    data: { ...item, suggestions: suggestions ?? [] },
    error: null,
    meta: null,
  });
}

// DELETE /api/v1/waste/items/{id} — rimuove uno spreco loggato per errore.
// RLS "waste_items_owner" impone comunque auth.uid() = user_id sul delete.
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { error } = await supabase.from("waste_items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null, meta: null });
}
