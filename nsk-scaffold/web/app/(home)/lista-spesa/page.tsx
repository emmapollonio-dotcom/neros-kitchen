import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ShoppingListBoard } from "@/components/meal-planner/ShoppingListBoard";
import { SectionBanner } from "@/components/layout/SectionBanner";

interface Props {
  searchParams: Promise<{ list?: string }>;
}

// Protetta da middleware.ts. Mostra la lista più recente per default (di
// solito quella appena generata dal Meal Planner), con uno switcher se ce
// n'è più di una.
export default async function ListaSpesaPage({ searchParams }: Props) {
  const { list } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: lists } = await supabase
    .from("shopping_lists")
    .select("id, title, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (!lists || lists.length === 0) {
    return (
      <div className="mx-auto max-w-content px-6 py-14 text-ivory">
        <SectionBanner image="/images/marketing/ingredients-flatlay.webp" />
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Home</p>
        <h1 className="mt-2 font-display text-display-md text-ivory">Lista della spesa</h1>

        <div className="mt-10 rounded-panel border border-line bg-white p-12 text-center">
          <p className="font-display text-xl text-charcoal">Nessuna lista ancora</p>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-smoke">
            Pianifica la settimana nel Meal Planner e genera la lista in automatico, oppure inizia
            da qui una lista vuota.
          </p>
          <Link
            href="/meal-planner"
            className="mt-6 inline-block rounded-pill bg-charcoal px-6 py-3 font-body text-sm text-ivory transition hover:bg-gold hover:text-charcoal"
          >
            Vai al Meal Planner
          </Link>
        </div>
      </div>
    );
  }

  const activeList = lists.find((l) => l.id === list) ?? lists[0];

  const { data: items } = await supabase
    .from("shopping_list_items")
    .select("id, ingredient_id, custom_label, quantity, unit, category, is_checked")
    .eq("shopping_list_id", activeList.id)
    .order("created_at", { ascending: true });

  const ingredientIds = [...new Set((items ?? []).map((i) => i.ingredient_id).filter(Boolean))] as string[];
  const { data: ingredients } = ingredientIds.length
    ? await supabase.from("ingredients").select("id, name").in("id", ingredientIds)
    : { data: [] };

  const ingredientNameById = Object.fromEntries((ingredients ?? []).map((i) => [i.id, i.name]));

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 text-ivory">
      <SectionBanner image="/images/marketing/ingredients-flatlay.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Home</p>
      <h1 className="mt-2 font-display text-display-md text-ivory">{activeList.title}</h1>

      {lists.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {lists.map((l) => (
            <Link
              key={l.id}
              href={`/lista-spesa?list=${l.id}`}
              className={`rounded-pill px-4 py-1.5 font-body text-xs transition ${
                l.id === activeList.id ? "bg-charcoal text-ivory" : "bg-cream text-smoke hover:bg-line"
              }`}
            >
              {l.title}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10">
        <ShoppingListBoard
          shoppingListId={activeList.id}
          items={items ?? []}
          ingredientNameById={ingredientNameById}
        />
      </div>
    </div>
  );
}
