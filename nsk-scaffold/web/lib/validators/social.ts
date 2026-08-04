import { z } from "zod";

export const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const TONES = ["professionale", "amichevole", "elegante", "divertente"] as const;
export type Tone = (typeof TONES)[number];

export const POST_STATUSES = ["draft", "ready", "scheduled", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const createSocialPostSchema = z.object({
  platform: z.enum(PLATFORMS),
  topic: z.string().min(2).max(200),
  tone: z.enum(TONES).optional(),
});

export type CreateSocialPostInput = z.infer<typeof createSocialPostSchema>;

export const updateSocialPostSchema = z.object({
  caption: z.string().max(3000).optional(),
  hashtags: z.array(z.string().max(50)).max(30).optional(),
  status: z.enum(POST_STATUSES).optional(),
  scheduled_at: z.string().datetime().optional(),
});

export type UpdateSocialPostInput = z.infer<typeof updateSocialPostSchema>;
