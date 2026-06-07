import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRecipes, type PromptIngredient } from "@/lib/ollama";
import { normalizeIngredient } from "@/lib/normalize";
import type { UnitEnum } from "@prisma/client";

// Rate limit simple en mémoire : 1 génération / 60s par utilisateur
const lastGeneration = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

function daysLeft(expiryDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(expiryDate);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  // rate limit
  const now = Date.now();
  const last = lastGeneration.get(userId) ?? 0;
  if (now - last < RATE_LIMIT_MS) {
    return NextResponse.json(
      { error: "Trop de requêtes, réessaie dans un instant" },
      { status: 429 }
    );
  }
  lastGeneration.set(userId, now);

  // ingrédients utilisables du frigo
  const userIngredients = await prisma.userIngredient.findMany({
    where: { userId },
  });
  const prompt: PromptIngredient[] = userIngredients
    .filter((i) => daysLeft(i.expiryDate) >= 0)
    .map((i) => ({
      name: i.rawName,
      quantity: i.quantity,
      unit: i.unit,
      daysLeft: daysLeft(i.expiryDate),
    }));

  const generated = await generateRecipes(prompt);
  if (generated.length === 0) {
    // échec Ollama -> on retombe sur les recettes existantes (fallback)
    return NextResponse.json({ created: 0, fallback: true });
  }

  // titres déjà présents (anti-duplication)
  const existing = await prisma.recipe.findMany({ select: { title: true } });
  const existingTitles = new Set(existing.map((r) => r.title.toLowerCase()));

  let created = 0;
  for (const r of generated) {
    if (existingTitles.has(r.title.toLowerCase())) continue;
    existingTitles.add(r.title.toLowerCase());

    const recipe = await prisma.recipe.create({
      data: {
        title: r.title,
        description: r.description,
        servings: 2,
        isAIGenerated: true,
        generatedAt: new Date(),
        steps: {
          create: r.steps.map((content, i) => ({ order: i + 1, content })),
        },
      },
    });

    for (const ing of r.ingredients) {
      const normalized = await normalizeIngredient(ing.name);
      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          normalizedId: normalized.id,
          quantity: ing.quantity,
          unit: ing.unit as UnitEnum,
        },
      });
    }
    created++;
  }

  return NextResponse.json({ created });
}
