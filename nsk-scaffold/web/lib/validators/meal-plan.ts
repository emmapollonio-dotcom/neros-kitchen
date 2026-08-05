import { z } from "zod";

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

// week_start_date è sempre un lunedì lato client (la UI del planner naviga
// per settimane) ma non lo forziamo qui: il vincolo unique(user_id, week_start_date)
// nello schema basta a evitare doppioni, la data resta libera per flessibilità futura.
export const createMealPlanSchema = z.object({
  title: z.string().min(1).max(120).default("Piano settimanale"),
  week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato data atteso: YYYY-MM-DD"),
});

export type CreateMealPlanInput = z.infer<typeof createMealPlanSchema>;

export const createMealPlanEntrySchema = z.object({
  recipe_id: z.string().uuid(),
  day_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato data atteso: YYYY-MM-DD"),
  meal_slot: z.enum(MEAL_SLOTS).default("dinner"),
  servings: z.number().int().positive().max(50).default(2),
  notes: z.string().max(280).optional(),
});

export type CreateMealPlanEntryInput = z.infer<typeof createMealPlanEntrySchema>;
