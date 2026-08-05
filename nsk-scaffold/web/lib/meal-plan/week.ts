// Utility pure per il Meal Planner: settimana lunedì-domenica, calcolata
// dalla data locale (non UTC) per evitare che vicino alla mezzanotte il
// giorno "salti" per utenti a ovest di Greenwich.

function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Ritorna il lunedì (YYYY-MM-DD) della settimana contenente `date`.
export function getMondayOf(date: Date): string {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0 = domenica, 1 = lunedì, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + diffToMonday);
  return toIsoDate(d);
}

// Ritorna le 7 date (YYYY-MM-DD) della settimana che inizia il lunedì dato.
export function getWeekDates(mondayIso: string): string[] {
  const [y, m, d] = mondayIso.split("-").map(Number);
  const monday = new Date(y, m - 1, d);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return toIsoDate(day);
  });
}

// Sposta una data-lunedì (YYYY-MM-DD) di N settimane avanti/indietro.
export function shiftWeek(mondayIso: string, deltaWeeks: number): string {
  const [y, m, d] = mondayIso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaWeeks * 7);
  return toIsoDate(date);
}
