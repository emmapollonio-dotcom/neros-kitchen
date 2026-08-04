import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createReadingSchema } from "@/lib/validators/haccp";
import { checkTemperatureReading } from "@/lib/haccp/check-reading";

// GET /api/v1/haccp/readings — rilevazioni recenti dello chef, più recenti
// prima. RLS "haccp_readings_owner" resta la rete di sicurezza reale.
export async function GET(_req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("haccp_readings")
    .select("id, control_point_id, temperature, is_non_conforming, note, recorded_at")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null });
}

// POST /api/v1/haccp/readings — registra una rilevazione temperatura.
// Il giudizio di conformità è calcolato qui (lib/haccp/check-reading.ts,
// funzione pura testata) usando la soglia del punto di controllo recuperata
// da Supabase, non lasciato al client: un client compromesso o buggato non
// deve poter dichiarare falsamente conforme una lettura fuori soglia.
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createReadingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data: controlPoint, error: cpError } = await supabase
    .from("haccp_control_points")
    .select("id, temp_min, temp_max")
    .eq("id", parsed.data.control_point_id)
    .single();

  if (cpError || !controlPoint) {
    return NextResponse.json(
      { data: null, error: "punto di controllo non trovato", meta: null },
      { status: 404 }
    );
  }

  const { isNonConforming } = checkTemperatureReading(parsed.data.temperature, {
    temp_min: Number(controlPoint.temp_min),
    temp_max: Number(controlPoint.temp_max),
  });

  const { data, error } = await supabase
    .from("haccp_readings")
    .insert({
      control_point_id: parsed.data.control_point_id,
      temperature: parsed.data.temperature,
      note: parsed.data.note,
      is_non_conforming: isNonConforming,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
