import { describe, it, expect } from "vitest";
import { gradeQuiz } from "./grade-quiz";

const questions = [
  { id: "q1", correct_index: 0 },
  { id: "q2", correct_index: 2 },
  { id: "q3", correct_index: 1 },
];

describe("gradeQuiz", () => {
  it("calcola il punteggio come percentuale di risposte corrette", () => {
    const result = gradeQuiz(questions, { q1: 0, q2: 2, q3: 1 }, 70);
    expect(result.score).toBe(100);
    expect(result.correct_count).toBe(3);
    expect(result.passed).toBe(true);
  });

  it("segna come non superato sotto la soglia", () => {
    const result = gradeQuiz(questions, { q1: 0, q2: 1, q3: 1 }, 70);
    expect(result.score).toBe(67);
    expect(result.passed).toBe(false);
  });

  it("tratta le domande senza risposta come sbagliate", () => {
    const result = gradeQuiz(questions, { q1: 0 }, 30);
    expect(result.correct_count).toBe(1);
    expect(result.score).toBe(33);
  });

  it("lancia un errore se il quiz non ha domande", () => {
    expect(() => gradeQuiz([], {}, 70)).toThrow("il quiz non ha domande");
  });
});
