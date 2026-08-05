import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const createBookingSchema = z.object({
  chef_id: z.string().uuid(),
  event_type: z.string().min(1),
  event_date: z.string().datetime(),
  guest_count: z.number().int().positive().optional(),
  location: z.record(z.any()).optional(),
  notes: z.string().max(2000).optional(),
});

// GET /api/v1/bookings — lista prenotazioni dell'utente autenticato
// (RLS filtra automaticamente per customer_id / chef_id = auth.uid()).
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { data: null, error: "unauthorized", meta: null },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    return NextResponse.json(
      { data: null, error: error.message, meta: null },
      { status: 500 }
    );
  }

  return NextResponse.json({ data, error: null, meta: { count: data.length } });
}

// POST /api/v1/bookings — crea richiesta di prenotazione (status: requested)
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { data: null, error: "unauthorized", meta: null },
      { status: 401 }
    );
  }

  // Max 10 richieste di prenotazione ogni 10 minuti per utente: sufficiente
  // per un uso normale, blocca spam/harassment verso gli chef.
  const ok = await checkRateLimit(supabase, `bookings:${user.id}`, 10, 600);
  if (!ok) return rateLimitResponse("hai creato troppe richieste di prenotazione, riprova tra qualche minuto");

  const json = await req.json();
  const parsed = createBookingSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      ...parsed.data,
      customer_id: user.id,
      status: "requested",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { data: null, error: error.message, meta: null },
      { status: 500 }
    );
  }

  return NextResponse.json({ data, error: null, meta: null }, { status: 201 });
}
