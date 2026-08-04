import { describe, it, expect } from "vitest";
import { calculateFoodCost } from "./calculate";

describe("calculateFoodCost", () => {
  it("calcola correttamente costo totale e per porzione", () => {
    const result = calculateFoodCost({
      servings: 4,
      ingredients: [
        { ingredient_id: "tomato", quantity: 500, unit: "g" },
        { ingredient_id: "basil", quantity: 20, unit: "g" },
      ],
      costByIngredientId: new Map([
        ["tomato", 0.004], // 4€/kg -> 0.004€/g
        ["basil", 0.05], // 50€/kg -> 0.05€/g
      ]),
      targetMarginPct: 70,
    });

    // 500*0.004 + 20*0.05 = 2 + 1 = 3
    expect(result.food_cost_total).toBe(3);
    expect(result.food_cost_per_serving).toBe(0.75);
  });

  it("calcola il prezzo suggerito in base al margine target", () => {
    const result = calculateFoodCost({
      servings: 1,
      ingredients: [{ ingredient_id: "x", quantity: 1, unit: "kg" }],
      costByIngredientId: new Map([["x", 3]]), // food cost = 3
      targetMarginPct: 70, // food cost deve essere il 30% del prezzo
    });

    // prezzo = 3 / 0.30 = 10
    expect(result.suggested_price_per_serving).toBe(10);
    expect(result.food_cost_percentage).toBe(30);
  });

  it("gestisce ingredienti senza prezzo noto come costo zero (non crasha)", () => {
    const result = calculateFoodCost({
      servings: 2,
      ingredients: [{ ingredient_id: "unknown", quantity: 100, unit: "g" }],
      costByIngredientId: new Map(),
      targetMarginPct: 70,
    });

    expect(result.food_cost_total).toBe(0);
    expect(result.food_cost_per_serving).toBe(0);
  });

  it("lancia errore se servings <= 0", () => {
    expect(() =>
      calculateFoodCost({
        servings: 0,
        ingredients: [],
        costByIngredientId: new Map(),
        targetMarginPct: 70,
      })
    ).toThrow("servings must be > 0");
  });

  it("lancia errore se targetMarginPct fuori range", () => {
    expect(() =>
      calculateFoodCost({
        servings: 1,
        ingredients: [],
        costByIngredientId: new Map(),
        targetMarginPct: 100,
      })
    ).toThrow();

    expect(() =>
      calculateFoodCost({
        servings: 1,
        ingredients: [],
        costByIngredientId: new Map(),
        targetMarginPct: -1,
      })
    ).toThrow();
  });

  it("con margine target 0, il prezzo suggerito coincide col food cost", () => {
    const result = calculateFoodCost({
      servings: 1,
      ingredients: [{ ingredient_id: "x", quantity: 1, unit: "kg" }],
      costByIngredientId: new Map([["x", 5]]),
      targetMarginPct: 0,
    });

    expect(result.suggested_price_per_serving).toBe(5);
    expect(result.food_cost_percentage).toBe(100);
  });
});
