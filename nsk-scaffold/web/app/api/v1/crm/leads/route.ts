import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createLeadSchema } from "@/lib/validators/crm";

// GET /api/v1/crm/leads — lead dello chef autenticato, raggruppabili per stage
// in UI. RLS "leads_chef_owner" (auth.uid() = chef_id) è comunque la rete di
// sicurezza reale: il filtro qui è solo per non affidarsi implicitamente ad essa.
export async function GET(_req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("leads")
    .select("id, full_name, email, phone, source, stage, score, created_at, followup2_sent_at")
    .eq("chef_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: { count: data.length } });
}

// POST /api/v1/crm/leads — crea un lead manuale (i lead da form pubblici
// arrivano invece via automazione n8n direttamente su Supabase).
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createLeadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({ ...parsed.data, chef_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
