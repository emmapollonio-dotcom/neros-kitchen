import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/v1/haccp/control-points/{id} — rimuove un punto di controllo
// (cascata su haccp_readings/haccp_corrective_actions collegate, vedi FK
// on delete cascade in schema.sql). RLS "haccp_control_points_owner"
// impone comunque auth.uid() = user_id.
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { error } = await supabase.from("haccp_control_points").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null, meta: null });
}
