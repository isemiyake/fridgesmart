import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ingredientSchema } from "@/lib/validations";
import { normalizeIngredient } from "@/lib/normalize";

// Liste des ingrédients de l'utilisateur, triés par date de péremption croissante
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const ingredients = await prisma.userIngredient.findMany({
    where: { userId: session.user.id },
    include: { normalized: true },
    orderBy: { expiryDate: "asc" },
  });

  return NextResponse.json(ingredients);
}

// Ajout d'un ingrédient
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const result = ingredientSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { rawName, quantity, unit, expiryDate } = result.data;
  const normalized = await normalizeIngredient(rawName);

  const ingredient = await prisma.userIngredient.create({
    data: {
      userId: session.user.id,
      normalizedId: normalized.id,
      rawName,
      quantity,
      unit,
      expiryDate,
    },
  });

  return NextResponse.json(ingredient, { status: 201 });
}
