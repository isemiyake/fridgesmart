import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankRecipes, type FridgeItem, type RecipeForScore } from "@/lib/recommend";

function daysLeft(expiryDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(expiryDate);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // le frigo de l'utilisateur
  const userIngredients = await prisma.userIngredient.findMany({
    where: { userId: session.user.id },
  });
  const fridge: FridgeItem[] = userIngredients.map((i) => ({
    normalizedId: i.normalizedId,
    quantity: i.quantity,
    unit: i.unit,
    daysLeft: daysLeft(i.expiryDate),
  }));

  // toutes les recettes avec leurs ingrédients
  const recipes = await prisma.recipe.findMany({
    include: { ingredients: { include: { normalized: true } } },
  });
  const recipesForScore: RecipeForScore[] = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    ingredients: r.ingredients.map((ri) => ({
      normalizedId: ri.normalizedId,
      name: ri.normalized.name,
      quantity: ri.quantity,
      unit: ri.unit,
      co2SavedGrams: ri.normalized.co2SavedGrams,
    })),
  }));

  const ranked = rankRecipes(recipesForScore, fridge);

  return NextResponse.json(ranked);
}
