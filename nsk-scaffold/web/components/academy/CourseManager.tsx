"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string | null;
  language: string;
  price: number;
  published: boolean;
  created_at: string;
}

interface Lesson {
  id: string;
  title: string;
  position: number;
}

interface QuizQuestionDraft {
  id: string;
  prompt: string;
  options: string[];
  correct_index: number;
}

// Dashboard chef per l'Academy: crea corsi, aggiunge lezioni e quiz,
// pubblica/nasconde. Tutte le scritture passano dalle API /api/v1/courses/*
// che a loro volta si appoggiano a RLS come unica fonte di verità sui permessi.
export function CourseManager() {
  const t = useTranslations("academyPro");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLevel, setNewLevel] = useState("base");
  const [newPrice, setNewPrice] = useState(0);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function loadCourses() {
    setLoading(true);
    const res = await fetch("/api/v1/courses?scope=mine");
    if (res.ok) {
      const body = await res.json();
      setCourses(body.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    const res = await fetch("/api/v1/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription || undefined,
        level: newLevel,
        language: "it",
        price: newPrice,
      }),
    });

    setCreating(false);

    if (!res.ok) {
      setCreateError(t("errorCreatingCourse"));
      return;
    }

    setNewTitle("");
    setNewDescription("");
    setNewPrice(0);
    await loadCourses();
  }

  async function togglePublished(course: Course) {
    const res = await fetch(`/api/v1/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !course.published }),
    });
    if (res.ok) await loadCourses();
  }

  return (
    <div className="space-y-12">
      <div className="rounded-nsk border border-smoke/15 bg-white p-6">
        <h2 className="font-display text-xl text-charcoal">{t("newCourseTitle")}</h2>
        <form onSubmit={handleCreateCourse} className="mt-4 space-y-4">
          <div>
            <label className="font-body text-sm text-smoke">{t("titleLabel")}</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              minLength={3}
              className="mt-1 w-full rounded-nsk border border-smoke/30 px-4 py-2 font-body"
            />
          </div>
          <div>
            <label className="font-body text-sm text-smoke">{t("descriptionLabel")}</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-nsk border border-smoke/30 px-4 py-2 font-body"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-smoke">{t("levelLabel")}</label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                className="mt-1 w-full rounded-nsk border border-smoke/30 px-4 py-2 font-body"
              >
                <option value="base">{t("levelBase")}</option>
                <option value="intermedio">{t("levelIntermediate")}</option>
                <option value="avanzato">{t("levelAdvanced")}</option>
              </select>
            </div>
            <div>
              <label className="font-body text-sm text-smoke">{t("priceLabel")}</label>
              <input
                type="number"
                min={0}
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="mt-1 w-full rounded-nsk border border-smoke/30 px-4 py-2 font-body"
              />
            </div>
          </div>

          {createError && <p className="font-body text-sm text-red-600">{createError}</p>}

          <button
            type="submit"
            disabled={creating}
            className="rounded-nsk bg-teal px-6 py-3 font-body text-white transition hover:bg-teal-dark disabled:opacity-50"
          >
            {creating ? t("creating") : t("createCourseDraft")}
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-display text-xl text-charcoal">{t("yourCoursesTitle")}</h2>

        {loading && <p className="mt-4 font-body text-sm text-smoke">{t("loading")}</p>}
        {!loading && courses.length === 0 && (
          <p className="mt-4 font-body text-sm text-smoke">{t("noCoursesCreated")}</p>
        )}

        <div className="mt-4 space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="rounded-nsk border border-smoke/15 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body font-semibold text-charcoal">{course.title}</p>
                  <p className="font-body text-xs text-smoke">
                    {course.published ? t("published") : t("draft")} · {course.price > 0 ? `${course.price} €` : t("free")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => togglePublished(course)}
                    className="font-body text-sm text-teal underline"
                  >
                    {course.published ? t("hide") : t("publish")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === course.id ? null : course.id)}
                    className="font-body text-sm text-charcoal underline"
                  >
                    {expandedId === course.id ? t("close") : t("manageContent")}
                  </button>
                </div>
              </div>

              {expandedId === course.id && <CourseContentEditor courseId={course.id} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseContentEditor({ courseId }: { courseId: string }) {
  const t = useTranslations("academyPro");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [savingLesson, setSavingLesson] = useState(false);

  const [quizTitle, setQuizTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([]);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizSaved, setQuizSaved] = useState(false);

  async function loadLessons() {
    const res = await fetch(`/api/v1/courses/${courseId}`);
    if (res.ok) {
      const body = await res.json();
      setLessons(body.data.lessons ?? []);
    }
  }

  useEffect(() => {
    loadLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function handleAddLesson(e: React.FormEvent) {
    e.preventDefault();
    setSavingLesson(true);

    await fetch(`/api/v1/courses/${courseId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: lessonTitle,
        position: lessons.length + 1,
        video_url: videoUrl || undefined,
      }),
    });

    setSavingLesson(false);
    setLessonTitle("");
    setVideoUrl("");
    await loadLessons();
  }

  function addQuestion() {
    setQuestions((qs) => [
      ...qs,
      { id: crypto.randomUUID().slice(0, 8), prompt: "", options: ["", ""], correct_index: 0 },
    ]);
  }

  function updateQuestion(index: number, patch: Partial<QuizQuestionDraft>) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, oi) => (oi === oIndex ? value : o)) } : q
      )
    );
  }

  async function handleCreateQuiz(e: React.FormEvent) {
    e.preventDefault();
    setSavingQuiz(true);
    setQuizSaved(false);

    const res = await fetch(`/api/v1/courses/${courseId}/quizzes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: quizTitle, passing_score: passingScore, questions }),
    });

    setSavingQuiz(false);
    if (res.ok) {
      setQuizSaved(true);
      setQuizTitle("");
      setQuestions([]);
    }
  }

  return (
    <div className="mt-4 space-y-6 border-t border-smoke/15 pt-4">
      <div>
        <h3 className="font-body text-sm font-semibold text-charcoal">{t("lessonsTitle")}</h3>
        <ul className="mt-2 space-y-1">
          {lessons.map((l) => (
            <li key={l.id} className="font-body text-sm text-smoke">
              {l.position}. {l.title}
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddLesson} className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <label className="font-body text-xs text-smoke">{t("lessonTitleLabel")}</label>
            <input
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              required
              minLength={3}
              className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="font-body text-xs text-smoke">{t("videoUrlLabel")}</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={savingLesson}
            className="rounded-nsk bg-teal px-4 py-2 font-body text-sm text-white hover:bg-teal-dark disabled:opacity-50"
          >
            {t("add")}
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-body text-sm font-semibold text-charcoal">{t("newQuizTitle")}</h3>
        <form onSubmit={handleCreateQuiz} className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs text-smoke">{t("quizTitleLabel")}</label>
              <input
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
                minLength={3}
                className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
              />
            </div>
            <div>
              <label className="font-body text-xs text-smoke">{t("passingScoreLabel")}</label>
              <input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
              />
            </div>
          </div>

          {questions.map((q, qi) => (
            <div key={q.id} className="rounded-nsk border border-smoke/20 p-3">
              <label className="font-body text-xs text-smoke">{t("questionLabel", { number: qi + 1 })}</label>
              <input
                value={q.prompt}
                onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
                className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
              />
              <div className="mt-2 space-y-1">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correct_index === oi}
                      onChange={() => updateQuestion(qi, { correct_index: oi })}
                    />
                    <input
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={t("optionPlaceholder", { number: oi + 1 })}
                      className="flex-1 rounded-nsk border border-smoke/30 px-2 py-1 font-body text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    updateQuestion(qi, { options: [...q.options, ""] })
                  }
                  className="font-body text-xs text-teal underline"
                >
                  {t("addOption")}
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addQuestion} className="font-body text-sm text-teal underline">
            {t("addQuestion")}
          </button>

          {quizSaved && <p className="font-body text-sm text-green-700">{t("quizSaved")}</p>}

          <div>
            <button
              type="submit"
              disabled={savingQuiz || questions.length === 0}
              className="rounded-nsk bg-teal px-6 py-3 font-body text-sm text-white hover:bg-teal-dark disabled:opacity-50"
            >
              {savingQuiz ? t("saving") : t("saveQuiz")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
