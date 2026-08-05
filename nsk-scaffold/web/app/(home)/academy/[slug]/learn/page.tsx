import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { LessonPlayer } from "@/components/academy/LessonPlayer";
import { QuizForm } from "@/components/academy/QuizForm";

interface Props {
  params: Promise<{ slug: string }>;
}

// Server Component protetto — richiede iscrizione attiva al corso.
// Non è coperto da middleware (solo /pro e /bookings lo sono), quindi il
// controllo auth + enrollment avviene qui, con RLS come rete di sicurezza
// sulle query sottostanti.
export default async function AcademyLearnPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/academy/${slug}/learn`);
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (!course) return notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, completed_at")
    .eq("course_id", course.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!enrollment) {
    redirect(`/academy/${slug}`);
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, position, video_url, pdf_url, duration_seconds")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("enrollment_id", enrollment.id);

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, passing_score, questions")
    .eq("course_id", course.id);

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Academy</p>
        <h1 className="mt-2 font-display text-3xl text-charcoal">{course.title}</h1>

        <div className="mt-10">
          <LessonPlayer lessons={lessons ?? []} initialProgress={progress ?? []} />
        </div>

        {quizzes && quizzes.length > 0 && (
          <div className="mt-16 space-y-8">
            <h2 className="font-display text-xl text-charcoal">Quiz di verifica</h2>
            {quizzes.map((quiz) => (
              <QuizForm
                key={quiz.id}
                quizId={quiz.id}
                title={quiz.title}
                passingScore={quiz.passing_score}
                questions={(quiz.questions as Array<{ id: string; prompt: string; options: string[] }>) ?? []}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
