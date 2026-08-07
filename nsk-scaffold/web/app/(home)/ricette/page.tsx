import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SectionBanner } from "@/components/layout/SectionBanner";

export const dynamic = "force-dynamic";

// Indice del ricettario personale — era linkata dalla nav ma non è mai
// esistita (solo /ricette/nuova e /ricette/[slug]): 404 reale in produzione,
// colmato qui. Protetta da middleware.ts.
// Prima pagina "di corpo" tradotta (namespace "recipes") oltre a nav/footer:
// i dati dell'utente (titolo ricetta, cucina...) restano ovviamente quello
// che l'utente ha scritto, solo la UI intorno è tradotta.
export default async function RicetteIndexPage() {
  const t = await getTranslations("recipes");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, slug, category, cuisine, servings, difficulty, food_cost_per_serving, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-content px-6 py-14 text-shell-fg">
      <SectionBanner image="/images/marketing/hero-risotto.webp" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-body text-sm uppercase tracking-widest text-teal">{t("sectionLabel")}</p>
          <h1 className="mt-2 font-display text-display-md text-shell-fg">{t("title")}</h1>
        </div>
        <Link
          href="/ricette/nuova"
          className="flex items-center gap-2 rounded-pill bg-teal px-5 py-2.5 font-body text-sm text-white transition hover:bg-teal-dark"
        >
          <Plus size={16} />
          {t("newRecipe")}
        </Link>
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="mt-10 rounded-panel border border-card-border bg-card p-12 text-center">
          <p className="font-display text-xl text-card-fg">{t("emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-card-fg-secondary">{t("emptyBody")}</p>
          <Link
            href="/ricette/nuova"
            className="mt-6 inline-block rounded-pill bg-teal px-6 py-3 font-body text-sm text-white transition hover:bg-teal-dark"
          >
            {t("createFirst")}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <Link
              key={r.id}
              href={`/ricette/${r.slug}`}
              className="rounded-card border border-card-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <p className="font-display text-lg text-card-fg">{r.title}</p>
              <p className="mt-1 font-body text-sm text-card-fg-muted">
                {[r.cuisine, r.category].filter(Boolean).join(" · ") || t("defaultLabel")}
              </p>
              <div className="mt-4 flex items-center justify-between font-body text-sm text-card-fg-secondary">
                <span>{t("servings", { count: r.servings })}</span>
                {r.food_cost_per_serving != null && (
                  <span>
                    €{Number(r.food_cost_per_serving).toFixed(2)}
                    {t("perServing")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
