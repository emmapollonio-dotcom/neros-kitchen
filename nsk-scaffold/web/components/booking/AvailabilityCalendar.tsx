"use client";

import { useState } from "react";
import type { DayGroup } from "@/lib/availability/compute-free-slots";

interface Props {
  days: DayGroup[];
  onSelectSlot: (slotId: string, startAt: string) => void;
}

export function AvailabilityCalendar({ days, onSelectSlot }: Props) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  if (days.length === 0) {
    return (
      <p className="font-body text-sm text-smoke">
        Nessuna disponibilità nei prossimi giorni. Contatta lo chef per date personalizzate.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {days.map((day) => (
        <div key={day.date}>
          <h4 className="font-body text-sm font-semibold text-charcoal">
            {new Date(day.date).toLocaleDateString("it-IT", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {day.slots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    setSelectedSlotId(slot.id);
                    onSelectSlot(slot.id, slot.start_at);
                  }}
                  className={`rounded-nsk border px-4 py-2 font-body text-sm transition ${
                    isSelected
                      ? "border-teal bg-teal text-white"
                      : "border-smoke/30 text-charcoal hover:border-teal"
                  }`}
                >
                  {new Date(slot.start_at).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
