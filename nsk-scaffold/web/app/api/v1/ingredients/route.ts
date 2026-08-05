import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createIngredientSchema } from "@/lib/validators/ingredient";

// GET /api/v1/ingredients — catalogo completo, pubblico (RLS
// "ingredients_public_read"): non richiede auth, lo consumano anche
// Food Cost e Zero Waste per stimare i costi.
export async function GET(_req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name, category, default_unit, avg_cost_per_unit, allergens, is_scrap_reusable")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: { count: data.length } });
}

// POST /api/v1/ingredients — aggiunge un ingrediente al catalogo condiviso.
// RLS "ingredients_chef_write" impone comunque ruolo chef/admin: un utente
// customer riceve comunque 401 qui, ma se anche saltassimo questo controllo
// l'insert fallirebbe comunque a livello di database.
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createIngredientSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("ingredients")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
