import { z } from "zod";

export const createRecipeSchema = z.object({
  title: z.string().min(3).max(120),
  category: z.string().optional(),
  cuisine: z.string().optional(),
  description: z.string().max(2000).optional(),
  servings: z.number().int().positive().default(4),
  prep_minutes: z.number().int().nonnegative().optional(),
  cook_minutes: z.number().int().nonnegative().optional(),
  difficulty: z.enum(["facile", "medio", "difficile"]).optional(),
  allergens: z.array(z.string()).default([]),
  language: z.string().default("it"),
  visibility: z.enum(["private", "unlisted", "public"]).default("private"),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;

// Genera uno slug url-safe dal titolo + un suffisso breve per garantire unicità
// (la colonna recipes.slug è UNIQUE). Funzione pura, testabile.
export function slugifyRecipeTitle(title: string, uniqueSuffix: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // rimuove diacritici (accenti) dopo normalizzazione NFD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${uniqueSuffix}`;
}
