import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("shoppingList");
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
      <div className="mx-auto max-w-content px-6 py-14 text-shell-fg">
        <SectionBanner image="/images/marketing/ingredients-flatlay.webp" />
        <p className="font-body text-sm uppercase tracking-widest text-teal">N&apos;sK Home</p>
        <h1 className="mt-2 font-display text-display-md text-shell-fg">{t("title")}</h1>

        <div className="mt-10 rounded-panel border border-line bg-white p-12 text-center">
          <p className="font-display text-xl text-charcoal">{t("noListsTitle")}</p>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-smoke">{t("noListsBody")}</p>
          <Link
            href="/meal-planner"
            className="mt-6 inline-block rounded-pill bg-teal px-6 py-3 font-body text-sm text-white transition hover:bg-teal-dark"
          >
            {t("goToMealPlanner")}
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
    <div className="mx-auto max-w-3xl px-6 py-14 text-shell-fg">
      <SectionBanner image="/images/marketing/ingredients-flatlay.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-teal">N&apos;sK Home</p>
      <h1 className="mt-2 font-display text-display-md text-shell-fg">{activeList.title}</h1>

      {lists.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {lists.map((l) => (
            <Link
              key={l.id}
              href={`/lista-spesa?list=${l.id}`}
              className={`rounded-pill px-4 py-1.5 font-body text-xs transition ${
                l.id === activeList.id ? "bg-teal text-white" : "bg-cream text-smoke hover:bg-line"
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
