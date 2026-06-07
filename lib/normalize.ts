import { prisma } from "@/lib/prisma";

// Normalise un nom d'ingrédient saisi librement.
// Pour l'instant : minuscules + recherche d'alias, sinon find-or-create.
// La normalisation sémantique via Ollama sera branchée au Milestone 3.
export async function normalizeIngredient(rawName: string) {
  const name = rawName.trim().toLowerCase();

  // alias déjà connu ?
  const alias = await prisma.ingredientAlias.findUnique({
    where: { alias: name },
  });
  if (alias) {
    return prisma.normalizedIngredient.findUniqueOrThrow({
      where: { id: alias.normalizedId },
    });
  }

  // sinon on retrouve ou on crée l'ingrédient normalisé
  return prisma.normalizedIngredient.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}
