import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const urlSchema = z.object({ url: z.string().url() });

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/recipes/[id]/images — aggiunge una foto già caricata su
// Storage (bucket "recipe-photos") all'array recipes.images. Il file è
// caricato dal browser direttamente su Storage (MediaGallery.tsx): qui
// arriva solo l'URL pubblico risultante, non i byte dell'immagine.
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = urlSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, owner_id, images")
    .eq("id", id)
    .single();

  if (!recipe || recipe.owner_id !== user.id) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const nextImages = [...(recipe.images ?? []), parsed.data.url];

  const { data, error } = await supabase
    .from("recipes")
    .update({ images: nextImages })
    .eq("id", id)
    .select("images")
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}

// DELETE /api/v1/recipes/[id]/images — rimuove un URL dall'array. Il file su
// Storage viene rimosso lato client (MediaGallery.tsx ha già i permessi RLS
// "recipe_photos_owner_delete" per farlo direttamente), qui si aggiorna solo
// la riga recipes.
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = urlSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, owner_id, images")
    .eq("id", id)
    .single();

  if (!recipe || recipe.owner_id !== user.id) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const nextImages = (recipe.images ?? []).filter((url: string) => url !== parsed.data.url);

  const { data, error } = await supabase
    .from("recipes")
    .update({ images: nextImages })
    .eq("id", id)
    .select("images")
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null });
}
