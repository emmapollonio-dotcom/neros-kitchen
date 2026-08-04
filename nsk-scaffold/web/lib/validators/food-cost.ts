import { z } from "zod";

export const foodCostIngredientSchema = z.object({
  ingredient_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
});

export const foodCostRequestSchema = z.object({
  servings: z.number().int().positive(),
  ingredients: z.array(foodCostIngredientSchema).min(1),
  // Margine target: quanto % del prezzo di vendita NON è food cost.
  // Es. target_margin_pct = 70 => food cost atteso ~30% del prezzo.
  target_margin_pct: z.number().min(0).max(99).default(70),
});

export type FoodCostRequest = z.infer<typeof foodCostRequestSchema>;
