import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/courses/{id}/enroll — iscrizione dell'utente autenticato al corso.
// Nota: qui non gestiamo pagamento (courses.price) — l'eventuale checkout Stripe
// avviene a monte (stesso pattern di bookings/[id]/pay), questo endpoint crea
// solo il record enrollments una volta confermato l'accesso.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, published")
    .eq("id", id)
    .single();

  if (courseError || !course || !course.published) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ data: existing, error: null, meta: { already_enrolled: true } });
  }

  const { data, error } = await supabase
    .from("enrollments")
    .insert({ course_id: id, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
