import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { foodCostRequestSchema } from "@/lib/validators/food-cost";
import { calculateFoodCost } from "@/lib/food-cost/calculate";

// POST /api/v1/food-cost/calculate
// Calcola il costo di una ricetta a partire dagli ingredienti reali in DB
// (prezzo medio per unità), suggerisce prezzo di vendita in base al margine target.
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { data: null, error: "unauthorized", meta: null },
      { status: 401 }
    );
  }

  const json = await req.json();
  const parsed = foodCostRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { servings, ingredients, target_margin_pct } = parsed.data;

  const ingredientIds = ingredients.map((i) => i.ingredient_id);
  const { data: dbIngredients, error } = await supabase
    .from("ingredients")
    .select("id, avg_cost_per_unit, default_unit")
    .in("id", ingredientIds);

  if (error) {
    return NextResponse.json(
      { data: null, error: error.message, meta: null },
      { status: 500 }
    );
  }

  const costById = new Map(
    (dbIngredients ?? []).map((i) => [i.id, Number(i.avg_cost_per_unit ?? 0)])
  );

  let result;
  try {
    result = calculateFoodCost({
      servings,
      ingredients,
      costByIngredientId: costById,
      targetMarginPct: target_margin_pct,
    });
  } catch (e) {
    return NextResponse.json(
      { data: null, error: e instanceof Error ? e.message : "calculation_error", meta: null },
      { status: 400 }
    );
  }

  return NextResponse.json({
    data: result,
    error: null,
    meta: { currency: "EUR", servings },
  });
}
