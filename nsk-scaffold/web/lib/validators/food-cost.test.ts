import { describe, it, expect } from "vitest";
import { foodCostRequestSchema } from "./food-cost";

describe("foodCostRequestSchema", () => {
  it("accetta un payload valido e applica il default di target_margin_pct", () => {
    const parsed = foodCostRequestSchema.parse({
      servings: 4,
      ingredients: [
        { ingredient_id: "11111111-1111-1111-1111-111111111111", quantity: 100, unit: "g" },
      ],
    });
    expect(parsed.target_margin_pct).toBe(70);
  });

  it("rifiuta ingredient_id non-UUID", () => {
    const res = foodCostRequestSchema.safeParse({
      servings: 4,
      ingredients: [{ ingredient_id: "not-a-uuid", quantity: 100, unit: "g" }],
    });
    expect(res.success).toBe(false);
  });

  it("rifiuta quantity <= 0", () => {
    const res = foodCostRequestSchema.safeParse({
      servings: 4,
      ingredients: [
        { ingredient_id: "11111111-1111-1111-1111-111111111111", quantity: 0, unit: "g" },
      ],
    });
    expect(res.success).toBe(false);
  });

  it("rifiuta lista ingredienti vuota", () => {
    const res = foodCostRequestSchema.safeParse({ servings: 4, ingredients: [] });
    expect(res.success).toBe(false);
  });

  it("rifiuta target_margin_pct fuori range [0,99]", () => {
    const res = foodCostRequestSchema.safeParse({
      servings: 4,
      ingredients: [
        { ingredient_id: "11111111-1111-1111-1111-111111111111", quantity: 1, unit: "g" },
      ],
      target_margin_pct: 100,
    });
    expect(res.success).toBe(false);
  });
});
