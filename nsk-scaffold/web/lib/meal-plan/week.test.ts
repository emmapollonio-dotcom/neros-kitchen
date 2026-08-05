import { describe, expect, it } from "vitest";
import { getMondayOf, getWeekDates, shiftWeek } from "./week";

describe("getMondayOf", () => {
  it("torna lo stesso giorno se è già lunedì", () => {
    expect(getMondayOf(new Date(2026, 7, 3))).toBe("2026-08-03"); // 3 ago 2026 è lunedì
  });

  it("torna indietro al lunedì per un giorno a metà settimana", () => {
    expect(getMondayOf(new Date(2026, 7, 5))).toBe("2026-08-03"); // mercoledì
  });

  it("gestisce correttamente la domenica (fine della settimana precedente)", () => {
    expect(getMondayOf(new Date(2026, 7, 9))).toBe("2026-08-03"); // domenica
  });
});

describe("getWeekDates", () => {
  it("ritorna le 7 date della settimana a partire dal lunedì", () => {
    expect(getWeekDates("2026-08-03")).toEqual([
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
      "2026-08-06",
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
    ]);
  });

  it("attraversa correttamente il cambio di mese", () => {
    const dates = getWeekDates("2026-08-31");
    expect(dates[0]).toBe("2026-08-31");
    expect(dates[1]).toBe("2026-09-01");
  });
});

describe("shiftWeek", () => {
  it("avanza di una settimana", () => {
    expect(shiftWeek("2026-08-03", 1)).toBe("2026-08-10");
  });

  it("torna indietro di una settimana", () => {
    expect(shiftWeek("2026-08-03", -1)).toBe("2026-07-27");
  });
});
