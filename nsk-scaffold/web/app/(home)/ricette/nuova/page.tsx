"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
    <div className="mx-auto max-w-xl px-6 py-14 text-charcoal">
      <Link
        href="/ricette"
        className="inline-flex items-center gap-1 font-body text-sm text-mist transition hover:text-charcoal"
      >
        <ChevronLeft size={16} />
        Le tue ricette
      </Link>

      <p className="mt-6 font-body text-sm uppercase tracking-widest text-gold">N&apos;sK Home</p>
      <h1 className="mt-2 font-display text-display-md text-charcoal">Nuova ricetta</h1>
      <p className="mt-2 font-body text-sm text-smoke">
        Aggiungi gli ingredienti dalla scheda della ricetta una volta salvata: calcoliamo food cost
        e allergeni in automatico.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-card border border-line bg-white p-6 shadow-soft"
      >
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
            placeholder="Es. Risotto allo zafferano"
            className="mt-1 w-full rounded-nsk border border-line bg-white px-4 py-2 font-body text-sm text-charcoal placeholder:text-mist focus:border-gold focus:outline-none"
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
            className="mt-1 w-full rounded-nsk border border-line bg-white px-4 py-2 font-body text-sm text-charcoal focus:border-gold focus:outline-none"
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
            placeholder="Note, provenienza, occasioni d'uso..."
            className="mt-1 w-full rounded-nsk border border-line bg-white px-4 py-2 font-body text-sm text-charcoal placeholder:text-mist focus:border-gold focus:outline-none"
          />
        </div>

        {error && <p className="font-body text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-pill bg-charcoal px-6 py-3 font-body text-sm text-ivory transition hover:bg-gold hover:text-charcoal disabled:opacity-50"
        >
          {submitting ? "Salvataggio..." : "Salva ricetta"}
        </button>
      </form>
    </div>
  );
}
