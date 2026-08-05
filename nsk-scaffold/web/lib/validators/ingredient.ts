import { z } from "zod";

export const createIngredientSchema = z.object({
  name: z.string().min(2).max(160),
  category: z.string().max(60).optional(),
  default_unit: z.string().min(1).max(20),
  avg_cost_per_unit: z.number().min(0).max(100000).optional(),
  allergens: z.array(z.string().max(40)).max(20).optional(),
  is_scrap_reusable: z.boolean().optional(),
});

export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;

export const updateIngredientSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  category: z.string().max(60).optional(),
  default_unit: z.string().min(1).max(20).optional(),
  avg_cost_per_unit: z.number().min(0).max(100000).optional(),
  allergens: z.array(z.string().max(40)).max(20).optional(),
  is_scrap_reusable: z.boolean().optional(),
});

export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>;
