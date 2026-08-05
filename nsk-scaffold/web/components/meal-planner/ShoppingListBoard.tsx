"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export interface ShoppingListItem {
  id: string;
  ingredient_id: string | null;
  custom_label: string | null;
  quantity: number | null;
  unit: string | null;
  category: string | null;
  is_checked: boolean;
}

interface Props {
  shoppingListId: string;
  items: ShoppingListItem[];
  ingredientNameById: Record<string, string>;
}

export function ShoppingListBoard({ shoppingListId, items: initialItems, ingredientNameById }: Props) {
  const [items, setItems] = useState(initialItems);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  const grouped = useMemo(() => {
    const groups = new Map<string, ShoppingListItem[]>();
    for (const item of items) {
      const key = item.category ?? "Altro";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "it"));
  }, [items]);

  function itemLabel(item: ShoppingListItem): string {
    if (item.custom_label) return item.custom_label;
    if (item.ingredient_id) return ingredientNameById[item.ingredient_id] ?? "Ingrediente";
    return "Voce";
  }

  async function toggleChecked(item: ShoppingListItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_checked: !i.is_checked } : i))
    );
    await fetch(`/api/v1/shopping-lists/${shoppingListId}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_checked: !item.is_checked }),
    });
  }

  async function removeItem(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await fetch(`/api/v1/shopping-lists/${shoppingListId}/items/${itemId}`, { method: "DELETE" });
  }

  async function addItem() {
    if (!newLabel.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/v1/shopping-lists/${shoppingListId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ custom_label: newLabel.trim() }),
    });
    setAdding(false);
    if (res.ok) {
      const { data } = await res.json();
      setItems((prev) => [...prev, data]);
      setNewLabel("");
    }
  }

  const checkedCount = items.filter((i) => i.is_checked).length;

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-line">
          <div
            className="h-full rounded-pill bg-gold transition-all"
            style={{ width: items.length ? `${(checkedCount / items.length) * 100}%` : "0%" }}
          />
        </div>
        <p className="shrink-0 font-body text-xs text-mist">
          {checkedCount}/{items.length}
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {grouped.map(([category, groupItems]) => (
          <div key={category}>
            <h2 className="font-body text-xs uppercase tracking-widest text-mist">{category}</h2>
            <div className="mt-3 space-y-2">
              {groupItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 rounded-card border border-line bg-white px-4 py-3 shadow-soft"
                >
                  <button
                    onClick={() => toggleChecked(item)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                      item.is_checked ? "border-gold bg-gold" : "border-line"
                    }`}
                    aria-label={item.is_checked ? "Segna come da comprare" : "Segna come comprato"}
                  >
                    {item.is_checked && <span className="h-2 w-2 rounded-full bg-charcoal" />}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`font-body text-sm ${
                        item.is_checked ? "text-mist line-through" : "text-charcoal"
                      }`}
                    >
                      {itemLabel(item)}
                    </p>
                    {(item.quantity || item.unit) && (
                      <p className="font-body text-xs text-mist">
                        {item.quantity} {item.unit}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-mist opacity-0 transition hover:text-charcoal group-hover:opacity-100"
                    aria-label="Rimuovi"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="font-body text-sm text-smoke">Lista vuota — aggiungi una voce qui sotto.</p>
        )}
      </div>

      <div className="mt-8 flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Aggiungi una voce (es. tovaglioli)"
          className="flex-1 rounded-pill border border-line bg-white px-4 py-2.5 font-body text-sm text-charcoal placeholder:text-mist focus:border-gold focus:outline-none"
        />
        <button
          onClick={addItem}
          disabled={adding || !newLabel.trim()}
          className="flex items-center gap-1 rounded-pill bg-charcoal px-4 py-2.5 font-body text-sm text-ivory transition hover:bg-gold hover:text-charcoal disabled:opacity-40"
        >
          <Plus size={16} />
          Aggiungi
        </button>
      </div>
    </div>
  );
}
