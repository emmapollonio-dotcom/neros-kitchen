import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/v1/shopping-lists/{id} — lista + voci, raggruppabili in UI per
// categoria (category è valorizzata quando la voce arriva dal meal planner
// tramite il catalogo ingredients; per le voci manuali è opzionale).
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: list, error } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !list) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("shopping_list_items")
    .select("*")
    .eq("shopping_list_id", id)
    .order("category", { ascending: true, nullsFirst: false });

  return NextResponse.json({ data: { ...list, items: items ?? [] }, error: null, meta: null });
}

// DELETE /api/v1/shopping-lists/{id}
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { error } = await supabase.from("shopping_lists").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null, meta: null });
}
