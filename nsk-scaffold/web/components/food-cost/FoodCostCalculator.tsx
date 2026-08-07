"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { FoodCostResult } from "@/lib/food-cost/calculate";

interface IngredientRow {
  ingredient_id: string;
  name: string;
  quantity: number;
  unit: string;
}

// Component client per /pro/food-cost. Chiama la vera API
// POST /api/v1/food-cost/calculate — nessun calcolo duplicato lato client,
// la fonte di verità resta il server (stessa logica testata in calculate.test.ts).
export function FoodCostCalculator({
  availableIngredients,
}: {
  availableIngredients: { id: string; name: string; default_unit: string }[];
}) {
  const t = useTranslations("foodCost");
  const [rows, setRows] = useState<IngredientRow[]>([]);
  const [servings, setServings] = useState(4);
  const [targetMargin, setTargetMargin] = useState(70);
  const [result, setResult] = useState<FoodCostResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addRow() {
    const first = availableIngredients[0];
    if (!first) return;
    setRows((r) => [
      ...r,
      { ingredient_id: first.id, name: first.name, quantity: 100, unit: first.default_unit },
    ]);
  }

  function updateRow(index: number, patch: Partial<IngredientRow>) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index));
  }

  async function calculate() {
    if (rows.length === 0) {
      setError(t("errorNoIngredients"));
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/v1/food-cost/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        servings,
        target_margin_pct: targetMargin,
        ingredients: rows.map((r) => ({
          ingredient_id: r.ingredient_id,
          quantity: r.quantity,
          unit: r.unit,
        })),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError(t("errorCalculation"));
      return;
    }

    const body = await res.json();
    setResult(body.data);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-body text-sm text-smoke">{t("servingsLabel")}</label>
          <input
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="mt-1 w-full rounded-nsk border border-smoke/30 px-4 py-2"
          />
        </div>
        <div>
          <label className="font-body text-sm text-smoke">{t("targetMarginLabel")}</label>
          <input
            type="number"
            min={0}
            max={99}
            value={targetMargin}
            onChange={(e) => setTargetMargin(Number(e.target.value))}
            className="mt-1 w-full rounded-nsk border border-smoke/30 px-4 py-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={row.ingredient_id}
              onChange={(e) => {
                const ing = availableIngredients.find((x) => x.id === e.target.value);
                updateRow(i, {
                  ingredient_id: e.target.value,
                  name: ing?.name ?? row.name,
                  unit: ing?.default_unit ?? row.unit,
                });
              }}
              className="flex-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            >
              {availableIngredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={row.quantity}
              onChange={(e) => updateRow(i, { quantity: Number(e.target.value) })}
              className="w-24 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            />
            <span className="font-body text-sm text-smoke">{row.unit}</span>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="font-body text-sm text-red-600"
            >
              {t("remove")}
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="font-body text-sm text-teal underline"
        >
          {t("addIngredient")}
        </button>
      </div>

      {error && <p className="font-body text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={calculate}
        disabled={loading}
        className="rounded-nsk bg-teal px-6 py-3 font-body text-white hover:bg-teal-dark disabled:opacity-50"
      >
        {loading ? t("calculating") : t("calculate")}
      </button>

      {result && (
        <div className="rounded-nsk border border-teal/40 bg-teal/10 p-6">
          <dl className="grid grid-cols-2 gap-4 font-body text-sm">
            <div>
              <dt className="text-smoke">{t("totalCost")}</dt>
              <dd className="text-lg text-charcoal">{result.food_cost_total} €</dd>
            </div>
            <div>
              <dt className="text-smoke">{t("costPerServing")}</dt>
              <dd className="text-lg text-charcoal">{result.food_cost_per_serving} €</dd>
            </div>
            <div>
              <dt className="text-smoke">{t("suggestedPrice")}</dt>
              <dd className="text-lg text-charcoal">
                {result.suggested_price_per_serving ?? "—"} €
              </dd>
            </div>
            <div>
              <dt className="text-smoke">{t("foodCostPercentage")}</dt>
              <dd className="text-lg text-charcoal">{result.food_cost_percentage ?? "—"}%</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
