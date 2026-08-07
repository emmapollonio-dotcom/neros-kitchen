import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FoodCostCalculator } from "@/components/food-cost/FoodCostCalculator";
import { IngredientManager } from "@/components/ingredients/IngredientManager";
import { TabSwitcher } from "@/components/layout/TabSwitcher";
import { SectionBanner } from "@/components/layout/SectionBanner";

// Protetta da middleware.ts (/food-cost richiede ruolo chef/admin).
// "Ingredienti" è confluita qui come tab: è il catalogo che alimenta il
// calcolatore, separarla in una voce di menu propria non aggiungeva chiarezza.
export default async function FoodCostPage() {
  const t = await getTranslations("foodCost");
  const supabase = await createSupabaseServerClient();
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name, default_unit")
    .order("name")
    .limit(200);

  return (
    <div className="mx-auto max-w-content px-6 py-14 text-shell-fg">
      <SectionBanner image="/images/marketing/ingredients-flatlay.webp" />
      <p className="font-body text-sm uppercase tracking-widest text-teal">N&apos;sK Pro</p>
      <h1 className="mt-2 font-display text-display-md text-shell-fg">Food Cost</h1>
      <p className="mt-2 max-w-xl font-body text-shell-fg-secondary">{t("subtitle")}</p>

      <div className="mt-10">
        <TabSwitcher
          tabs={[
            {
              id: "calcolatore",
              label: t("calculatorTab"),
              content: <FoodCostCalculator availableIngredients={ingredients ?? []} />,
            },
            {
              id: "ingredienti",
              label: t("ingredientsTab"),
              content: <IngredientManager />,
            },
          ]}
        />
      </div>
    </div>
  );
}
