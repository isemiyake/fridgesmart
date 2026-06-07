import { prisma } from "@/lib/prisma";

// Forme canonique d'un nom d'ingrédient : minuscules, sans accents, sans pluriel simple.
// Permet de faire correspondre "Tomate", "tomates", "TOMATES" -> "tomate".
export function canonicalize(name: string): string {
  let n = name.trim().toLowerCase();
  n = n.normalize("NFD").replace(/[̀-ͯ]/g, ""); // enlève les accents
  n = n.replace(/s$/, ""); // singulier simple (enlève le "s" final)
  return n;
}

// Normalise un nom saisi librement et renvoie l'ingrédient normalisé correspondant
// (find-or-create). La normalisation sémantique via Ollama viendra plus tard.
export async function normalizeIngredient(rawName: string) {
  const name = canonicalize(rawName);

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
