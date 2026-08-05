"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuovaRicettaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [servings, setServings] = useState(4);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/v1/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, servings, description }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Impossibile salvare la ricetta. Controlla i dati inseriti.");
      return;
    }

    const { data } = await res.json();
    router.push(`/ricette/${data.slug}`);
  }

  return (
    <div className="min-h-screen bg-ivory px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl">Nuova ricetta</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="font-body text-sm text-smoke" htmlFor="title">
              Titolo
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body"
            />
          </div>
          <div>
            <label className="font-body text-sm text-smoke" htmlFor="servings">
              Porzioni
            </label>
            <input
              id="servings"
              type="number"
              min={1}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body"
            />
          </div>
          <div>
            <label className="font-body text-sm text-smoke" htmlFor="description">
              Descrizione
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body"
            />
          </div>

          {error && <p className="font-body text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-nsk bg-charcoal px-6 py-3 font-body text-ivory hover:bg-gold hover:text-charcoal disabled:opacity-50"
          >
            {submitting ? "Salvataggio..." : "Salva ricetta"}
          </button>
        </form>
      </div>
    </div>
  );
}
