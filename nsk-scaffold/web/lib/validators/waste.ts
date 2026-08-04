import { z } from "zod";

// Tipi di spreco più comuni in cucina professionale/domestica — usati anche
// dal prompt dell'agente waste_reduction_advisor per capire il contesto senza
// dover indovinare dal solo nome dell'ingrediente.
export const WASTE_REASONS = [
  "scaduto",
  "avanzo_porzione",
  "scarto_lavorazione",
  "eccesso_ordinato",
  "danneggiato",
  "altro",
] as const;

export type WasteReason = (typeof WASTE_REASONS)[number];

export const createWasteItemSchema = z.object({
  ingredient_name: z.string().min(2).max(160),
  quantity: z.number().positive().max(100000),
  unit: z.string().min(1).max(20),
  reason: z.enum(WASTE_REASONS).optional(),
  image_url: z.string().url().optional(),
});

export type CreateWasteItemInput = z.infer<typeof createWasteItemSchema>;

export const SUGGESTION_TYPES = ["ricetta", "conservazione", "porzionamento", "acquisto"] as const;
export type SuggestionType = (typeof SUGGESTION_TYPES)[number];
