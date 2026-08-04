import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(4000).optional(),
  level: z.enum(["base", "intermedio", "avanzato"]).optional(),
  language: z.string().default("it"),
  price: z.number().nonnegative().default(0),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const createLessonSchema = z.object({
  title: z.string().min(3).max(160),
  position: z.number().int().nonnegative().default(0),
  video_url: z.string().url().optional(),
  pdf_url: z.string().url().optional(),
  duration_seconds: z.number().int().positive().optional(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

export const lessonProgressSchema = z.object({
  completed: z.boolean().optional(),
  last_position_seconds: z.number().int().nonnegative().optional(),
});

export type LessonProgressInput = z.infer<typeof lessonProgressSchema>;

const quizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()).min(2),
  correct_index: z.number().int().nonnegative(),
});

export const createQuizSchema = z.object({
  title: z.string().min(3).max(160),
  passing_score: z.number().int().min(0).max(100).default(70),
  questions: z.array(quizQuestionSchema).min(1),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const quizAttemptSchema = z.object({
  // Mappa question.id -> indice opzione scelta dall'utente.
  answers: z.record(z.string(), z.number().int().nonnegative()),
});

export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>;

// Stesso pattern di slugifyRecipeTitle (lib/validators/recipe.ts): slug url-safe
// + suffisso breve, perché courses.slug è UNIQUE.
export function slugifyCourseTitle(title: string, uniqueSuffix: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${uniqueSuffix}`;
}
