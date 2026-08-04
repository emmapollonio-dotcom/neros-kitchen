import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { lessonProgressSchema } from "@/lib/validators/academy";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/lessons/{id}/progress — aggiorna l'avanzamento dell'utente su una lezione.
// Richiede che l'utente sia iscritto al corso della lezione (enrollments);
// RLS "lesson_progress_owner" impone comunque che l'enrollment appartenga a auth.uid().
export async function POST(req: NextRequest, { params }: Params) {
  const { id: lessonId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = lessonProgressSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, course_id")
    .eq("id", lessonId)
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", lesson.course_id)
    .eq("user_id", user.id)
    .single();

  if (enrollmentError || !enrollment) {
    return NextResponse.json(
      { data: null, error: "non iscritto a questo corso", meta: null },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        enrollment_id: enrollment.id,
        lesson_id: lessonId,
        ...parsed.data,
      },
      { onConflict: "enrollment_id,lesson_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null });
}
