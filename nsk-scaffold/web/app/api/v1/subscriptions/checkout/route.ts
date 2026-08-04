import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

const checkoutSchema = z.object({
  plan_code: z.enum(["home_premium", "pro_starter", "pro_growth", "pro_enterprise"]),
  billing_period: z.enum(["monthly", "yearly"]).default("monthly"),
});

// POST /api/v1/subscriptions/checkout
// Crea una Stripe Checkout Session per l'abbonamento scelto. La subscription
// reale in public.subscriptions viene creata/aggiornata dal webhook dopo il
// pagamento, non qui (evita stati inconsistenti se il checkout viene abbandonato).
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten(), meta: null },
      { status: 400 }
    );
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("stripe_price_id_monthly, stripe_price_id_yearly")
    .eq("code", parsed.data.plan_code)
    .single();

  const priceId =
    parsed.data.billing_period === "yearly"
      ? plan?.stripe_price_id_yearly
      : plan?.stripe_price_id_monthly;

  if (!priceId) {
    return NextResponse.json(
      { data: null, error: "piano non configurato su Stripe (price id mancante)", meta: null },
      { status: 500 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pro?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?checkout=cancelled`,
    metadata: { user_id: user.id, plan_code: parsed.data.plan_code },
  });

  return NextResponse.json({ data: { url: session.url }, error: null, meta: null });
}
