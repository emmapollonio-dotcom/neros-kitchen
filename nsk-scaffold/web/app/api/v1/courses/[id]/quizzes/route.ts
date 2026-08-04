import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createQuizSchema } from "@/lib/validators/academy";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/courses/{id}/quizzes — aggiunge un quiz al corso.
// RLS "quizzes_chef_write" impone che il chef sia il proprietario del corso.
export async function POST(req: NextRequest, { params }: Params) {
  const { id: courseId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createQuizSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("quizzes")
    .insert({ ...parsed.data, course_id: courseId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
