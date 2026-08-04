import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createRecipeSchema, slugifyRecipeTitle } from "@/lib/validators/recipe";

// GET /api/v1/recipes — ricette dell'utente + pubbliche (RLS: owner_all + public_read)
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const scope = req.nextUrl.searchParams.get("scope"); // "mine" | "public" | undefined

  let query = supabase.from("recipes").select("*").order("created_at", { ascending: false });

  if (scope === "public") {
    query = query.eq("visibility", "public");
  } else if (scope === "mine") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
    }
    query = query.eq("owner_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: { count: data.length } });
}

// POST /api/v1/recipes — crea una ricetta (draft privato di default)
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createRecipeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const uniqueSuffix = crypto.randomUUID().slice(0, 8);
  const slug = slugifyRecipeTitle(parsed.data.title, uniqueSuffix);

  const { data, error } = await supabase
    .from("recipes")
    .insert({ ...parsed.data, owner_id: user.id, slug })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
