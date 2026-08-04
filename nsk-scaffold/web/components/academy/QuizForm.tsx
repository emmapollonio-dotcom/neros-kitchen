"use client";

import { useState } from "react";

interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
}

interface Props {
  quizId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}

interface AttemptResult {
  score: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
}

// Form quiz: le risposte vengono valutate lato server da gradeQuiz()
// (lib/academy/grade-quiz.ts) — qui inviamo solo le scelte dell'utente.
export function QuizForm({ quizId, title, passingScore, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/v1/quizzes/${quizId}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Impossibile inviare il quiz. Riprova.");
      return;
    }

    const body = await res.json();
    setResult(body.data);
  }

  return (
    <div className="rounded-nsk border border-smoke/15 bg-white p-6">
      <h2 className="font-display text-xl text-charcoal">{title}</h2>
      <p className="mt-1 font-body text-xs text-smoke">
        Soglia di superamento: {passingScore}%
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {questions.map((q, qi) => (
          <fieldset key={q.id}>
            <legend className="font-body text-sm font-semibold text-charcoal">
              {qi + 1}. {q.prompt}
            </legend>
            <div className="mt-2 space-y-2">
              {q.options.map((option, oi) => (
                <label key={oi} className="flex items-center gap-2 font-body text-sm text-charcoal">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === oi}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        {error && <p className="font-body text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || Object.keys(answers).length < questions.length}
          className="rounded-nsk bg-charcoal px-6 py-3 font-body text-ivory transition hover:bg-gold hover:text-charcoal disabled:opacity-50"
        >
          {submitting ? "Invio..." : "Invia risposte"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-6 rounded-nsk border p-4 font-body text-sm ${
            result.passed ? "border-green-600/40 bg-green-50 text-green-800" : "border-red-600/40 bg-red-50 text-red-800"
          }`}
        >
          {result.passed ? "Quiz superato! " : "Quiz non superato. "}
          Punteggio: {result.score}% ({result.correct_count}/{result.total_questions} corrette)
        </div>
      )}
    </div>
  );
}
