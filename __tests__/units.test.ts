import { describe, it, expect } from "vitest";
import { isSufficient } from "../lib/units";

describe("isSufficient", () => {
  it("compare des unités identiques", () => {
    expect(isSufficient(5, "pcs", 3, "pcs")).toBe(true);
    expect(isSufficient(2, "pcs", 3, "pcs")).toBe(false);
  });

  it("convertit kg vers g", () => {
    // 0.5 kg dispo vs 500 g requis -> juste assez
    expect(isSufficient(0.5, "kg", 500, "g")).toBe(true);
    expect(isSufficient(0.4, "kg", 500, "g")).toBe(false);
  });

  it("convertit L vers ml", () => {
    expect(isSufficient(1, "L", 800, "ml")).toBe(true);
    expect(isSufficient(0.5, "L", 800, "ml")).toBe(false);
  });

  it("considère présent si les unités ne sont pas convertibles", () => {
    expect(isSufficient(1, "pcs", 200, "g")).toBe(true);
  });
});
