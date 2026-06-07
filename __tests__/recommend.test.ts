import { describe, it, expect } from "vitest";
import { scoreRecipe, rankRecipes, type FridgeItem } from "../lib/recommend";

const omelette = {
  id: "1",
  title: "Omelette",
  ingredients: [
    { normalizedId: "oeufs", name: "oeufs", quantity: 4, unit: "pcs", co2SavedGrams: 430 },
    { normalizedId: "fromage", name: "fromage", quantity: 50, unit: "g", co2SavedGrams: 1050 },
  ],
};

describe("scoreRecipe", () => {
  it("renvoie null si aucun ingrédient disponible", () => {
    expect(scoreRecipe(omelette, [])).toBeNull();
  });

  it("classe 'réalisable' quand tout est présent en quantité", () => {
    const fridge: FridgeItem[] = [
      { normalizedId: "oeufs", quantity: 6, unit: "pcs", daysLeft: 1 },
      { normalizedId: "fromage", quantity: 100, unit: "g", daysLeft: 3 },
    ];
    const r = scoreRecipe(omelette, fridge)!;
    expect(r.classification).toBe("réalisable");
    expect(r.needed).toHaveLength(0);
  });

  it("marque les ingrédients manquants", () => {
    const fridge: FridgeItem[] = [
      { normalizedId: "oeufs", quantity: 6, unit: "pcs", daysLeft: 1 },
    ];
    const r = scoreRecipe(omelette, fridge)!;
    expect(r.needed.map((n) => n.name)).toContain("fromage");
  });

  it("ignore un ingrédient périmé (compté comme absent)", () => {
    const fridge: FridgeItem[] = [
      { normalizedId: "oeufs", quantity: 6, unit: "pcs", daysLeft: 1 },
      { normalizedId: "fromage", quantity: 100, unit: "g", daysLeft: -2 },
    ];
    const r = scoreRecipe(omelette, fridge)!;
    expect(r.needed.map((n) => n.name)).toContain("fromage");
  });
});

describe("rankRecipes", () => {
  it("classe la recette la plus urgente en premier", () => {
    const r2 = {
      id: "2",
      title: "Salade",
      ingredients: [
        { normalizedId: "tomates", name: "tomates", quantity: 2, unit: "pcs", co2SavedGrams: 150 },
      ],
    };
    const fridge: FridgeItem[] = [
      { normalizedId: "oeufs", quantity: 6, unit: "pcs", daysLeft: 0 },
      { normalizedId: "fromage", quantity: 100, unit: "g", daysLeft: 0 },
      { normalizedId: "tomates", quantity: 5, unit: "pcs", daysLeft: 8 },
    ];
    const ranked = rankRecipes([r2, omelette], fridge);
    expect(ranked[0].title).toBe("Omelette");
  });
});
