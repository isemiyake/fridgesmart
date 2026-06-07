import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ingredientSchema } from "@/lib/validations";
import { normalizeIngredient } from "@/lib/normalize";

// Modification d'un ingrédient
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const existing = await prisma.userIngredient.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Ingrédient introuvable" }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
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

  const updated = await prisma.userIngredient.update({
    where: { id: params.id },
    data: { normalizedId: normalized.id, rawName, quantity, unit, expiryDate },
  });

  return NextResponse.json(updated);
}

// Suppression d'un ingrédient
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const existing = await prisma.userIngredient.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Ingrédient introuvable" }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  await prisma.userIngredient.delete({ where: { id: params.id } });

  return new NextResponse(null, { status: 204 });
}
