import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { aggregateShoppingList, type PlannedRecipe } from "@/lib/meal-plan/generate-shopping-list";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/meal-plans/{id}/generate-shopping-list — costruisce (o
// rigenera) la lista della spesa collegata al piano, sommando gli ingredienti
// di tutte le ricette pianificate e scalandoli per le porzioni scelte.
// Se esiste già una lista collegata a questo piano, la sostituisce (le voci
// spuntate manualmente vengono perse: è una rigenerazione esplicita, non un
// merge — la UI deve avvisare l'utente prima di chiamarla una seconda volta).
export async function POST(_req: NextRequest, { params }: Params) {
  const { id: mealPlanId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: plan } = await supabase
    .from("meal_plans")
    .select("id, title, week_start_date")
    .eq("id", mealPlanId)
    .single();

  if (!plan) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const { data: entries, error: entriesError } = await supabase
    .from("meal_plan_entries")
    .select("recipe_id, servings")
    .eq("meal_plan_id", mealPlanId);

  if (entriesError) {
    return NextResponse.json({ data: null, error: entriesError.message, meta: null }, { status: 500 });
  }

  if (!entries || entries.length === 0) {
    return NextResponse.json(
      { data: null, error: "il piano non ha ancora ricette pianificate", meta: null },
      { status: 400 }
    );
  }

  const recipeIds = [...new Set(entries.map((e) => e.recipe_id))];

  const { data: recipeRows, error: recipesError } = await supabase
    .from("recipes")
    .select("id, servings")
    .in("id", recipeIds);

  if (recipesError) {
    return NextResponse.json({ data: null, error: recipesError.message, meta: null }, { status: 500 });
  }

  const baseServingsByRecipeId = new Map((recipeRows ?? []).map((r) => [r.id, r.servings as number]));

  const { data: ingredientRows, error: ingredientsError } = await supabase
    .from("recipe_ingredients")
    .select("recipe_id, ingredient_id, quantity, unit")
    .in("recipe_id", recipeIds);

  if (ingredientsError) {
    return NextResponse.json(
      { data: null, error: ingredientsError.message, meta: null },
      { status: 500 }
    );
  }

  const ingredientIds = [...new Set((ingredientRows ?? []).map((r) => r.ingredient_id))];

  const { data: ingredientCatalog, error: catalogError } = ingredientIds.length
    ? await supabase.from("ingredients").select("id, name, category").in("id", ingredientIds)
    : { data: [], error: null };

  if (catalogError) {
    return NextResponse.json({ data: null, error: catalogError.message, meta: null }, { status: 500 });
  }

  const catalogById = new Map((ingredientCatalog ?? []).map((i) => [i.id, i]));

  const plannedRecipes: PlannedRecipe[] = entries
    .filter((entry) => (baseServingsByRecipeId.get(entry.recipe_id) ?? 0) > 0)
    .map((entry) => ({
      recipe_id: entry.recipe_id,
      base_servings: baseServingsByRecipeId.get(entry.recipe_id)!,
      planned_servings: entry.servings,
      ingredients: (ingredientRows ?? [])
        .filter((row) => row.recipe_id === entry.recipe_id && catalogById.has(row.ingredient_id))
        .map((row) => {
          const ingredient = catalogById.get(row.ingredient_id)!;
          return {
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            category: ingredient.category,
            quantity: Number(row.quantity),
            unit: row.unit,
          };
        }),
    }));

  const aggregated = aggregateShoppingList(plannedRecipes);

  // Riusa una lista esistente collegata a questo piano se c'è, altrimenti ne
  // crea una nuova — così l'URL/ID della lista resta stabile tra rigenerazioni.
  const { data: existingList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("meal_plan_id", mealPlanId)
    .maybeSingle();

  let shoppingListId = existingList?.id as string | undefined;

  if (shoppingListId) {
    await supabase.from("shopping_list_items").delete().eq("shopping_list_id", shoppingListId);
    await supabase
      .from("shopping_lists")
      .update({ title: `Spesa — ${plan.title}`, updated_at: new Date().toISOString() })
      .eq("id", shoppingListId);
  } else {
    const { data: newList, error: listError } = await supabase
      .from("shopping_lists")
      .insert({ user_id: user.id, meal_plan_id: mealPlanId, title: `Spesa — ${plan.title}` })
      .select("id")
      .single();

    if (listError || !newList) {
      return NextResponse.json(
        { data: null, error: listError?.message ?? "impossibile creare la lista", meta: null },
        { status: 500 }
      );
    }
    shoppingListId = newList.id;
  }

  if (aggregated.length > 0) {
    const { error: insertError } = await supabase.from("shopping_list_items").insert(
      aggregated.map((item) => ({
        shopping_list_id: shoppingListId,
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        source: "meal_plan" as const,
      }))
    );

    if (insertError) {
      return NextResponse.json({ data: null, error: insertError.message, meta: null }, { status: 500 });
    }
  }

  return NextResponse.json(
    { data: { shopping_list_id: shoppingListId, items_count: aggregated.length }, error: null, meta: null },
    { status: 201 }
  );
}
