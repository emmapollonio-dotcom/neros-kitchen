import { describe, expect, it } from "vitest";
import { aggregateShoppingList, type PlannedRecipe } from "./generate-shopping-list";

describe("aggregateShoppingList", () => {
  it("scala le quantità in base alle porzioni pianificate", () => {
    const recipes: PlannedRecipe[] = [
      {
        recipe_id: "r1",
        base_servings: 4,
        planned_servings: 8,
        ingredients: [
          { ingredient_id: "i1", ingredient_name: "Farina 00", category: "Dispensa", quantity: 200, unit: "g" },
        ],
      },
    ];

    const result = aggregateShoppingList(recipes);

    expect(result).toEqual([
      { ingredient_id: "i1", ingredient_name: "Farina 00", category: "Dispensa", quantity: 400, unit: "g" },
    ]);
  });

  it("somma lo stesso ingrediente/unità su più ricette", () => {
    const recipes: PlannedRecipe[] = [
      {
        recipe_id: "r1",
        base_servings: 4,
        planned_servings: 4,
        ingredients: [
          { ingredient_id: "i1", ingredient_name: "Uova", category: "Freschi", quantity: 2, unit: "pz" },
        ],
      },
      {
        recipe_id: "r2",
        base_servings: 2,
        planned_servings: 2,
        ingredients: [
          { ingredient_id: "i1", ingredient_name: "Uova", category: "Freschi", quantity: 3, unit: "pz" },
        ],
      },
    ];

    const result = aggregateShoppingList(recipes);

    expect(result).toEqual([
      { ingredient_id: "i1", ingredient_name: "Uova", category: "Freschi", quantity: 5, unit: "pz" },
    ]);
  });

  it("tiene separate unità diverse dello stesso ingrediente", () => {
    const recipes: PlannedRecipe[] = [
      {
        recipe_id: "r1",
        base_servings: 1,
        planned_servings: 1,
        ingredients: [
          { ingredient_id: "i1", ingredient_name: "Burro", category: null, quantity: 50, unit: "g" },
        ],
      },
      {
        recipe_id: "r2",
        base_servings: 1,
        planned_servings: 1,
        ingredients: [
          { ingredient_id: "i1", ingredient_name: "Burro", category: null, quantity: 1, unit: "kg" },
        ],
      },
    ];

    const result = aggregateShoppingList(recipes);

    expect(result).toHaveLength(2);
  });

  it("rifiuta base_servings <= 0", () => {
    const recipes: PlannedRecipe[] = [
      { recipe_id: "r1", base_servings: 0, planned_servings: 2, ingredients: [] },
    ];

    expect(() => aggregateShoppingList(recipes)).toThrow();
  });

  it("ordina il risultato alfabeticamente per nome ingrediente", () => {
    const recipes: PlannedRecipe[] = [
      {
        recipe_id: "r1",
        base_servings: 1,
        planned_servings: 1,
        ingredients: [
          { ingredient_id: "i2", ingredient_name: "Zucchero", category: null, quantity: 10, unit: "g" },
          { ingredient_id: "i1", ingredient_name: "Aglio", category: null, quantity: 1, unit: "pz" },
        ],
      },
    ];

    const result = aggregateShoppingList(recipes);

    expect(result.map((r) => r.ingredient_name)).toEqual(["Aglio", "Zucchero"]);
  });
});
