import { describe, it, expect } from "vitest";
import { calculatePlatformFeeCents, PLATFORM_FEE_PERCENT } from "./fee";

describe("calculatePlatformFeeCents", () => {
  it("calcola il 12% di commissione su un importo in centesimi", () => {
    expect(calculatePlatformFeeCents(10000)).toBe(1200); // 100,00€ -> 12,00€
  });

  it("arrotonda all'intero più vicino (i centesimi non sono frazionabili)", () => {
    expect(calculatePlatformFeeCents(999)).toBe(120); // 9,99€ * 12% = 119.88 -> 120
  });

  it("resta coerente con la costante PLATFORM_FEE_PERCENT esportata", () => {
    expect(PLATFORM_FEE_PERCENT).toBe(12);
  });

  it("gestisce importo zero", () => {
    expect(calculatePlatformFeeCents(0)).toBe(0);
  });
});
