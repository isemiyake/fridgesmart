import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();

  // validation des données
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email, password } = result.data;

  // email déjà pris ?
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Cet email est déjà utilisé" },
      { status: 400 }
    );
  }

  // on ne stocke jamais le mot de passe en clair
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, passwordHash },
  });

  return NextResponse.json({ message: "Compte créé" }, { status: 201 });
}
