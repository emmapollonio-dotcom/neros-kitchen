import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createShoppingListItemSchema } from "@/lib/validators/shopping-list";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/shopping-lists/{id}/items — aggiunge una voce manuale
// (ingrediente a catalogo o etichetta libera, es. "tovaglioli").
export async function POST(req: NextRequest, { params }: Params) {
  const { id: shoppingListId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createShoppingListItemSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  if (!parsed.data.ingredient_id && !parsed.data.custom_label) {
    return NextResponse.json(
      { data: null, error: "serve ingredient_id oppure custom_label", meta: null },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("shopping_list_items")
    .insert({ ...parsed.data, shopping_list_id: shoppingListId, source: "manual" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
