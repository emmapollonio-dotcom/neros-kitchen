"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Lesson {
  id: string;
  title: string;
  position: number;
  video_url: string | null;
  pdf_url: string | null;
  duration_seconds: number | null;
}

interface Progress {
  lesson_id: string;
  completed: boolean;
}

interface Props {
  lessons: Lesson[];
  initialProgress: Progress[];
}

// Lista lezioni + player della lezione selezionata, con segna-come-completata
// via POST /api/v1/lessons/{id}/progress (stessa API usata per tracciare last_position).
export function LessonPlayer({ lessons, initialProgress }: Props) {
  const t = useTranslations("academyCourse");
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(initialProgress.filter((p) => p.completed).map((p) => p.lesson_id))
  );
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(lessons[0] ?? null);
  const [saving, setSaving] = useState(false);

  async function markCompleted(lessonId: string) {
    setSaving(true);
    const res = await fetch(`/api/v1/lessons/${lessonId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    setSaving(false);

    if (res.ok) {
      setCompletedIds((prev) => new Set(prev).add(lessonId));
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[280px_1fr]">
      <aside className="space-y-1">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            onClick={() => setActiveLesson(lesson)}
            className={`flex w-full items-center justify-between rounded-nsk px-4 py-3 text-left font-body text-sm transition ${
              activeLesson?.id === lesson.id
                ? "bg-teal text-white"
                : "bg-card text-card-fg hover:bg-teal/10"
            }`}
          >
            <span>
              {lesson.position}. {lesson.title}
            </span>
            {completedIds.has(lesson.id) && <span className="text-teal">✓</span>}
          </button>
        ))}
      </aside>

      <section className="rounded-nsk border border-smoke/15 bg-card p-6">
        {!activeLesson ? (
          <p className="font-body text-sm text-card-fg-secondary">{t("noLessonsAvailable")}</p>
        ) : (
          <div>
            <h2 className="font-display text-2xl text-card-fg">{activeLesson.title}</h2>

            {activeLesson.video_url && (
              <video
                key={activeLesson.id}
                controls
                className="mt-4 aspect-video w-full rounded-nsk bg-charcoal"
                src={activeLesson.video_url}
              />
            )}

            {activeLesson.pdf_url && (
              <a
                href={activeLesson.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block font-body text-sm text-teal underline"
              >
                {t("downloadPdf")}
              </a>
            )}

            <button
              type="button"
              onClick={() => markCompleted(activeLesson.id)}
              disabled={saving || completedIds.has(activeLesson.id)}
              className="mt-6 rounded-nsk bg-teal px-6 py-3 font-body text-white transition hover:bg-teal-dark disabled:opacity-50"
            >
              {completedIds.has(activeLesson.id) ? t("lessonCompleted") : t("markAsCompleted")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
