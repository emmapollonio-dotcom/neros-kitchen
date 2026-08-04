import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

// POST /api/v1/chefs/connect
// Avvia (o riprende) l'onboarding Stripe Connect Express per lo chef autenticato.
// Necessario prima di poter ricevere pagamenti di prenotazioni (Sprint 3).
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: chef } = await supabase
    .from("chefs")
    .select("id, stripe_account_id")
    .eq("id", user.id)
    .single();

  if (!chef) {
    return NextResponse.json(
      { data: null, error: "profilo chef non trovato — completa prima l'onboarding profilo", meta: null },
      { status: 404 }
    );
  }

  let accountId = chef.stripe_account_id;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    accountId = account.id;

    await supabase.from("chefs").update({ stripe_account_id: accountId }).eq("id", user.id);
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pro/settings/payouts?refresh=1`,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pro/settings/payouts?done=1`,
    type: "account_onboarding",
  });

  return NextResponse.json({ data: { url: accountLink.url }, error: null, meta: null });
}
