import { createSupabaseServerClient } from "@/lib/supabase/server";

// Server Component — legge i piani reali dalla tabella public.plans
// (RLS: policy "plans_public_read", select using (true) — vedi schema.sql).
export default async function PricingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("code, name, price_monthly, price_yearly, features")
    .order("price_monthly", { ascending: true });

  return (
    <div className="min-h-screen bg-ivory px-6 py-20 text-charcoal">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="font-display text-4xl">Piani semplici, senza sorprese</h1>
        <p className="mt-3 font-body text-smoke">
          Inizia gratis con N&apos;sK Home. Passa a Pro quando il business cresce.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(plans ?? []).map((plan) => (
          <div
            key={plan.code}
            className="flex flex-col rounded-nsk border border-smoke/15 bg-white p-6"
          >
            <h3 className="font-display text-lg">{plan.name}</h3>
            <p className="mt-4 font-body text-3xl text-charcoal">
              {plan.price_monthly === 0 ? "Gratis" : `${plan.price_monthly}€`}
              {plan.price_monthly > 0 && (
                <span className="font-body text-sm text-smoke">/mese</span>
              )}
            </p>
            <ul className="mt-6 flex-1 space-y-2 font-body text-sm text-smoke">
              {Object.entries(plan.features ?? {}).map(([key, value]) => (
                <li key={key}>
                  {value ? "✓" : "—"} {key.replace(/_/g, " ")}
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="mt-6 rounded-nsk bg-charcoal px-4 py-2 text-center font-body text-ivory hover:bg-gold hover:text-charcoal"
            >
              Scegli {plan.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
