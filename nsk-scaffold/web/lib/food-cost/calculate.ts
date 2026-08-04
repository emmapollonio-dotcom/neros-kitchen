/**
 * Logica di calcolo food cost — funzione pura, senza dipendenze da DB/network,
 * per essere unit-testabile in isolamento (vedi calculate.test.ts).
 * La route API (app/api/v1/food-cost/calculate/route.ts) è un thin wrapper
 * che recupera i costi ingredienti da Supabase e delega qui il calcolo.
 */

export interface FoodCostLineInput {
  ingredient_id: string;
  quantity: number; // deve essere > 0, validato a monte da zod
  unit: string;
}

export interface FoodCostResult {
  food_cost_total: number;
  food_cost_per_serving: number;
  suggested_price_per_serving: number | null;
  food_cost_percentage: number | null;
}

export function calculateFoodCost(params: {
  servings: number;
  ingredients: FoodCostLineInput[];
  costByIngredientId: Map<string, number>;
  targetMarginPct: number;
}): FoodCostResult {
  const { servings, ingredients, costByIngredientId, targetMarginPct } = params;

  if (servings <= 0) {
    throw new Error("servings must be > 0");
  }
  if (targetMarginPct < 0 || targetMarginPct >= 100) {
    throw new Error("targetMarginPct must be in [0, 100)");
  }

  let foodCostTotal = 0;
  for (const item of ingredients) {
    const unitCost = costByIngredientId.get(item.ingredient_id) ?? 0;
    foodCostTotal += unitCost * item.quantity;
  }

  const foodCostPerServing = foodCostTotal / servings;

  // Se il food cost deve rappresentare (100 - targetMarginPct)% del prezzo di vendita:
  // prezzo = costo_per_porzione / ((100 - targetMarginPct) / 100)
  const foodCostSharePct = 100 - targetMarginPct;
  const suggestedPricePerServing =
    foodCostSharePct > 0 ? foodCostPerServing / (foodCostSharePct / 100) : null;

  const foodCostPercentage =
    suggestedPricePerServing && suggestedPricePerServing > 0
      ? (foodCostPerServing / suggestedPricePerServing) * 100
      : null;

  return {
    food_cost_total: round(foodCostTotal, 2),
    food_cost_per_serving: round(foodCostPerServing, 3),
    suggested_price_per_serving:
      suggestedPricePerServing !== null ? round(suggestedPricePerServing, 2) : null,
    food_cost_percentage: foodCostPercentage !== null ? round(foodCostPercentage, 1) : null,
  };
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
