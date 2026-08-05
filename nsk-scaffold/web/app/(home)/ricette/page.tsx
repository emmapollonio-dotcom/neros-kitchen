import Link from "next/link";
import { Plus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Indice del ricettario personale — era linkata dalla nav ma non è mai
// esistita (solo /ricette/nuova e /ricette/[slug]): 404 reale in produzione,
// colmato qui. Protetta da middleware.ts.
export default async function RicetteIndexPage() {
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
    <div className="mx-auto max-w-content px-6 py-14 text-charcoal">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Home</p>
          <h1 className="mt-2 font-display text-display-md text-charcoal">Le tue ricette</h1>
        </div>
        <Link
          href="/ricette/nuova"
          className="flex items-center gap-2 rounded-pill bg-charcoal px-5 py-2.5 font-body text-sm text-ivory transition hover:bg-gold hover:text-charcoal"
        >
          <Plus size={16} />
          Nuova ricetta
        </Link>
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="mt-10 rounded-panel border border-line bg-white p-12 text-center">
          <p className="font-display text-xl text-charcoal">Il tuo ricettario è vuoto</p>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-smoke">
            Aggiungi la tua prima ricetta: calcoliamo food cost e allergeni automaticamente, e
            potrai usarla nel Meal Planner.
          </p>
          <Link
            href="/ricette/nuova"
            className="mt-6 inline-block rounded-pill bg-charcoal px-6 py-3 font-body text-sm text-ivory transition hover:bg-gold hover:text-charcoal"
          >
            Crea la prima ricetta
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <Link
              key={r.id}
              href={`/ricette/${r.slug}`}
              className="rounded-card border border-line bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <p className="font-display text-lg text-charcoal">{r.title}</p>
              <p className="mt-1 font-body text-sm text-mist">
                {[r.cuisine, r.category].filter(Boolean).join(" · ") || "Ricetta"}
              </p>
              <div className="mt-4 flex items-center justify-between font-body text-sm text-smoke">
                <span>{r.servings} porzioni</span>
                {r.food_cost_per_serving != null && (
                  <span>€{Number(r.food_cost_per_serving).toFixed(2)}/porzione</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
