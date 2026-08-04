import { z } from "zod";

export const CONTROL_POINT_TYPES = ["frigo", "freezer", "cella", "banco_caldo", "altro"] as const;
export type ControlPointType = (typeof CONTROL_POINT_TYPES)[number];

export const createControlPointSchema = z
  .object({
    name: z.string().min(2).max(120),
    type: z.enum(CONTROL_POINT_TYPES),
    temp_min: z.number(),
    temp_max: z.number(),
  })
  .refine((data) => data.temp_max > data.temp_min, {
    message: "temp_max deve essere maggiore di temp_min",
    path: ["temp_max"],
  });

export type CreateControlPointInput = z.infer<typeof createControlPointSchema>;

export const createReadingSchema = z.object({
  control_point_id: z.string().uuid(),
  temperature: z.number().min(-40).max(100),
  note: z.string().max(500).optional(),
});

export type CreateReadingInput = z.infer<typeof createReadingSchema>;
