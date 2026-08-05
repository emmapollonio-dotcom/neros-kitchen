import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface Params {
  params: Promise<{ id: string; entryId: string }>;
}

// DELETE /api/v1/meal-plans/{id}/entries/{entryId} — rimuove una ricetta
// pianificata (es. l'utente cambia idea su cosa cucinare martedì sera).
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { entryId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { error } = await supabase.from("meal_plan_entries").delete().eq("id", entryId);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data: { id: entryId }, error: null, meta: null });
}
