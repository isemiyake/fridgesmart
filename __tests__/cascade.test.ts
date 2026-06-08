import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";

// Test d'intégration : vérifie la suppression en cascade (RGPD).
// Ignoré automatiquement si aucune base n'est configurée (DATABASE_URL absent).
const hasDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasDb)("suppression en cascade (RGPD)", () => {
  it("supprime les données liées quand le compte est supprimé", async () => {
    const norm = await prisma.normalizedIngredient.findFirst();
    if (!norm) throw new Error("Base non seedée");

    // utilisateur de test avec XP + un ingrédient
    const user = await prisma.user.create({
      data: {
        email: `cascade-test-${Date.now()}@test.be`,
        passwordHash: "hash",
        xp: { create: { xp: 10, level: 1 } },
        ingredients: {
          create: {
            normalizedId: norm.id,
            rawName: "test",
            quantity: 1,
            unit: "pcs",
            expiryDate: new Date(),
          },
        },
      },
    });

    // suppression du compte
    await prisma.user.delete({ where: { id: user.id } });

    // les données liées doivent avoir disparu
    const xp = await prisma.userXP.findUnique({ where: { userId: user.id } });
    const ingredients = await prisma.userIngredient.findMany({
      where: { userId: user.id },
    });

    expect(xp).toBeNull();
    expect(ingredients).toHaveLength(0);

    await prisma.$disconnect();
  });
});
