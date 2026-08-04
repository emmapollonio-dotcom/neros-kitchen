import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createActivitySchema } from "@/lib/validators/crm";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/crm/leads/{id}/activities — registra una nota/chiamata/email/
// meeting sulla timeline del lead. RLS "crm_activities_chef_owner" verifica
// che il lead appartenga allo chef autenticato prima di permettere l'insert.
export async function POST(req: NextRequest, { params }: Params) {
  const { id: leadId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createActivitySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("crm_activities")
    .insert({ ...parsed.data, lead_id: leadId, created_by: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
