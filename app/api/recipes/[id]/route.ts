import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreRecipe, type FridgeItem } from "@/lib/recommend";
import { computeXP } from "@/lib/score";
import { co2ForQuantity } from "@/lib/co2";
import { isSufficient, convert } from "@/lib/units";

function daysLeft(expiryDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(expiryDate);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: {
      steps: { orderBy: { order: "asc" } },
      ingredients: { include: { normalized: true } },
    },
  });
  if (!recipe) {
    return NextResponse.json({ error: "Recette introuvable" }, { status: 404 });
  }

  const userIngredients = await prisma.userIngredient.findMany({
    where: { userId: session.user.id },
  });

  // ingrédients utilisables (non périmés)
  const usable = new Map<string, { quantity: number; unit: string }>();
  for (const i of userIngredients) {
    if (daysLeft(i.expiryDate) >= 0 && !usable.has(i.normalizedId)) {
      usable.set(i.normalizedId, { quantity: i.quantity, unit: i.unit });
    }
  }

  // CO2 estimé : proportionnel à ce qui serait réellement consommé du frigo
  let estimatedCo2 = 0;
  const ingredients = recipe.ingredients.map((ri) => {
    const inFridge = usable.get(ri.normalizedId);
    if (inFridge) {
      const reqInItemUnit = convert(ri.quantity, ri.unit, inFridge.unit);
      const consumed =
        reqInItemUnit === null
          ? inFridge.quantity
          : Math.min(reqInItemUnit, inFridge.quantity);
      estimatedCo2 += co2ForQuantity(
        ri.normalized.co2SavedGrams,
        consumed,
        inFridge.unit
      );
    }
    return {
      name: ri.normalized.name,
      quantity: ri.quantity,
      unit: ri.unit,
      inFridge: !!inFridge,
      availableQuantity: inFridge?.quantity ?? 0,
      availableUnit: inFridge?.unit ?? ri.unit,
      sufficient: inFridge
        ? isSufficient(inFridge.quantity, inFridge.unit, ri.quantity, ri.unit)
        : false,
    };
  });

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

  return NextResponse.json({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    steps: recipe.steps.map((s) => ({ order: s.order, content: s.content })),
    ingredients,
    score,
    classification: scored?.classification ?? "nécessite des achats",
    message: scored?.message ?? "",
    estimatedXp: computeXP(score),
    estimatedCo2,
  });
}
