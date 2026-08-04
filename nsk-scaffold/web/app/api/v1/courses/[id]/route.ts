import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCourseSchema } from "@/lib/validators/academy";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/v1/courses/{id} — dettaglio corso + lezioni.
// RLS ("courses_public_read", "lessons_read") lascia passare solo corsi
// pubblicati o di proprietà dello chef autenticato — data: null se non visibile.
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !course) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, position, video_url, pdf_url, duration_seconds")
    .eq("course_id", id)
    .order("position", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let enrollment: { id: string; completed_at: string | null } | null = null;
  if (user) {
    const { data: enrollmentRow } = await supabase
      .from("enrollments")
      .select("id, completed_at")
      .eq("course_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    enrollment = enrollmentRow;
  }

  return NextResponse.json({
    data: { ...course, lessons: lessons ?? [], enrollment },
    error: null,
    meta: null,
  });
}

// PATCH /api/v1/courses/{id} — modifica corso (titolo, prezzo, pubblicazione...).
// RLS "courses_chef_write" rifiuta l'update se l'utente non è il chef proprietario:
// non serve un controllo manuale aggiuntivo qui, il DB fa da unica fonte di verità.
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const json = await req.json();
  const parsed = createCourseSchema.partial().safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  // published è un booleano gestito a parte perché non fa parte dello schema di creazione.
  const publishedPatch =
    typeof json.published === "boolean" ? { published: json.published } : {};

  const patch = { ...parsed.data, ...publishedPatch };

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { data: null, error: "nessun campo valido da aggiornare", meta: null },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("courses")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null });
}
