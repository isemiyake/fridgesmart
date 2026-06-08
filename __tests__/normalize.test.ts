import { describe, it, expect } from "vitest";
import { canonicalize, levenshtein, closestMatch } from "../lib/normalize";

describe("canonicalize", () => {
  it("met en minuscules", () => {
    expect(canonicalize("TOMATE")).toBe("tomate");
  });
  it("enlève les accents", () => {
    expect(canonicalize("Épinards")).toBe("epinard");
  });
  it("enlève le pluriel simple", () => {
    expect(canonicalize("Carottes")).toBe("carotte");
  });
});

describe("levenshtein", () => {
  it("distance 0 pour mots identiques", () => {
    expect(levenshtein("tomate", "tomate")).toBe(0);
  });
  it("distance 1 pour une lettre en trop", () => {
    expect(levenshtein("tomatte", "tomate")).toBe(1);
  });
});

describe("closestMatch (correction de fautes)", () => {
  const known = ["tomate", "carotte", "oeuf", "boeuf", "saumon", "lait"];

  it("corrige une faute de frappe", () => {
    expect(closestMatch("tomatte", known)).toBe("tomate");
    expect(closestMatch("saumonn", known)).toBe("saumon");
  });

  it("renvoie le mot exact s'il existe", () => {
    expect(closestMatch("carotte", known)).toBe("carotte");
  });

  it("ne confond pas des ingrédients distincts (oeuf vs boeuf)", () => {
    expect(closestMatch("oeuf", known)).toBe("oeuf");
  });

  it("renvoie null pour un ingrédient vraiment nouveau", () => {
    expect(closestMatch("chocolat", known)).toBeNull();
  });
});
