import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { quizAttemptSchema } from "@/lib/validators/academy";
import { gradeQuiz, type QuizQuestion } from "@/lib/academy/grade-quiz";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/quizzes/{id}/attempt — invia le risposte, calcola il punteggio con
// gradeQuiz() (funzione pura, testata separatamente) e registra il tentativo.
// Richiede iscrizione al corso a cui appartiene il quiz.
export async function POST(req: NextRequest, { params }: Params) {
  const { id: quizId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = quizAttemptSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("id, course_id, questions, passing_score")
    .eq("id", quizId)
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", quiz.course_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json(
      { data: null, error: "non iscritto a questo corso", meta: null },
      { status: 403 }
    );
  }

  let gradeResult;
  try {
    gradeResult = gradeQuiz(
      quiz.questions as QuizQuestion[],
      parsed.data.answers,
      quiz.passing_score
    );
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : "quiz non valido", meta: null },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      quiz_id: quizId,
      user_id: user.id,
      score: gradeResult.score,
      passed: gradeResult.passed,
      // Persistite per permettere all'agente academy_tutor di spiegare
      // esattamente quali risposte erano sbagliate e perché (prima non
      // venivano salvate, solo punteggio/esito aggregato).
      answers: parsed.data.answers,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json(
    { data: { ...data, correct_count: gradeResult.correct_count, total_questions: gradeResult.total_questions }, error: null, meta: null },
    { status: 201 }
  );
}
