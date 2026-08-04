import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCourseSchema, slugifyCourseTitle } from "@/lib/validators/academy";

// GET /api/v1/courses — catalogo Academy.
// scope=mine -> corsi dello chef autenticato (pubblicati e in bozza);
// default -> solo corsi pubblicati (RLS "courses_public_read" filtra comunque
// come rete di sicurezza anche se il filtro applicativo venisse rimosso).
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const scope = req.nextUrl.searchParams.get("scope");

  let query = supabase
    .from("courses")
    .select("id, chef_id, title, slug, description, level, language, price, published, created_at")
    .order("created_at", { ascending: false });

  if (scope === "mine") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
    }
    query = query.eq("chef_id", user.id);
  } else {
    query = query.eq("published", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: { count: data.length } });
}

// POST /api/v1/courses — crea un corso (bozza non pubblicata di default).
// RLS "courses_chef_write" impone comunque auth.uid() = chef_id: qualunque
// chef_id diverso dall'utente autenticato verrebbe rifiutato dal DB stesso.
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createCourseSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const uniqueSuffix = crypto.randomUUID().slice(0, 8);
  const slug = slugifyCourseTitle(parsed.data.title, uniqueSuffix);

  const { data, error } = await supabase
    .from("courses")
    .insert({ ...parsed.data, chef_id: user.id, slug })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
