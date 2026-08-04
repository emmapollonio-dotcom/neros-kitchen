import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createReviewSchema = z.object({
  booking_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// POST /api/v1/reviews — una sola recensione per booking (vincolo unique in DB),
// solo se la prenotazione è 'completed' e appartiene al reviewer.
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = createReviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, chef_id, customer_id, status")
    .eq("id", parsed.data.booking_id)
    .single();

  if (!booking) {
    return NextResponse.json({ data: null, error: "booking non trovato", meta: null }, { status: 404 });
  }
  if (booking.customer_id !== user.id) {
    return NextResponse.json({ data: null, error: "forbidden", meta: null }, { status: 403 });
  }
  if (booking.status !== "completed") {
    return NextResponse.json(
      { data: null, error: "puoi recensire solo prenotazioni completate", meta: null },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      booking_id: booking.id,
      chef_id: booking.chef_id,
      reviewer_id: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    })
    .select()
    .single();

  if (error) {
    // Violazione unique (booking già recensito) -> messaggio chiaro invece dell'errore Postgres grezzo
    const message = error.code === "23505" ? "hai già recensito questa prenotazione" : error.message;
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 409 });
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
