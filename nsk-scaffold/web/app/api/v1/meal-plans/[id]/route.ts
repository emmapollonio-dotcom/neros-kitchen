import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/v1/meal-plans/{id} — piano + voci, con titolo/immagine/porzioni
// base della ricetta collegata (serve alla UI del planner per le card e al
// calcolo dello scaling quando si genera la lista della spesa).
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: plan, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !plan) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const { data: entries } = await supabase
    .from("meal_plan_entries")
    .select("id, recipe_id, day_date, meal_slot, servings, notes")
    .eq("meal_plan_id", id)
    .order("day_date", { ascending: true });

  const recipeIds = [...new Set((entries ?? []).map((e) => e.recipe_id))];

  const { data: recipes } = recipeIds.length
    ? await supabase.from("recipes").select("id, title, slug, images, servings").in("id", recipeIds)
    : { data: [] };

  const recipeById = new Map((recipes ?? []).map((r) => [r.id, r]));

  const entriesWithRecipe = (entries ?? []).map((e) => ({
    ...e,
    recipe: recipeById.get(e.recipe_id) ?? null,
  }));

  return NextResponse.json({
    data: { ...plan, entries: entriesWithRecipe },
    error: null,
    meta: null,
  });
}

// DELETE /api/v1/meal-plans/{id} — elimina il piano (cascade sulle voci).
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { error } = await supabase.from("meal_plans").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null, meta: null });
}
