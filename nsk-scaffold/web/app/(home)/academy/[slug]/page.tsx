import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/academy/EnrollButton";

interface Props {
  params: Promise<{ slug: string }>;
}

// Server Component — pagina vendita del corso: descrizione, indice lezioni
// (senza contenuti, riservati agli iscritti) e call-to-action iscrizione.
export default async function CourseDetailPage({ params }: Props) {
  const t = await getTranslations("academyCourse");
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, description, level, language, price, published")
    .eq("slug", slug)
    .single();

  if (!course || !course.published) return notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, position, duration_seconds")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", course.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  return (
    <div className="text-shell-fg">
      <section className="mx-auto max-w-3xl px-6 py-14">
        <Link
          href="/tutor-ai"
          className="inline-flex items-center gap-1 font-body text-sm text-shell-fg-muted transition hover:text-shell-fg"
        >
          <ChevronLeft size={16} />
          {t("backToTutorAi")}
        </Link>

        <p className="mt-6 font-body text-sm uppercase tracking-widest text-teal">
          {course.level ?? t("allLevels")} · {course.language}
        </p>
        <h1 className="mt-2 font-display text-display-md text-shell-fg">{course.title}</h1>
        {course.description && (
          <p className="mt-4 font-body text-shell-fg-secondary leading-relaxed">{course.description}</p>
        )}

        <p className="mt-6 font-display text-2xl text-shell-fg">
          {course.price > 0 ? `${course.price} €` : t("free")}
        </p>

        <div className="mt-6">
          <EnrollButton
            courseId={course.id}
            courseSlug={course.slug}
            isEnrolled={isEnrolled}
            isAuthenticated={!!user}
          />
        </div>

        <div className="mt-16">
          <h2 className="font-display text-xl text-shell-fg">{t("curriculumTitle")}</h2>
          <ol className="mt-4 space-y-2">
            {(lessons ?? []).map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-center justify-between rounded-card border border-card-border bg-card px-4 py-3 font-body text-sm text-card-fg shadow-soft"
              >
                <span>
                  {lesson.position}. {lesson.title}
                </span>
                {lesson.duration_seconds && (
                  <span className="text-card-fg-secondary">
                    {Math.round(lesson.duration_seconds / 60)} {t("minutesSuffix")}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
