import Stripe from "stripe";

// Client Stripe server-side. Mai importare in un Client Component:
// la secret key non deve mai raggiungere il browser.
//
// Istanziato lazy (dietro un Proxy) invece che a livello di modulo: Next.js
// valuta i moduli importati dalle route anche in fase di build ("Collecting
// page data"), un ambiente dove le env var runtime potrebbero non essere
// ancora iniettate — istanziare subito `new Stripe(...)` lì rompe la build
// con "Neither apiKey nor config.authenticator provided". Con il Proxy, il
// client viene creato solo alla prima chiamata reale (`stripe.xxx.yyy()`),
// quando l'env var è garantita disponibile.
let _stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripeClient(), prop, receiver);
  },
});

export { PLATFORM_FEE_PERCENT, calculatePlatformFeeCents } from "./fee";
