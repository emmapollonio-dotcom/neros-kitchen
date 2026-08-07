"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ChefCard, type ChefCardData } from "./ChefCard";

interface Props {
  chefs: ChefCardData[];
}

// Filtro lato client: il numero di chef è ancora piccolo, non serve una
// route API dedicata con paginazione/ricerca server-side finché il
// marketplace non cresce — quando servirà, si sposta qui lo stesso
// contratto (specialty + query) su /api/v1/chefs senza toccare la UI.
export function ChefListClient({ chefs }: Props) {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string | null>(null);

  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    chefs.forEach((c) => (c.specialties ?? []).forEach((s) => set.add(s)));
    return [...set].sort();
  }, [chefs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chefs.filter((c) => {
      const matchesQuery =
        !q ||
        (c.business_name ?? c.full_name).toLowerCase().includes(q) ||
        (c.bio ?? "").toLowerCase().includes(q);
      const matchesSpecialty = !specialty || (c.specialties ?? []).includes(specialty);
      return matchesQuery && matchesSpecialty;
    });
  }, [chefs, query, specialty]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per nome o specialità..."
            className="w-full rounded-pill border border-line bg-white py-3 pl-11 pr-4 font-body text-sm text-charcoal placeholder:text-mist focus:border-teal focus:outline-none"
          />
        </div>
      </div>

      {allSpecialties.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSpecialty(null)}
            className={`rounded-pill px-4 py-1.5 font-body text-xs transition ${
              specialty === null ? "bg-charcoal text-ivory" : "bg-cream text-smoke hover:bg-line"
            }`}
          >
            Tutte
          </button>
          {allSpecialties.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialty(specialty === s ? null : s)}
              className={`rounded-pill px-4 py-1.5 font-body text-xs transition ${
                specialty === s ? "bg-charcoal text-ivory" : "bg-cream text-smoke hover:bg-line"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 font-body text-sm text-smoke">
          Nessuno chef corrisponde alla ricerca. Prova un altro termine.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((chef) => (
            <ChefCard key={chef.id} chef={chef} />
          ))}
        </div>
      )}
    </div>
  );
}
