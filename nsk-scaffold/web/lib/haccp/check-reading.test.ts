import { describe, it, expect } from "vitest";
import { checkTemperatureReading } from "./check-reading";

describe("checkTemperatureReading", () => {
  const threshold = { temp_min: 0, temp_max: 4 };

  it("segnala conforme quando la temperatura è entro soglia", () => {
    const result = checkTemperatureReading(2, threshold);
    expect(result.isNonConforming).toBe(false);
    expect(result.deviation).toBe(0);
  });

  it("segnala conforme sui valori esatti di soglia (inclusivi)", () => {
    expect(checkTemperatureReading(0, threshold).isNonConforming).toBe(false);
    expect(checkTemperatureReading(4, threshold).isNonConforming).toBe(false);
  });

  it("segnala non conforme sotto la soglia minima e calcola lo scostamento", () => {
    const result = checkTemperatureReading(-2, threshold);
    expect(result.isNonConforming).toBe(true);
    expect(result.deviation).toBe(2);
  });

  it("segnala non conforme sopra la soglia massima e calcola lo scostamento", () => {
    const result = checkTemperatureReading(7.5, threshold);
    expect(result.isNonConforming).toBe(true);
    expect(result.deviation).toBe(3.5);
  });

  it("funziona con soglie negative (freezer)", () => {
    const freezerThreshold = { temp_min: -22, temp_max: -18 };
    expect(checkTemperatureReading(-20, freezerThreshold).isNonConforming).toBe(false);
    const result = checkTemperatureReading(-15, freezerThreshold);
    expect(result.isNonConforming).toBe(true);
    expect(result.deviation).toBe(3);
  });
});
