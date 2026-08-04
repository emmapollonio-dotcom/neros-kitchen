import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateLeadSchema } from "@/lib/validators/crm";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/v1/crm/leads/{id} — dettaglio lead + timeline attività.
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const { data: activities } = await supabase
    .from("crm_activities")
    .select("id, type, content, created_by, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    data: { ...lead, activities: activities ?? [] },
    error: null,
    meta: null,
  });
}

// PATCH /api/v1/crm/leads/{id} — aggiorna stage/score/dati contatto.
// RLS "leads_chef_owner" impone comunque auth.uid() = chef_id sull'update.
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = updateLeadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { data: null, error: "nessun campo valido da aggiornare", meta: null },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("leads")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null });
}
