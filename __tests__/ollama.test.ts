import { describe, it, expect } from "vitest";
import { parseRecipes } from "../lib/ollama";

const validJson = JSON.stringify({
  recipes: [
    {
      title: "Poulet au riz",
      description: "Simple et rapide",
      steps: ["Cuire le riz", "Faire revenir le poulet"],
      ingredients: [
        { name: "poulet", quantity: 500, unit: "g" },
        { name: "riz", quantity: 200, unit: "g" },
      ],
    },
  ],
});

describe("parseRecipes", () => {
  it("parse une réponse JSON valide", () => {
    const r = parseRecipes(validJson);
    expect(r).not.toBeNull();
    expect(r![0].title).toBe("Poulet au riz");
  });

  it("tolère un bloc markdown autour du JSON", () => {
    const r = parseRecipes("```json\n" + validJson + "\n```");
    expect(r).not.toBeNull();
    expect(r![0].ingredients).toHaveLength(2);
  });

  it("tolère du texte avant et après le JSON", () => {
    const r = parseRecipes("Voici les recettes : " + validJson + " Bon appétit !");
    expect(r).not.toBeNull();
  });

  it("renvoie null sur du JSON invalide", () => {
    expect(parseRecipes("pas du tout du json")).toBeNull();
  });

  it("renvoie null si la structure ne correspond pas", () => {
    expect(parseRecipes(JSON.stringify({ recipes: [{ title: "X" }] }))).toBeNull();
  });
});
