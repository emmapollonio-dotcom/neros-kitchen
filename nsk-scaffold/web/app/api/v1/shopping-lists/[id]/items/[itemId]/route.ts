import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateShoppingListItemSchema } from "@/lib/validators/shopping-list";

interface Params {
  params: Promise<{ id: string; itemId: string }>;
}

// PATCH /api/v1/shopping-lists/{id}/items/{itemId} — soprattutto per
// spuntare/despuntare una voce mentre si è al supermercato, ma permette
// anche di correggere quantità/unità.
export async function PATCH(req: NextRequest, { params }: Params) {
  const { itemId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = updateShoppingListItemSchema.safeParse(await req.json());
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
    .from("shopping_list_items")
    .update(parsed.data)
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: null });
}

// DELETE /api/v1/shopping-lists/{id}/items/{itemId}
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { itemId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { error } = await supabase.from("shopping_list_items").delete().eq("id", itemId);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data: { id: itemId }, error: null, meta: null });
}
