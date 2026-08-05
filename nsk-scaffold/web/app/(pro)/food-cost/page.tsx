import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FoodCostCalculator } from "@/components/food-cost/FoodCostCalculator";

// Protetta da middleware.ts (/pro richiede ruolo chef/admin).
export default async function FoodCostPage() {
  const supabase = await createSupabaseServerClient();
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name, default_unit")
    .order("name")
    .limit(200);

  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-3xl">
        <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
        <h1 className="mt-2 font-display text-3xl">Food Cost</h1>
        <p className="mt-2 font-body text-smoke">
          Calcola il costo reale di una ricetta e il prezzo di vendita in base al margine
          che vuoi mantenere.
        </p>

        <div className="mt-10">
          <FoodCostCalculator availableIngredients={ingredients ?? []} />
        </div>
      </div>
    </div>
  );
}
