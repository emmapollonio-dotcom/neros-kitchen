import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { invokeAgent } from "@/lib/ai/agent-client";

interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correct_index: number;
}

interface Params {
  params: Promise<{ id: string; attemptId: string }>;
}

// POST /api/v1/quizzes/{id}/attempts/{attemptId}/explain — invoca l'agente
// academy_tutor sul tentativo indicato. RLS "quiz_attempts_owner" impone
// che l'attempt appartenga all'utente corrente: passiamo qui solo le
// domande sbagliate (mai la risposta corretta delle altre) come contesto.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id: quizId, attemptId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .select("id, quiz_id, answers, score, passed")
    .eq("id", attemptId)
    .single();

  if (attemptError || !attempt || attempt.quiz_id !== quizId) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  if (!attempt.answers) {
    return NextResponse.json(
      { data: null, error: "tentativo senza risposte registrate", meta: null },
      { status: 400 }
    );
  }

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("questions, passing_score")
    .eq("id", quizId)
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const answers = attempt.answers as Record<string, number>;
  const questions = quiz.questions as QuizQuestion[];

  const wrongQuestions = questions
    .filter((q) => answers[q.id] !== q.correct_index)
    .map((q) => ({
      prompt: q.prompt,
      options: q.options,
      correct_answer: q.options[q.correct_index],
      given_answer: answers[q.id] !== undefined ? q.options[answers[q.id]] : "(non risposto)",
    }));

  if (wrongQuestions.length === 0) {
    return NextResponse.json(
      { data: null, error: "nessuna risposta sbagliata da spiegare", meta: null },
      { status: 400 }
    );
  }

  const input = JSON.stringify({
    attempt_id: attempt.id,
    score: attempt.score,
    passing_score: quiz.passing_score,
    wrong_questions: wrongQuestions,
  });

  const result = await invokeAgent("academy_tutor", input);
  if (result.error) {
    return NextResponse.json({ data: null, error: result.error, meta: null }, { status: 502 });
  }

  const { data: updatedAttempt } = await supabase
    .from("quiz_attempts")
    .select("id, ai_feedback")
    .eq("id", attemptId)
    .single();

  return NextResponse.json({
    data: { ai_feedback: updatedAttempt?.ai_feedback ?? result.data?.response ?? null },
    error: null,
    meta: result.meta,
  });
}
