import Link from "next/link";
import { getTranslations } from "next-intl/server";

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
export async function CourseCatalog({ courses }: { courses: CourseSummary[] }) {
  const t = await getTranslations("tutorAi");

  if (courses.length === 0) {
    return (
      <div className="rounded-panel border border-card-border bg-card p-12 text-center">
        <p className="font-display text-xl text-card-fg">{t("noCoursesTitle")}</p>
        <p className="mx-auto mt-2 max-w-md font-body text-sm text-card-fg-secondary">{t("noCoursesBody")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/academy/${course.slug}`}
          className="rounded-card border border-card-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
        >
          <p className="font-body text-xs uppercase tracking-wide text-teal">
            {course.level ?? t("allLevels")}
          </p>
          <h2 className="mt-2 font-display text-lg text-card-fg">{course.title}</h2>
          {course.description && (
            <p className="mt-2 line-clamp-3 font-body text-sm text-card-fg-secondary">{course.description}</p>
          )}
          <p className="mt-4 font-body text-sm text-card-fg">
            {course.price > 0 ? `€${course.price}` : t("free")}
          </p>
        </Link>
      ))}
    </div>
  );
}
