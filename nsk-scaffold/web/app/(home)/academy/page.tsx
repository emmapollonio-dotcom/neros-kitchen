import { createSupabaseServerClient } from "@/lib/supabase/server";

// Server Component — catalogo pubblico Academy (SEO-friendly, SSR).
export default async function AcademyPage() {
  const supabase = await createSupabaseServerClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, description, level, language, price")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Academy</p>
        <h1 className="mt-2 font-display text-4xl text-charcoal">Corsi di cucina</h1>
        <p className="mt-4 max-w-2xl font-body text-smoke leading-relaxed">
          Impara direttamente dagli chef: video lezioni, materiali scaricabili e quiz per
          verificare i progressi.
        </p>

        {(!courses || courses.length === 0) && (
          <p className="mt-12 font-body text-sm text-smoke">Nessun corso disponibile al momento.</p>
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(courses ?? []).map((course) => (
            <a
              key={course.id}
              href={`/academy/${course.slug}`}
              className="rounded-nsk border border-smoke/15 bg-white p-6 transition hover:border-gold"
            >
              <p className="font-body text-xs uppercase tracking-wide text-gold">
                {course.level ?? "tutti i livelli"}
              </p>
              <h2 className="mt-2 font-display text-xl text-charcoal">{course.title}</h2>
              {course.description && (
                <p className="mt-2 line-clamp-3 font-body text-sm text-smoke">
                  {course.description}
                </p>
              )}
              <p className="mt-4 font-body text-sm text-charcoal">
                {course.price > 0 ? `${course.price} €` : "Gratuito"}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
