import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

// POST /api/v1/webhooks/stripe
// Unico punto che può portare payments.status a 'paid' e scrivere in subscriptions:
// usa il service role (bypassa RLS) perché agisce per conto della piattaforma,
// non di un utente autenticato. La verifica della firma Stripe è la sola difesa
// contro richieste falsificate — non rimuoverla mai.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `signature verification failed: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServiceClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from("payments")
        .update({ status: "paid" })
        .eq("stripe_payment_intent_id", pi.id);

      const bookingId = pi.metadata?.booking_id;
      if (bookingId) {
        await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingId);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", pi.id);
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id ?? session.client_reference_id;
      const planCode = session.metadata?.plan_code;

      if (userId && session.customer) {
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: session.customer as string })
          .eq("id", userId);
      }

      if (userId && planCode && session.subscription) {
        const { data: plan } = await supabase
          .from("plans")
          .select("id")
          .eq("code", planCode)
          .single();

        if (plan) {
          await supabase.from("subscriptions").upsert(
            {
              user_id: userId,
              plan_id: plan.id,
              status: "active",
              stripe_subscription_id: session.subscription as string,
            },
            { onConflict: "stripe_subscription_id" }
          );
        }
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const status = mapStripeSubscriptionStatus(sub.status);
      await supabase
        .from("subscriptions")
        .update({
          status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    default:
      // Evento non gestito esplicitamente — ignorato volutamente, nessun log rumoroso.
      break;
  }

  return NextResponse.json({ received: true });
}

function mapStripeSubscriptionStatus(
  s: Stripe.Subscription.Status
): "trialing" | "active" | "past_due" | "canceled" | "incomplete" {
  switch (s) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      return "incomplete";
  }
}
