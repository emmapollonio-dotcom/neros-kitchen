"use client";

import { useState } from "react";
import Image from "next/image";
import { MediaGallery } from "@/components/dashboard/MediaGallery";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  servings: number;
  category: string | null;
  cuisine: string | null;
  difficulty: string | null;
  allergens: string[] | null;
  allergen_notes: string | null;
  images: string[] | null;
}

interface IngredientLine {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Props {
  recipe: Recipe;
  ingredients: IngredientLine[];
  isOwner: boolean;
}

// Dettaglio ricetta + bottone "Rileva allergeni con AI" (solo proprietario):
// chiama l'agente allergen_advisor, che salva da sé allergens/allergen_notes
// sulla ricetta (RLS "recipes_owner_all" impone comunque auth.uid() = owner_id).
export function RecipeDetail({ recipe, ingredients, isOwner }: Props) {
  const [allergens, setAllergens] = useState<string[]>(recipe.allergens ?? []);
  const [notes, setNotes] = useState<string | null>(recipe.allergen_notes);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDetectAllergens() {
    setAnalyzing(true);
    setError(null);

    const res = await fetch(`/api/v1/recipes/${recipe.id}/detect-allergens`, { method: "POST" });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setError(body?.error ?? "Errore nell'analisi allergeni.");
    } else {
      setAllergens(body.data.allergens ?? []);
      setNotes(body.data.allergen_notes ?? null);
    }
    setAnalyzing(false);
  }

  return (
    <div>
      <p className="font-body text-sm uppercase tracking-widest text-gold">
        {recipe.category ?? "Ricetta"} {recipe.cuisine ? `· ${recipe.cuisine}` : ""}
      </p>
      <h1 className="mt-2 font-display text-3xl text-charcoal">{recipe.title}</h1>
      <p className="mt-2 font-body text-sm text-smoke">
        {recipe.servings} porzioni {recipe.difficulty ? `· difficoltà ${recipe.difficulty}` : ""}
      </p>

      {recipe.description && (
        <p className="mt-4 font-body text-charcoal leading-relaxed">{recipe.description}</p>
      )}

      <div className="mt-8">
        <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-smoke">
          Foto
        </h2>
        <div className="mt-3">
          {isOwner ? (
            <MediaGallery recipeId={recipe.id} initialImages={recipe.images ?? []} />
          ) : (recipe.images ?? []).length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(recipe.images ?? []).map((url) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-card border border-line bg-cream shadow-soft"
                >
                  <Image src={url} alt="" fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-smoke">Nessuna foto ancora.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-smoke">
          Ingredienti
        </h2>
        {ingredients.length === 0 ? (
          <p className="mt-2 font-body text-sm text-smoke">Nessun ingrediente collegato.</p>
        ) : (
          <ul className="mt-3 space-y-1">
            {ingredients.map((line) => (
              <li key={line.id} className="font-body text-sm text-charcoal">
                {line.quantity} {line.unit} — {line.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 rounded-card border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-smoke">
            Allergeni
          </h2>
          {isOwner && ingredients.length > 0 && (
            <button
              type="button"
              onClick={handleDetectAllergens}
              disabled={analyzing}
              className="rounded-nsk bg-charcoal px-4 py-2 font-body text-xs text-ivory hover:bg-gold hover:text-charcoal disabled:opacity-50"
            >
              {analyzing ? "Analizzo..." : "Rileva allergeni con AI"}
            </button>
          )}
        </div>

        {error && <p className="mt-2 font-body text-sm text-red-600">{error}</p>}

        {allergens.length === 0 ? (
          <p className="mt-3 font-body text-sm text-smoke">Nessun allergene rilevato.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {allergens.map((a) => (
              <span
                key={a}
                className="rounded-full bg-gold/15 px-3 py-1 font-body text-xs text-charcoal"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {notes && <p className="mt-3 font-body text-sm text-smoke">{notes}</p>}
      </div>
    </div>
  );
}
