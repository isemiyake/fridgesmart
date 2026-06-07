import { describe, it, expect } from "vitest";
import {
  urgencePoints,
  calculateUrgenceScore,
  calculateCouvertureScore,
  calculateFinalScore,
  computeXP,
} from "../lib/score";

describe("urgencePoints", () => {
  it("donne 10 le jour de la péremption", () => {
    expect(urgencePoints(0)).toBe(10);
  });
  it("donne 8 à 1 jour", () => {
    expect(urgencePoints(1)).toBe(8);
  });
  it("donne 6 à 2 jours", () => {
    expect(urgencePoints(2)).toBe(6);
  });
  it("donne 3 entre 3 et 5 jours", () => {
    expect(urgencePoints(5)).toBe(3);
  });
  it("donne 1 au-delà de 5 jours", () => {
    expect(urgencePoints(10)).toBe(1);
  });
  it("ignore un ingrédient périmé (0 point)", () => {
    expect(urgencePoints(-1)).toBe(0);
  });
});

describe("calculateUrgenceScore", () => {
  it("additionne les points des ingrédients", () => {
    expect(calculateUrgenceScore([1, 2])).toBe(14); // 8 + 6
  });
});

describe("calculateCouvertureScore", () => {
  it("100% donne 10", () => {
    expect(calculateCouvertureScore(5, 5)).toBe(10);
  });
  it("80% donne 8", () => {
    expect(calculateCouvertureScore(4, 5)).toBe(8);
  });
  it("50% donne 5", () => {
    expect(calculateCouvertureScore(3, 6)).toBe(5);
  });
  it("0 ingrédient requis donne 0 (pas de division par zéro)", () => {
    expect(calculateCouvertureScore(0, 0)).toBe(0);
  });
});

describe("calculateFinalScore", () => {
  it("calcule l'exemple de la quiche lorraine", () => {
    const score = calculateFinalScore({
      urgenceScore: 14, // oeufs (1j=8) + fromage (2j=6)
      couvertureScore: 5, // 2/4
      co2Score: 10.5, // 1050 / 100
      absent: 2, // pâte brisée + lardons
      insufficient: 1, // fromage
    });
    expect(score).toBe(8.45);
  });

  it("applique bien les pénalités", () => {
    const score = calculateFinalScore({
      urgenceScore: 0,
      couvertureScore: 0,
      co2Score: 0,
      absent: 3,
      insufficient: 2,
    });
    expect(score).toBe(-4); // -(3 + 1)
  });
});

describe("computeXP", () => {
  it("donne score x 3", () => {
    expect(computeXP(10)).toBe(30);
  });
  it("garantit un minimum de 5 XP", () => {
    expect(computeXP(1)).toBe(5);
  });
});
