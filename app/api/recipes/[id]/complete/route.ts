import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreRecipe, type FridgeItem } from "@/lib/recommend";
import { computeXP, levelForXP } from "@/lib/score";
import { co2ForQuantity } from "@/lib/co2";
import { convert } from "@/lib/units";

function daysLeft(expiryDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(expiryDate);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: { ingredients: { include: { normalized: true } } },
  });
  if (!recipe) {
    return NextResponse.json({ error: "Recette introuvable" }, { status: 404 });
  }

  // idempotence : déjà réalisée aujourd'hui ? -> on ne crédite pas deux fois
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const already = await prisma.cookedHistory.findFirst({
    where: { userId, recipeId: recipe.id, cookedAt: { gte: startToday } },
  });
  if (already) {
    return NextResponse.json(
      { message: "Recette déjà réalisée aujourd'hui", xpEarned: 0, co2Saved: 0 },
      { status: 200 }
    );
  }

  const userIngredients = await prisma.userIngredient.findMany({
    where: { userId },
  });

  // score (pour l'XP) recalculé côté serveur
  const fridge: FridgeItem[] = userIngredients.map((i) => ({
    normalizedId: i.normalizedId,
    quantity: i.quantity,
    unit: i.unit,
    daysLeft: daysLeft(i.expiryDate),
  }));
  const scored = scoreRecipe(
    {
      id: recipe.id,
      title: recipe.title,
      ingredients: recipe.ingredients.map((ri) => ({
        normalizedId: ri.normalizedId,
        name: ri.normalized.name,
        quantity: ri.quantity,
        unit: ri.unit,
        co2SavedGrams: ri.normalized.co2SavedGrams,
      })),
    },
    fridge
  );
  const score = scored?.score ?? 0;

  // retrait / réduction des ingrédients utilisés (non périmés)
  // CO2 proportionnel à la quantité réellement consommée du frigo
  let co2Saved = 0;
  const usedNames: string[] = []; // uniquement les ingrédients du frigo réellement sauvés
  for (const ri of recipe.ingredients) {
    const item = userIngredients.find(
      (i) => i.normalizedId === ri.normalizedId && daysLeft(i.expiryDate) >= 0
    );
    if (!item) continue;

    usedNames.push(ri.normalized.name);

    const reqInItemUnit = convert(ri.quantity, ri.unit, item.unit);
    let consumed: number; // quantité consommée, dans l'unité du frigo
    if (reqInItemUnit === null) {
      // unités non comparables -> on considère l'ingrédient entièrement consommé
      consumed = item.quantity;
      await prisma.userIngredient.delete({ where: { id: item.id } });
    } else {
      consumed = Math.min(reqInItemUnit, item.quantity);
      const remaining = item.quantity - reqInItemUnit;
      if (remaining <= 0) {
        await prisma.userIngredient.delete({ where: { id: item.id } });
      } else {
        await prisma.userIngredient.update({
          where: { id: item.id },
          data: { quantity: remaining },
        });
      }
    }

    co2Saved += co2ForQuantity(ri.normalized.co2SavedGrams, consumed, item.unit);
  }
  const xpEarned = computeXP(score);

  // historique
  await prisma.cookedHistory.create({
    data: {
      userId,
      recipeId: recipe.id,
      recipeSnapshot: JSON.stringify({
        title: recipe.title,
        ingredients: usedNames, // seulement les aliments du frigo sauvés
      }),
      co2Saved,
      xpEarned,
    },
  });

  // XP + niveau
  const xpRow = await prisma.userXP.upsert({
    where: { userId },
    update: { xp: { increment: xpEarned } },
    create: { userId, xp: xpEarned, level: 1 },
  });
  const newLevel = levelForXP(xpRow.xp);
  if (newLevel !== xpRow.level) {
    await prisma.userXP.update({
      where: { userId },
      data: { level: newLevel },
    });
  }

  return NextResponse.json({
    message: "Recette réalisée",
    xpEarned,
    co2Saved,
    totalXp: xpRow.xp,
    level: newLevel,
  });
}
