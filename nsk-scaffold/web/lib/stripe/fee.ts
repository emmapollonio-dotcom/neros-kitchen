/**
 * Calcolo commissione piattaforma — funzione pura, separata da client.ts
 * apposta per essere testabile senza istanziare l'SDK Stripe (che richiede
 * STRIPE_SECRET_KEY a runtime).
 */

// Commissione piattaforma sul marketplace (Step 1.3 Revenue Streams: 10-15%).
export const PLATFORM_FEE_PERCENT = 12;

export function calculatePlatformFeeCents(amountCents: number): number {
  return Math.round((amountCents * PLATFORM_FEE_PERCENT) / 100);
}
