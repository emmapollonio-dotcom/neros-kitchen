import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createWasteItemSchema } from "@/lib/validators/waste";
import { summarizeWaste } from "@/lib/waste/estimate";

// GET /api/v1/waste/items — spreco registrato dall'utente autenticato, più
// un riepilogo costi (best-effort: match per nome su ingredients, non tutti
// gli ingredienti loggati sono a catalogo). RLS "waste_items_owner" resta la
// rete di sicurezza reale.
export async function GET(_req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: items, error } = await supabase
    .from("waste_items")
    .select("id, ingredient_name, quantity, unit, reason, image_url, logged_at")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  const names = [...new Set((items ?? []).map((i) => i.ingredient_name.trim().toLowerCase()))];

  const { data: catalogMatches } = names.length
    ? await supabase.from("ingredients").select("name, avg_cost_per_unit").in(
        "name",
        // ilike per-nome esatto sarebbe più corretto con una funzione RPC; qui
        // per lo starter facciamo un match esatto case-sensitive sul nome
        // catalogato, poi il fallback normalizzato avviene lato client se serve.
        (items ?? []).map((i) => i.ingredient_name)
      )
    : { data: [] };

  const costByName = new Map<string, number>(
    (catalogMatches ?? []).map((c) => [c.name.trim().toLowerCase(), Number(c.avg_cost_per_unit ?? 0)])
  );

  const totals = summarizeWaste(
    (items ?? []).map((i) => ({
      ingredient_name: i.ingredient_name,
      quantity: Number(i.quantity ?? 0),
      unit: i.unit ?? "",
    })),
    costByName
  );

  return NextResponse.json({ data: items, error: null, meta: { totals } });
}

// POST /api/v1/waste/items — registra un nuovo spreco.
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createWasteItemSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("waste_items")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
