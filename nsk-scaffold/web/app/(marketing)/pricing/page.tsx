import Link from "next/link";
import { Check } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Server Component — legge i piani reali dalla tabella public.plans
// (RLS: policy "plans_public_read", select using (true) — vedi schema.sql).
export default async function PricingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("code, name, price_monthly, price_yearly, features")
    .order("price_monthly", { ascending: true });

  // Il piano "consigliato" è il primo a pagamento (pro_starter): quello che
  // la maggior parte dei chef che superano il piano gratuito sceglie.
  const firstPaidIndex = (plans ?? []).findIndex((p) => (p.price_monthly ?? 0) > 0);

  return (
    <div className="mx-auto max-w-content px-6 py-20 text-shell-fg">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-display-md text-shell-fg">Piani semplici, senza sorprese</h1>
        <p className="mt-3 font-body text-shell-fg-secondary">
          Inizia gratis con N&apos;sK Home. Passa a Pro quando il business cresce.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(plans ?? []).map((plan, i) => {
          const recommended = i === firstPaidIndex;
          return (
            <div
              key={plan.code}
              className={`flex flex-col rounded-panel border p-7 ${
                recommended
                  ? "border-teal bg-white shadow-elevated"
                  : "border-line bg-white shadow-soft"
              }`}
            >
              {recommended && (
                <span className="w-fit rounded-pill bg-teal/15 px-3 py-1 font-body text-xs text-teal-dark">
                  Più scelto
                </span>
              )}
              <h3 className="mt-3 font-display text-lg text-charcoal">{plan.name}</h3>
              <p className="mt-3 font-display text-3xl text-charcoal">
                {plan.price_monthly === 0 ? "Gratis" : `${plan.price_monthly}€`}
                {plan.price_monthly > 0 && (
                  <span className="font-body text-sm font-normal text-smoke">/mese</span>
                )}
              </p>
              <ul className="mt-6 flex-1 space-y-3 font-body text-sm text-smoke">
                {Object.entries(plan.features ?? {}).map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2">
                    {value ? (
                      <Check size={16} className="mt-0.5 shrink-0 text-teal-dark" />
                    ) : (
                      <span className="mt-0.5 w-4 shrink-0 text-center text-mist">—</span>
                    )}
                    <span className={value ? "text-charcoal" : "text-mist"}>
                      {key.replace(/_/g, " ")}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-6 rounded-pill px-4 py-2.5 text-center font-body text-sm transition ${
                  recommended
                    ? "bg-charcoal text-ivory hover:bg-teal hover:text-white"
                    : "border border-line text-charcoal hover:border-teal"
                }`}
              >
                Scegli {plan.name}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
