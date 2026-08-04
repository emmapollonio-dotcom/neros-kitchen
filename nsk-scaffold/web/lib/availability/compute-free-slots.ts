/**
 * Funzione pura: dato l'elenco di slot di disponibilità di uno chef (tabella
 * chef_availability) e la data/ora corrente, ritorna solo gli slot futuri e
 * non ancora prenotati, ordinati cronologicamente e raggruppati per giorno.
 * Nessuna dipendenza da rete/DB — testabile in isolamento (vedi .test.ts).
 */

export interface AvailabilitySlot {
  id: string;
  start_at: string; // ISO 8601
  end_at: string; // ISO 8601
  is_booked: boolean;
}

export interface DayGroup {
  date: string; // YYYY-MM-DD
  slots: AvailabilitySlot[];
}

export function computeFreeSlots(
  allSlots: AvailabilitySlot[],
  now: Date = new Date()
): DayGroup[] {
  const future = allSlots
    .filter((s) => !s.is_booked)
    .filter((s) => new Date(s.start_at).getTime() > now.getTime())
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const byDay = new Map<string, AvailabilitySlot[]>();
  for (const slot of future) {
    const day = slot.start_at.slice(0, 10); // YYYY-MM-DD
    const existing = byDay.get(day) ?? [];
    existing.push(slot);
    byDay.set(day, existing);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, slots]) => ({ date, slots }));
}
