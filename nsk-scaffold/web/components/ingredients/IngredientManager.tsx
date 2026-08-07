"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Ingredient {
  id: string;
  name: string;
  category: string | null;
  default_unit: string;
  avg_cost_per_unit: number | null;
  allergens: string[] | null;
  is_scrap_reusable: boolean | null;
}

// Gestione catalogo ingredienti: modifica prezzo/unità inline sulla riga
// esistente, form per aggiungerne di nuovi. Il catalogo è condiviso (non
// per-chef): ogni scrittura passa da /api/v1/ingredients, che si appoggia a
// RLS ("ingredients_chef_write") come unica fonte di verità sui permessi.
export function IngredientManager() {
  const t = useTranslations("ingredients");
  const locale = useLocale();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("kg");
  const [cost, setCost] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadIngredients() {
    setLoading(true);
    const res = await fetch("/api/v1/ingredients");
    if (res.ok) {
      const body = await res.json();
      setIngredients(body.data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadIngredients();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Ingredient[]>();
    for (const item of ingredients) {
      const key = item.category ?? t("uncategorized");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, locale));
  }, [ingredients, t, locale]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !unit.trim()) return;
    setCreating(true);
    setError(null);

    const res = await fetch("/api/v1/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        category: category.trim() || undefined,
        default_unit: unit.trim(),
        avg_cost_per_unit: cost ? Number(cost) : undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : t("errorSaving"));
    } else {
      setName("");
      setCategory("");
      setCost("");
    }
    setCreating(false);
    await loadIngredients();
  }

  async function handleUpdatePrice(id: string, value: string) {
    const parsed = value === "" ? undefined : Number(value);
    if (parsed !== undefined && Number.isNaN(parsed)) return;

    setSavingId(id);
    setError(null);

    const res = await fetch(`/api/v1/ingredients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avg_cost_per_unit: parsed }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : t("errorUpdatingPrice"));
    }
    setSavingId(null);
    await loadIngredients();
  }

  async function handleUpdateUnit(id: string, value: string) {
    if (!value.trim()) return;
    setSavingId(id);
    setError(null);

    const res = await fetch(`/api/v1/ingredients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ default_unit: value.trim() }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : t("errorUpdatingUnit"));
    }
    setSavingId(null);
    await loadIngredients();
  }

  async function handleDelete(id: string) {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/v1/ingredients/${id}`, { method: "DELETE" });
    await loadIngredients();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-nsk border border-smoke/15 bg-card p-4"
      >
        <div>
          <label className="font-body text-xs text-card-fg-secondary">{t("nameLabel")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            required
            className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>
        <div>
          <label className="font-body text-xs text-card-fg-secondary">{t("categoryLabel")}</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t("categoryPlaceholder")}
            className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>
        <div className="w-24">
          <label className="font-body text-xs text-card-fg-secondary">{t("unitLabel")}</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>
        <div className="w-28">
          <label className="font-body text-xs text-card-fg-secondary">{t("costLabel")}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-nsk bg-teal px-5 py-2 font-body text-sm text-white hover:bg-teal-dark disabled:opacity-50"
        >
          {creating ? t("saving") : t("addIngredient")}
        </button>
      </form>

      {error && <p className="font-body text-sm text-red-600">{error}</p>}
      {loading && <p className="font-body text-sm text-card-fg-secondary">{t("loading")}</p>}
      {!loading && ingredients.length === 0 && (
        <p className="font-body text-sm text-card-fg-secondary">{t("noIngredients")}</p>
      )}

      <div className="space-y-6">
        {grouped.map(([category, items]) => (
          <div key={category}>
            <h2 className="font-body text-xs font-semibold uppercase tracking-wide text-card-fg-secondary">
              {category}
            </h2>
            <div className="mt-2 divide-y divide-smoke/10 rounded-nsk border border-smoke/15 bg-card">
              {items.map((ing) => (
                <div
                  key={ing.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <p className="font-body text-sm text-card-fg">{ing.name}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={ing.avg_cost_per_unit ?? ""}
                      onBlur={(e) => handleUpdatePrice(ing.id, e.target.value)}
                      disabled={savingId === ing.id}
                      className="w-24 rounded-nsk border border-smoke/30 px-2 py-1 font-body text-sm"
                    />
                    <span className="font-body text-xs text-card-fg-secondary">€ /</span>
                    <input
                      defaultValue={ing.default_unit}
                      onBlur={(e) => handleUpdateUnit(ing.id, e.target.value)}
                      disabled={savingId === ing.id}
                      className="w-16 rounded-nsk border border-smoke/30 px-2 py-1 font-body text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(ing.id)}
                      className="font-body text-xs text-card-fg-secondary hover:text-red-600"
                      aria-label={t("deleteAria", { name: ing.name })}
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
