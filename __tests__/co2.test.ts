import { describe, it, expect } from "vitest";
import { calculateCO2Score, sumCO2Values } from "../lib/co2";

describe("calculateCO2Score", () => {
  it("calcule la composante CO2 pour de la viande rouge", () => {
    expect(calculateCO2Score([2700])).toBe(27);
  });
  it("calcule pour plusieurs ingrédients", () => {
    expect(calculateCO2Score([1050, 430])).toBe(14.8); // fromage + oeufs
  });
  it("renvoie 0 si aucun ingrédient", () => {
    expect(calculateCO2Score([])).toBe(0);
  });
});

describe("sumCO2Values", () => {
  it("additionne les valeurs de CO2", () => {
    expect(sumCO2Values([2700, 1050])).toBe(3750);
  });
  it("renvoie 0 pour une liste vide", () => {
    expect(sumCO2Values([])).toBe(0);
  });
});
