export interface QuizQuestion {
  id: string;
  correct_index: number;
}

export interface QuizGradeResult {
  score: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
}

// Funzione pura, testabile senza DB: dato l'elenco domande di un quiz (quizzes.questions),
// le risposte inviate dall'utente (questionId -> indice opzione scelta) e la soglia di
// superamento (quizzes.passing_score), calcola punteggio e esito.
export function gradeQuiz(
  questions: QuizQuestion[],
  answers: Record<string, number>,
  passingScore: number
): QuizGradeResult {
  if (questions.length === 0) {
    throw new Error("il quiz non ha domande");
  }

  const correctCount = questions.filter((q) => answers[q.id] === q.correct_index).length;
  const score = Math.round((correctCount / questions.length) * 100);

  return {
    score,
    passed: score >= passingScore,
    correct_count: correctCount,
    total_questions: questions.length,
  };
}
