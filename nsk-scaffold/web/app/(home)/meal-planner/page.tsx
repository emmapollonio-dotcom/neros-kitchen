import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMondayOf } from "@/lib/meal-plan/week";
import { MealPlannerBoard } from "@/components/meal-planner/MealPlannerBoard";
import { SectionBanner } from "@/components/layout/SectionBanner";

interface Props {
  searchParams: Promise<{ week?: string }>;
}

// Protetta da middleware.ts. Trova o crea (idempotente, vincolo unique su
// user_id+week_start_date) il piano della settimana mostrata, poi carica le
// voci con la ricetta collegata — stessa strategia "query separate + Map"
// della route API (niente join embedded, il client Supabase senza tipi
// generati non sa distinguere relazioni 1:1 da array).
export default async function MealPlannerPage({ searchParams }: Props) {
  const { week } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : getMondayOf(new Date());

  const { data: existingPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("week_start_date", weekStart)
    .maybeSingle();

  let planId: string | null = existingPlan?.id ?? null;

  if (!planId) {
    const { data: newPlan } = await supabase
      .from("meal_plans")
      .insert({ user_id: user.id, week_start_date: weekStart, title: "Piano settimanale" })
      .select("id")
      .single();
    planId = newPlan?.id ?? null;
  }

  if (!planId) {
    return (
      <div className="mx-auto max-w-content px-6 py-14 text-ivory">
        <p className="font-body text-sm text-ivory/70">
          Non è stato possibile aprire il piano di questa settimana. Riprova tra poco.
        </p>
      </div>
    );
  }

  const [{ data: entries }, { data: recipes }] = await Promise.all([
    supabase
      .from("meal_plan_entries")
      .select("id, recipe_id, day_date, meal_slot, servings")
      .eq("meal_plan_id", planId),
    supabase.from("recipes").select("id, title, servings").eq("owner_id", user.id).order("title"),
  ]);

  const recipeIds = [...new Set((entries ?? []).map((e) => e.recipe_id))];
  const { data: entryRecipes } = recipeIds.length
    ? await supabase.from("recipes").select("id, title, servings").in("id", recipeIds)
    : { data: [] };
  const recipeById = new Map((entryRecipes ?? []).map((r) => [r.id, r]));

  const entriesWithRecipe = (entries ?? []).map((e) => ({
    ...e,
    recipe: recipeById.get(e.recipe_id) ?? null,
  }));

  return (
    <div className="mx-auto max-w-content px-6 py-14 text-ivory">
      <SectionBanner image="/images/marketing/ingredients-flatlay.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Home</p>
      <h1 className="mt-2 font-display text-display-md text-ivory">Meal Planner</h1>
      <p className="mt-2 max-w-xl font-body text-ivory/70">
        Pianifica la settimana e genera la lista della spesa in un clic.
      </p>

      <div className="mt-10">
        <MealPlannerBoard
          mealPlanId={planId}
          weekStart={weekStart}
          entries={entriesWithRecipe}
          recipes={recipes ?? []}
        />
      </div>
    </div>
  );
}
