import { z } from "zod";

// Stessi 6 stadi pipeline usati implicitamente dal workflow n8n
// "N'sK - CRM Lead Follow-up" (leads.stage default 'new').
export const LEAD_STAGES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

// Soglia "hot lead" allineata a quella usata nel workflow n8n
// (nodo "IF score >= 70" in crm-lead-followup.json).
export const HOT_LEAD_SCORE_THRESHOLD = 70;

export const createLeadSchema = z.object({
  full_name: z.string().min(2).max(160).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(40).optional(),
  source: z.string().max(80).optional(),
  score: z.number().int().min(0).max(100).default(0),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = z.object({
  full_name: z.string().min(2).max(160).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(40).optional(),
  source: z.string().max(80).optional(),
  score: z.number().int().min(0).max(100).optional(),
  stage: z.enum(LEAD_STAGES).optional(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const ACTIVITY_TYPES = ["note", "call", "email", "meeting"] as const;

export const createActivitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  content: z.string().min(1).max(4000),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
