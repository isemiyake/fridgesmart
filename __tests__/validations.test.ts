import { describe, it, expect } from "vitest";
import { registerSchema } from "../lib/validations";

describe("registerSchema", () => {
  it("accepte un email et un mot de passe valides", () => {
    const r = registerSchema.safeParse({
      email: "camille@test.be",
      password: "motdepasse",
    });
    expect(r.success).toBe(true);
  });

  it("accepte un mot de passe d'exactement 8 caractères", () => {
    const r = registerSchema.safeParse({
      email: "camille@test.be",
      password: "12345678",
    });
    expect(r.success).toBe(true);
  });

  it("refuse un email invalide", () => {
    const r = registerSchema.safeParse({
      email: "pasunemail",
      password: "motdepasse",
    });
    expect(r.success).toBe(false);
  });

  it("refuse un email vide", () => {
    const r = registerSchema.safeParse({ email: "", password: "motdepasse" });
    expect(r.success).toBe(false);
  });

  it("refuse un mot de passe trop court (7 caractères)", () => {
    const r = registerSchema.safeParse({
      email: "camille@test.be",
      password: "1234567",
    });
    expect(r.success).toBe(false);
  });

  it("renvoie le bon message quand le mot de passe est trop court", () => {
    const r = registerSchema.safeParse({
      email: "camille@test.be",
      password: "123",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe(
        "Le mot de passe doit contenir au moins 8 caractères"
      );
    }
  });

  it("renvoie le bon message quand l'email est invalide", () => {
    const r = registerSchema.safeParse({ email: "xxx", password: "motdepasse" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe("Adresse email invalide");
    }
  });

  it("refuse des champs manquants", () => {
    const r = registerSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
