import { z } from "zod";

export const createShoppingListSchema = z.object({
  title: z.string().min(1).max(120).default("Lista della spesa"),
  meal_plan_id: z.string().uuid().optional(),
});

export type CreateShoppingListInput = z.infer<typeof createShoppingListSchema>;

// Una voce manuale deve avere un'etichetta libera (non è detto che l'utente
// stia comprando un ingrediente a catalogo, es. "tovaglioli di carta").
export const createShoppingListItemSchema = z.object({
  ingredient_id: z.string().uuid().optional(),
  custom_label: z.string().min(1).max(160).optional(),
  quantity: z.number().positive().max(100000).optional(),
  unit: z.string().max(20).optional(),
  category: z.string().max(60).optional(),
});

export type CreateShoppingListItemInput = z.infer<typeof createShoppingListItemSchema>;

export const updateShoppingListItemSchema = z.object({
  is_checked: z.boolean().optional(),
  quantity: z.number().positive().max(100000).optional(),
  unit: z.string().max(20).optional(),
});

export type UpdateShoppingListItemInput = z.infer<typeof updateShoppingListItemSchema>;
