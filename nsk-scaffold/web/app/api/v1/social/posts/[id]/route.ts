import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateSocialPostSchema } from "@/lib/validators/social";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/v1/social/posts/{id} — dettaglio post.
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data, error } = await supabase.from("social_posts").select("*").eq("id", id).single();

  if (error || !data) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  return NextResponse.json({ data, error: null, meta: null });
}

// PATCH /api/v1/social/posts/{id} — modifica manuale caption/hashtag/status
// (l'utente può sempre correggere a mano quello che ha proposto l'AI).
// RLS "social_posts_owner" impone comunque auth.uid() = user_id sull'update.
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = updateSocialPostSchema.safeParse(await req.json());
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
    .from("social_posts")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null });
}

// DELETE /api/v1/social/posts/{id}
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { error } = await supabase.from("social_posts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null, meta: null });
}
