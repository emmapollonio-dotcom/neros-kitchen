import { describe, it, expect } from "vitest";
import { estimateWasteCost, summarizeWaste } from "./estimate";

describe("estimateWasteCost", () => {
  it("calcola il costo quando l'ingrediente è a catalogo", () => {
    const result = estimateWasteCost(
      { ingredient_name: "Pomodoro", quantity: 500, unit: "g" },
      new Map([["pomodoro", 0.004]])
    );

    expect(result.matched_ingredient).toBe(true);
    expect(result.estimated_cost).toBe(2);
  });

  it("il match è case-insensitive e ignora spazi ai bordi", () => {
    const result = estimateWasteCost(
      { ingredient_name: "  BASILICO  ", quantity: 20, unit: "g" },
      new Map([["basilico", 0.05]])
    );

    expect(result.matched_ingredient).toBe(true);
    expect(result.estimated_cost).toBe(1);
  });

  it("ritorna costo sconosciuto (null) se l'ingrediente non è a catalogo, senza inventare valori", () => {
    const result = estimateWasteCost(
      { ingredient_name: "Ingrediente Misterioso", quantity: 10, unit: "pz" },
      new Map()
    );

    expect(result.matched_ingredient).toBe(false);
    expect(result.estimated_cost).toBeNull();
  });

  it("lancia errore se quantity <= 0", () => {
    expect(() =>
      estimateWasteCost({ ingredient_name: "x", quantity: 0, unit: "g" }, new Map())
    ).toThrow("quantity must be > 0");
  });
});

describe("summarizeWaste", () => {
  it("somma solo i costi noti e conta separatamente quelli sconosciuti", () => {
    const totals = summarizeWaste(
      [
        { ingredient_name: "Pomodoro", quantity: 1000, unit: "g" },
        { ingredient_name: "Basilico", quantity: 10, unit: "g" },
        { ingredient_name: "Sconosciuto", quantity: 5, unit: "pz" },
      ],
      new Map([
        ["pomodoro", 0.004],
        ["basilico", 0.05],
      ])
    );

    // 1000*0.004 + 10*0.05 = 4 + 0.5 = 4.5
    expect(totals.total_estimated_cost).toBe(4.5);
    expect(totals.items_with_known_cost).toBe(2);
    expect(totals.items_with_unknown_cost).toBe(1);
  });

  it("con lista vuota ritorna zeri, non crasha", () => {
    const totals = summarizeWaste([], new Map());
    expect(totals.total_estimated_cost).toBe(0);
    expect(totals.items_with_known_cost).toBe(0);
    expect(totals.items_with_unknown_cost).toBe(0);
  });
});
