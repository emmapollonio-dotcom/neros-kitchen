import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe, calculatePlatformFeeCents } from "@/lib/stripe/client";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/bookings/{id}/pay
// Crea un PaymentIntent Stripe Connect (destination charge) per una prenotazione
// già quotata dallo chef. Il denaro va allo chef (stripe_account_id) meno la
// commissione piattaforma (application_fee_amount), come da Step 1.3/Step 5.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  // RLS ("bookings_participants") garantisce che l'utente possa leggere solo
  // prenotazioni di cui è customer o chef — non serve un filtro aggiuntivo qui.
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id, chef_id, status, quote_amount, currency")
    .eq("id", id)
    .single();

  if (!booking) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }
  if (booking.customer_id !== user.id) {
    return NextResponse.json({ data: null, error: "forbidden", meta: null }, { status: 403 });
  }
  if (booking.status !== "quoted" || !booking.quote_amount) {
    return NextResponse.json(
      { data: null, error: "la prenotazione non ha ancora un preventivo confermato", meta: null },
      { status: 400 }
    );
  }

  const { data: chef } = await supabase
    .from("chefs")
    .select("stripe_account_id")
    .eq("id", booking.chef_id)
    .single();

  if (!chef?.stripe_account_id) {
    return NextResponse.json(
      { data: null, error: "lo chef non ha ancora completato l'onboarding pagamenti", meta: null },
      { status: 409 }
    );
  }

  const amountCents = Math.round(Number(booking.quote_amount) * 100);
  const applicationFeeCents = calculatePlatformFeeCents(amountCents);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: booking.currency.toLowerCase(),
    application_fee_amount: applicationFeeCents,
    transfer_data: { destination: chef.stripe_account_id },
    metadata: { booking_id: booking.id, customer_id: booking.customer_id },
  });

  // Riga payments in stato 'pending': verrà aggiornata a 'paid' dal webhook
  // (payment_intent.succeeded), mai qui — il client non deve poter auto-confermare.
  await supabase.from("payments").insert({
    booking_id: booking.id,
    user_id: user.id,
    amount: booking.quote_amount,
    currency: booking.currency,
    status: "pending",
    stripe_payment_intent_id: paymentIntent.id,
    platform_fee: applicationFeeCents / 100,
  });

  return NextResponse.json({
    data: { client_secret: paymentIntent.client_secret },
    error: null,
    meta: null,
  });
}
