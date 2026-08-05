import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createMealPlanEntrySchema } from "@/lib/validators/meal-plan";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/meal-plans/{id}/entries — aggiunge una ricetta a un giorno/slot
// del piano. RLS "meal_plan_entries_owner" verifica che il piano appartenga
// all'utente; qui verifichiamo anche che la ricetta sia leggibile da lui
// (propria o pubblica) prima di collegarla, per un errore più chiaro del
// generico "violazione permessi" che darebbe l'insert.
export async function POST(req: NextRequest, { params }: Params) {
  const { id: mealPlanId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createMealPlanEntrySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, title, slug, images, servings")
    .eq("id", parsed.data.recipe_id)
    .maybeSingle();

  if (!recipe) {
    return NextResponse.json(
      { data: null, error: "ricetta non trovata o non accessibile", meta: null },
      { status: 404 }
    );
  }

  const { data: entry, error } = await supabase
    .from("meal_plan_entries")
    .insert({ ...parsed.data, meal_plan_id: mealPlanId })
    .select("id, recipe_id, day_date, meal_slot, servings, notes")
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json(
    { data: { ...entry, recipe }, error: null, meta: null },
    { status: 201 }
  );
}
