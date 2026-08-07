"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import type { DayGroup } from "@/lib/availability/compute-free-slots";

interface Props {
  chefId: string;
  days: DayGroup[];
}

export function BookingForm({ chefId, days }: Props) {
  const t = useTranslations("booking");
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
      setError(t("errorSelectSlot"));
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
        typeof body.error === "string" ? body.error : t("errorSubmit")
      );
      return;
    }

    router.push("/bookings?created=1");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="font-body text-sm font-semibold text-card-fg">
          {t("chooseDateTime")}
        </h3>
        <div className="mt-3">
          <AvailabilityCalendar days={days} onSelectSlot={(_, startAt) => setSelectedStartAt(startAt)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-body text-sm text-card-fg-secondary" htmlFor="eventType">
            {t("eventTypeLabel")}
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="mt-1 w-full rounded-nsk border border-smoke/30 bg-card px-4 py-2 font-body text-card-fg"
          >
            <option value="cena privata">{t("eventTypePrivateDinner")}</option>
            <option value="evento aziendale">{t("eventTypeCorporate")}</option>
            <option value="lezione di cucina">{t("eventTypeCookingClass")}</option>
            <option value="altro">{t("eventTypeOther")}</option>
          </select>
        </div>
        <div>
          <label className="font-body text-sm text-card-fg-secondary" htmlFor="guestCount">
            {t("guestCountLabel")}
          </label>
          <input
            id="guestCount"
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="mt-1 w-full rounded-nsk border border-smoke/30 bg-card px-4 py-2 font-body text-card-fg"
          />
        </div>
      </div>

      <div>
        <label className="font-body text-sm text-card-fg-secondary" htmlFor="notes">
          {t("notesLabel")}
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-nsk border border-smoke/30 bg-card px-4 py-2 font-body text-card-fg"
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
        className="w-full rounded-nsk bg-teal px-6 py-3 font-body text-white transition hover:bg-teal-dark disabled:opacity-50"
      >
        {submitting ? t("submitting") : t("requestBooking")}
      </button>
      <p className="text-center font-body text-xs text-card-fg-secondary">{t("noChargeNow")}</p>
    </form>
  );
}
