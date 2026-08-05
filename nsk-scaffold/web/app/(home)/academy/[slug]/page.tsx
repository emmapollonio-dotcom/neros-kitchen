import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/academy/EnrollButton";

interface Props {
  params: Promise<{ slug: string }>;
}

// Server Component — pagina vendita del corso: descrizione, indice lezioni
// (senza contenuti, riservati agli iscritti) e call-to-action iscrizione.
export default async function CourseDetailPage({ params }: Props) {
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
    <div className="text-ivory">
      <section className="mx-auto max-w-3xl px-6 py-14">
        <Link
          href="/tutor-ai"
          className="inline-flex items-center gap-1 font-body text-sm text-ivory/50 transition hover:text-ivory"
        >
          <ChevronLeft size={16} />
          Tutor AI
        </Link>

        <p className="mt-6 font-body text-sm uppercase tracking-widest text-gold">
          {course.level ?? "tutti i livelli"} · {course.language}
        </p>
        <h1 className="mt-2 font-display text-display-md text-ivory">{course.title}</h1>
        {course.description && (
          <p className="mt-4 font-body text-ivory/70 leading-relaxed">{course.description}</p>
        )}

        <p className="mt-6 font-display text-2xl text-ivory">
          {course.price > 0 ? `${course.price} €` : "Gratuito"}
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
          <h2 className="font-display text-xl text-ivory">Programma del corso</h2>
          <ol className="mt-4 space-y-2">
            {(lessons ?? []).map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-center justify-between rounded-card border border-line bg-white px-4 py-3 font-body text-sm text-charcoal shadow-soft"
              >
                <span>
                  {lesson.position}. {lesson.title}
                </span>
                {lesson.duration_seconds && (
                  <span className="text-smoke">{Math.round(lesson.duration_seconds / 60)} min</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
