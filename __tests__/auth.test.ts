import { describe, it, expect, vi, beforeEach } from "vitest";

// On mocke la base et bcrypt pour tester la logique de connexion sans BD réelle.
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));
vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn() },
}));

import { verifyCredentials } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

describe("verifyCredentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renvoie null si l'utilisateur n'existe pas", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    const result = await verifyCredentials("inconnu@test.be", "motdepasse");
    expect(result).toBeNull();
  });

  it("renvoie null si le mot de passe est faux", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "1",
      email: "camille@test.be",
      passwordHash: "hash",
    });
    (bcrypt.compare as any).mockResolvedValue(false);
    const result = await verifyCredentials("camille@test.be", "mauvais");
    expect(result).toBeNull();
  });

  it("renvoie l'utilisateur si les identifiants sont bons", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "1",
      email: "camille@test.be",
      passwordHash: "hash",
    });
    (bcrypt.compare as any).mockResolvedValue(true);
    const result = await verifyCredentials("camille@test.be", "bonmotdepasse");
    expect(result).toEqual({ id: "1", email: "camille@test.be" });
  });
});
