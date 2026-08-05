import Link from "next/link";

export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string | null;
  price: number;
}

// Catalogo corsi — ex /academy, ora confluito qui come tab "Corsi" (hub di
// apprendimento unico stile MasterClass: guida AI + corsi strutturati). Il
// dettaglio corso e la lezione restano su /academy/[slug] e
// /academy/[slug]/learn, invariati: qui cambia solo il punto d'ingresso.
export function CourseCatalog({ courses }: { courses: CourseSummary[] }) {
  if (courses.length === 0) {
    return (
      <div className="rounded-panel border border-line bg-white p-12 text-center">
        <p className="font-display text-xl text-charcoal">Nessun corso disponibile</p>
        <p className="mx-auto mt-2 max-w-md font-body text-sm text-smoke">
          Stiamo preparando i primi corsi con chef ospiti. Torna a trovarci presto.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/academy/${course.slug}`}
          className="rounded-card border border-line bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
        >
          <p className="font-body text-xs uppercase tracking-wide text-gold">
            {course.level ?? "tutti i livelli"}
          </p>
          <h2 className="mt-2 font-display text-lg text-charcoal">{course.title}</h2>
          {course.description && (
            <p className="mt-2 line-clamp-3 font-body text-sm text-smoke">{course.description}</p>
          )}
          <p className="mt-4 font-body text-sm text-charcoal">
            {course.price > 0 ? `€${course.price}` : "Gratuito"}
          </p>
        </Link>
      ))}
    </div>
  );
}
