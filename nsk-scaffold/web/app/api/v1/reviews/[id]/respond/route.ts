import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { invokeAgent } from "@/lib/ai/agent-client";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/reviews/{id}/respond — invoca l'agente review_responder, che
// salva da sé la risposta (colonna chef_response) tramite il tool
// save_review_response. RLS "reviews_chef_respond" impone auth.uid() =
// chef_id sull'update: un utente che non è lo chef recensito non può far
// scrivere nulla neanche passando da qui.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id, rating, comment, chef_id")
    .eq("id", id)
    .single();

  if (reviewError || !review) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  if (review.chef_id !== user.id) {
    return NextResponse.json({ data: null, error: "forbidden", meta: null }, { status: 403 });
  }

  const input = JSON.stringify({
    review_id: review.id,
    rating: review.rating,
    comment: review.comment,
  });

  const result = await invokeAgent("review_responder", input);
  if (result.error) {
    return NextResponse.json({ data: null, error: result.error, meta: null }, { status: 502 });
  }

  const { data: updatedReview } = await supabase
    .from("reviews")
    .select("id, chef_response, chef_response_at")
    .eq("id", id)
    .single();

  return NextResponse.json({
    data: updatedReview,
    error: null,
    meta: result.meta,
  });
}
