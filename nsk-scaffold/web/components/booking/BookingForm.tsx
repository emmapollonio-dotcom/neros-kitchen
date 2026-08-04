"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import type { DayGroup } from "@/lib/availability/compute-free-slots";

interface Props {
  chefId: string;
  days: DayGroup[];
}

export function BookingForm({ chefId, days }: Props) {
  const router = useRouter();
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null);
  const [eventType, setEventType] = useState("cena privata");
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStartAt) {
      setError("Seleziona un orario disponibile.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/v1/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chef_id: chefId,
        event_type: eventType,
        event_date: selectedStartAt,
        guest_count: guestCount,
        notes,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json();
      setError(
        typeof body.error === "string" ? body.error : "Impossibile inviare la richiesta."
      );
      return;
    }

    router.push("/bookings?created=1");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="font-body text-sm font-semibold text-charcoal">
          Scegli data e orario
        </h3>
        <div className="mt-3">
          <AvailabilityCalendar days={days} onSelectSlot={(_, startAt) => setSelectedStartAt(startAt)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-body text-sm text-smoke" htmlFor="eventType">
            Tipo di evento
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body text-charcoal"
          >
            <option value="cena privata">Cena privata</option>
            <option value="evento aziendale">Evento aziendale</option>
            <option value="lezione di cucina">Lezione di cucina</option>
            <option value="altro">Altro</option>
          </select>
        </div>
        <div>
          <label className="font-body text-sm text-smoke" htmlFor="guestCount">
            Numero ospiti
          </label>
          <input
            id="guestCount"
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body text-charcoal"
          />
        </div>
      </div>

      <div>
        <label className="font-body text-sm text-smoke" htmlFor="notes">
          Note per lo chef (allergie, preferenze, occasione)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-nsk border border-smoke/30 bg-white px-4 py-2 font-body text-charcoal"
        />
      </div>

      {error && (
        <p className="font-body text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-nsk bg-charcoal px-6 py-3 font-body text-ivory transition hover:bg-gold hover:text-charcoal disabled:opacity-50"
      >
        {submitting ? "Invio richiesta..." : "Richiedi prenotazione"}
      </button>
      <p className="text-center font-body text-xs text-smoke">
        Nessun addebito ora. Lo chef confermerà con un preventivo.
      </p>
    </form>
  );
}
