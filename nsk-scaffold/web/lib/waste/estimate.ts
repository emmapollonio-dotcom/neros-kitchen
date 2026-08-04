/**
 * Stima del costo di uno spreco — funzione pura, senza dipendenze da DB/network,
 * sullo stesso principio di lib/food-cost/calculate.ts: la route API
 * (app/api/v1/waste/items/route.ts) recupera i costi noti da Supabase e
 * delega qui il calcolo, così la logica resta unit-testabile in isolamento.
 *
 * waste_items.ingredient_name è testo libero (non un FK a ingredients), quindi
 * il match con il catalogo è per nome case-insensitive: se non c'è corrispondenza
 * il costo è "sconosciuto" (null), mai inventato.
 */

export interface WasteEstimateInput {
  ingredient_name: string;
  quantity: number;
  unit: string;
}

export interface WasteEstimateResult {
  estimated_cost: number | null;
  matched_ingredient: boolean;
}

export function estimateWasteCost(
  item: WasteEstimateInput,
  costByIngredientName: Map<string, number>
): WasteEstimateResult {
  if (item.quantity <= 0) {
    throw new Error("quantity must be > 0");
  }

  const key = normalizeName(item.ingredient_name);
  const unitCost = costByIngredientName.get(key);

  if (unitCost === undefined) {
    return { estimated_cost: null, matched_ingredient: false };
  }

  return {
    estimated_cost: round(unitCost * item.quantity, 2),
    matched_ingredient: true,
  };
}

export interface WasteTotals {
  total_estimated_cost: number;
  items_with_known_cost: number;
  items_with_unknown_cost: number;
}

export function summarizeWaste(
  items: Array<{ ingredient_name: string; quantity: number; unit: string }>,
  costByIngredientName: Map<string, number>
): WasteTotals {
  let total = 0;
  let known = 0;
  let unknown = 0;

  for (const item of items) {
    const { estimated_cost, matched_ingredient } = estimateWasteCost(item, costByIngredientName);
    if (matched_ingredient && estimated_cost !== null) {
      total += estimated_cost;
      known += 1;
    } else {
      unknown += 1;
    }
  }

  return {
    total_estimated_cost: round(total, 2),
    items_with_known_cost: known,
    items_with_unknown_cost: unknown,
  };
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
