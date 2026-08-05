import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FoodCostCalculator } from "@/components/food-cost/FoodCostCalculator";
import { IngredientManager } from "@/components/ingredients/IngredientManager";
import { TabSwitcher } from "@/components/layout/TabSwitcher";

// Protetta da middleware.ts (/food-cost richiede ruolo chef/admin).
// "Ingredienti" è confluita qui come tab: è il catalogo che alimenta il
// calcolatore, separarla in una voce di menu propria non aggiungeva chiarezza.
export default async function FoodCostPage() {
  const supabase = await createSupabaseServerClient();
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name, default_unit")
    .order("name")
    .limit(200);

  return (
    <div className="mx-auto max-w-content px-6 py-14 text-charcoal">
      <p className="font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Pro</p>
      <h1 className="mt-2 font-display text-display-md text-charcoal">Food Cost</h1>
      <p className="mt-2 max-w-xl font-body text-smoke">
        Calcola il costo reale di una ricetta e il prezzo di vendita, con il catalogo ingredienti
        che tiene tutto aggiornato.
      </p>

      <div className="mt-10">
        <TabSwitcher
          tabs={[
            {
              id: "calcolatore",
              label: "Calcolatore",
              content: <FoodCostCalculator availableIngredients={ingredients ?? []} />,
            },
            {
              id: "ingredienti",
              label: "Ingredienti",
              content: <IngredientManager />,
            },
          ]}
        />
      </div>
    </div>
  );
}
