import { describe, it, expect } from "vitest";
import { computeFreeSlots, type AvailabilitySlot } from "./compute-free-slots";

const NOW = new Date("2026-08-02T10:00:00Z");

function slot(id: string, start: string, end: string, booked = false): AvailabilitySlot {
  return { id, start_at: start, end_at: end, is_booked: booked };
}

describe("computeFreeSlots", () => {
  it("esclude gli slot già prenotati", () => {
    const result = computeFreeSlots(
      [
        slot("1", "2026-08-03T18:00:00Z", "2026-08-03T22:00:00Z", true),
        slot("2", "2026-08-03T19:00:00Z", "2026-08-03T23:00:00Z", false),
      ],
      NOW
    );
    const allIds = result.flatMap((d) => d.slots.map((s) => s.id));
    expect(allIds).toEqual(["2"]);
  });

  it("esclude gli slot nel passato", () => {
    const result = computeFreeSlots(
      [
        slot("past", "2026-08-01T18:00:00Z", "2026-08-01T22:00:00Z"),
        slot("future", "2026-08-05T18:00:00Z", "2026-08-05T22:00:00Z"),
      ],
      NOW
    );
    const allIds = result.flatMap((d) => d.slots.map((s) => s.id));
    expect(allIds).toEqual(["future"]);
  });

  it("raggruppa per giorno e ordina cronologicamente", () => {
    const result = computeFreeSlots(
      [
        slot("b", "2026-08-05T18:00:00Z", "2026-08-05T22:00:00Z"),
        slot("a", "2026-08-04T09:00:00Z", "2026-08-04T12:00:00Z"),
        slot("c", "2026-08-04T18:00:00Z", "2026-08-04T22:00:00Z"),
      ],
      NOW
    );
    expect(result.map((d) => d.date)).toEqual(["2026-08-04", "2026-08-05"]);
    expect(result[0].slots.map((s) => s.id)).toEqual(["a", "c"]);
  });

  it("ritorna array vuoto se non ci sono slot futuri liberi", () => {
    const result = computeFreeSlots(
      [slot("1", "2026-08-01T18:00:00Z", "2026-08-01T22:00:00Z")],
      NOW
    );
    expect(result).toEqual([]);
  });
});
