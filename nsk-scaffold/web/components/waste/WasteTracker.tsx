"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const WASTE_REASONS = [
  "scaduto",
  "avanzo_porzione",
  "scarto_lavorazione",
  "eccesso_ordinato",
  "danneggiato",
  "altro",
] as const;
type WasteReason = (typeof WASTE_REASONS)[number];

interface WasteItem {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  reason: WasteReason | null;
  logged_at: string;
}

interface Suggestion {
  id: string;
  suggestion_type: string;
  title: string;
  content: string;
  sustainability_score: number;
  created_at: string;
}

interface Totals {
  total_estimated_cost: number;
  items_with_known_cost: number;
  items_with_unknown_cost: number;
}

// Tracker Zero Waste: form di logging + lista sprechi + generazione
// suggerimenti AI on-demand per item. Ogni scrittura passa da /api/v1/waste/*,
// che si appoggia a RLS ("waste_items_owner", "waste_suggestions_owner") come
// unica fonte di verità sui permessi.
export function WasteTracker() {
  const t = useTranslations("zeroWaste");
  const locale = useLocale();
  const reasonLabels: Record<WasteReason, string> = {
    scaduto: t("reasonExpired"),
    avanzo_porzione: t("reasonLeftoverPortion"),
    scarto_lavorazione: t("reasonPrepWaste"),
    eccesso_ordinato: t("reasonOverordered"),
    danneggiato: t("reasonDamaged"),
    altro: t("reasonOther"),
  };
  const [items, setItems] = useState<WasteItem[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [reason, setReason] = useState<WasteReason | "">("");
  const [creating, setCreating] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [suggestionsByItem, setSuggestionsByItem] = useState<Record<string, Suggestion[]>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setLoading(true);
    const res = await fetch("/api/v1/waste/items");
    if (res.ok) {
      const body = await res.json();
      setItems(body.data ?? []);
      setTotals(body.meta?.totals ?? null);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quantity) return;
    setCreating(true);
    setError(null);

    const res = await fetch("/api/v1/waste/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredient_name: name.trim(),
        quantity: Number(quantity),
        unit,
        reason: reason || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : t("errorSaving"));
    } else {
      setName("");
      setQuantity("");
      setReason("");
      await loadItems();
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/v1/waste/items/${id}`, { method: "DELETE" });
    await loadItems();
  }

  async function handleGenerateSuggestions(id: string) {
    setGeneratingId(id);
    setError(null);
    setExpandedId(id);

    const res = await fetch(`/api/v1/waste/items/${id}/suggestions`, { method: "POST" });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setError(typeof body?.error === "string" ? body.error : t("errorGeneratingSuggestions"));
    } else {
      setSuggestionsByItem((prev) => ({ ...prev, [id]: body.data.suggestions ?? [] }));
    }
    setGeneratingId(null);
  }

  return (
    <div className="space-y-8">
      {totals && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-nsk border border-line bg-white shadow-soft p-4">
            <p className="font-body text-xs text-smoke">{t("estimatedCost")}</p>
            <p className="font-display text-2xl text-charcoal">
              {totals.total_estimated_cost.toFixed(2)} €
            </p>
          </div>
          <div className="rounded-nsk border border-line bg-white shadow-soft p-4">
            <p className="font-body text-xs text-smoke">{t("itemsKnownCost")}</p>
            <p className="font-display text-2xl text-charcoal">{totals.items_with_known_cost}</p>
          </div>
          <div className="rounded-nsk border border-line bg-white shadow-soft p-4">
            <p className="font-body text-xs text-smoke">{t("itemsUnknownCost")}</p>
            <p className="font-display text-2xl text-charcoal">{totals.items_with_unknown_cost}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-nsk border border-line bg-white shadow-soft p-4"
      >
        <div>
          <label className="font-body text-xs text-smoke">{t("ingredientLabel")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ingredientPlaceholder")}
            required
            className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>
        <div className="w-24">
          <label className="font-body text-xs text-smoke">{t("quantityLabel")}</label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>
        <div className="w-24">
          <label className="font-body text-xs text-smoke">{t("unitLabel")}</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder={t("unitPlaceholder")}
            required
            className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>
        <div>
          <label className="font-body text-xs text-smoke">{t("reasonLabel")}</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as WasteReason | "")}
            className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          >
            <option value="">—</option>
            {WASTE_REASONS.map((r) => (
              <option key={r} value={r}>
                {reasonLabels[r]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-nsk bg-teal px-5 py-2 font-body text-sm text-white hover:bg-teal-dark disabled:opacity-50"
        >
          {creating ? t("saving") : t("registerWaste")}
        </button>
      </form>

      {error && <p className="font-body text-sm text-red-600">{error}</p>}
      {loading && <p className="font-body text-sm text-smoke">{t("loading")}</p>}
      {!loading && items.length === 0 && (
        <p className="font-body text-sm text-smoke">{t("noWasteYet")}</p>
      )}

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-nsk border border-line bg-white shadow-soft p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-body font-semibold text-charcoal">
                  {item.ingredient_name}{" "}
                  <span className="font-normal text-smoke">
                    · {item.quantity} {item.unit}
                  </span>
                </p>
                <p className="font-body text-xs text-smoke">
                  {item.reason ? reasonLabels[item.reason] : t("noReasonIndicated")} ·{" "}
                  {new Date(item.logged_at).toLocaleDateString(locale)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateSuggestions(item.id)}
                  disabled={generatingId === item.id}
                  className="rounded-nsk border border-teal px-3 py-1.5 font-body text-xs text-charcoal hover:bg-teal/10 disabled:opacity-50"
                >
                  {generatingId === item.id ? t("generating") : t("aiSuggestions")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded-nsk border border-smoke/30 px-3 py-1.5 font-body text-xs text-smoke hover:border-red-400 hover:text-red-600"
                >
                  {t("delete")}
                </button>
              </div>
            </div>

            {expandedId === item.id && suggestionsByItem[item.id] && (
              <div className="mt-4 space-y-2 border-t border-smoke/10 pt-4">
                {suggestionsByItem[item.id].length === 0 && (
                  <p className="font-body text-xs text-smoke">{t("noSuggestionsYet")}</p>
                )}
                {suggestionsByItem[item.id].map((s) => (
                  <div key={s.id} className="rounded-nsk border border-teal/40 bg-teal/10 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-xs uppercase tracking-wide text-teal">
                        {s.suggestion_type}
                      </p>
                      <p className="font-body text-xs text-smoke">
                        {t("impact", { score: s.sustainability_score })}
                      </p>
                    </div>
                    <p className="mt-1 font-body text-sm font-semibold text-charcoal">{s.title}</p>
                    <p className="mt-1 whitespace-pre-wrap font-body text-sm text-charcoal">
                      {s.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
