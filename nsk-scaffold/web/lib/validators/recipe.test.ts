import { describe, it, expect } from "vitest";
import { slugifyRecipeTitle, createRecipeSchema } from "./recipe";

describe("slugifyRecipeTitle", () => {
  it("converte spazi e maiuscole in slug url-safe", () => {
    expect(slugifyRecipeTitle("Risotto alla Milanese", "ab12")).toBe(
      "risotto-alla-milanese-ab12"
    );
  });

  it("rimuove accenti/diacritici", () => {
    expect(slugifyRecipeTitle("Crème brûlée à la Française", "x1")).toBe(
      "creme-brulee-a-la-francaise-x1"
    );
  });

  it("rimuove punteggiatura", () => {
    expect(slugifyRecipeTitle("Spaghetti aglio, olio e peperoncino!", "z9")).toBe(
      "spaghetti-aglio-olio-e-peperoncino-z9"
    );
  });
});

describe("createRecipeSchema", () => {
  it("applica i default per servings/visibility/allergens", () => {
    const parsed = createRecipeSchema.parse({ title: "Tiramisù" });
    expect(parsed.servings).toBe(4);
    expect(parsed.visibility).toBe("private");
    expect(parsed.allergens).toEqual([]);
  });

  it("rifiuta titoli troppo corti", () => {
    expect(createRecipeSchema.safeParse({ title: "Hi" }).success).toBe(false);
  });
});
