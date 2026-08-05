/**
 * Aggregazione degli ingredienti dalle ricette pianificate in una lista della
 * spesa — funzione pura, senza dipendenze da DB/network, sullo stesso
 * principio di lib/waste/estimate.ts: la route API
 * (app/api/v1/meal-plans/[id]/generate-shopping-list/route.ts) recupera
 * recipe_ingredients per ogni ricetta pianificata e delega qui lo scaling
 * per porzioni + la somma delle quantità duplicate, così la logica resta
 * unit-testabile in isolamento.
 */

export interface RecipeIngredientLine {
  ingredient_id: string;
  ingredient_name: string;
  category: string | null;
  quantity: number;
  unit: string;
}

export interface PlannedRecipe {
  recipe_id: string;
  base_servings: number;
  planned_servings: number;
  ingredients: RecipeIngredientLine[];
}

export interface AggregatedShoppingItem {
  ingredient_id: string;
  ingredient_name: string;
  category: string | null;
  quantity: number;
  unit: string;
}

export function aggregateShoppingList(recipes: PlannedRecipe[]): AggregatedShoppingItem[] {
  const byKey = new Map<string, AggregatedShoppingItem>();

  for (const recipe of recipes) {
    if (recipe.base_servings <= 0) {
      throw new Error("base_servings must be > 0");
    }
    if (recipe.planned_servings <= 0) {
      throw new Error("planned_servings must be > 0");
    }

    const scale = recipe.planned_servings / recipe.base_servings;

    for (const line of recipe.ingredients) {
      // Stessa unità = stessa chiave: quantità in unità diverse per lo stesso
      // ingrediente (es. "g" vs "kg" su due ricette) restano voci separate
      // piuttosto che rischiare una conversione sbagliata — l'utente le vede
      // entrambe nella lista e può unificarle a mano se serve.
      const key = `${line.ingredient_id}::${line.unit}`;
      const scaledQuantity = round(line.quantity * scale, 2);

      const existing = byKey.get(key);
      if (existing) {
        existing.quantity = round(existing.quantity + scaledQuantity, 2);
      } else {
        byKey.set(key, {
          ingredient_id: line.ingredient_id,
          ingredient_name: line.ingredient_name,
          category: line.category,
          quantity: scaledQuantity,
          unit: line.unit,
        });
      }
    }
  }

  return [...byKey.values()].sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name, "it"));
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
