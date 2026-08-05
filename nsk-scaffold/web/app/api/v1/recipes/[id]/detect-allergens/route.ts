import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { invokeAgent } from "@/lib/ai/agent-client";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/recipes/{id}/detect-allergens — invoca l'agente
// allergen_advisor sugli ingredienti collegati alla ricetta. L'agente salva
// da sé allergens + allergen_notes tramite il tool save_allergen_analysis.
// RLS "recipes_owner_all" impone comunque auth.uid() = owner_id sull'update.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, title, owner_id")
    .eq("id", id)
    .single();

  if (recipeError || !recipe) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  if (recipe.owner_id !== user.id) {
    return NextResponse.json({ data: null, error: "forbidden", meta: null }, { status: 403 });
  }

  const { data: lines, error: linesError } = await supabase
    .from("recipe_ingredients")
    .select("quantity, unit, ingredients(name, allergens)")
    .eq("recipe_id", id);

  if (linesError) {
    return NextResponse.json({ data: null, error: linesError.message, meta: null }, { status: 500 });
  }

  if (!lines || lines.length === 0) {
    return NextResponse.json(
      { data: null, error: "aggiungi almeno un ingrediente alla ricetta prima dell'analisi", meta: null },
      { status: 400 }
    );
  }

  const input = JSON.stringify({
    recipe_id: recipe.id,
    title: recipe.title,
    ingredients: lines.map((l) => ({
      name: (l as any).ingredients?.name ?? "sconosciuto",
      known_allergens: (l as any).ingredients?.allergens ?? [],
      quantity: l.quantity,
      unit: l.unit,
    })),
  });

  const result = await invokeAgent("allergen_advisor", input);
  if (result.error) {
    return NextResponse.json({ data: null, error: result.error, meta: null }, { status: 502 });
  }

  const { data: updatedRecipe } = await supabase
    .from("recipes")
    .select("id, allergens, allergen_notes")
    .eq("id", id)
    .single();

  return NextResponse.json({
    data: updatedRecipe,
    error: null,
    meta: result.meta,
  });
}
