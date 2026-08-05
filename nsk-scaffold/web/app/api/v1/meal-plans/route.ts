import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createMealPlanSchema } from "@/lib/validators/meal-plan";

// GET /api/v1/meal-plans?week_start_date=YYYY-MM-DD — piani dell'utente,
// opzionalmente filtrati sulla settimana mostrata dal planner. RLS
// "meal_plans_owner" resta la rete di sicurezza reale.
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const weekStartDate = req.nextUrl.searchParams.get("week_start_date");

  let query = supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("week_start_date", { ascending: false });

  if (weekStartDate) {
    query = query.eq("week_start_date", weekStartDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: { count: data.length } });
}

// POST /api/v1/meal-plans — crea il piano per una settimana (idempotente per
// via del vincolo unique(user_id, week_start_date): se esiste già, ritorna
// quello esistente invece di fallire, così la UI può "aprire la settimana"
// senza dover prima controllare se il piano c'è già).
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createMealPlanSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start_date", parsed.data.week_start_date)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ data: existing, error: null, meta: null });
  }

  const { data, error } = await supabase
    .from("meal_plans")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
