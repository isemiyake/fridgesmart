import { prisma } from "@/lib/prisma";

// Forme canonique d'un nom d'ingrédient : minuscules, sans accents, sans pluriel simple.
// Permet de faire correspondre "Tomate", "tomates", "TOMATES" -> "tomate".
export function canonicalize(name: string): string {
  let n = name.trim().toLowerCase();
  n = n.normalize("NFD").replace(/[̀-ͯ]/g, ""); // enlève les accents
  n = n.replace(/s$/, ""); // singulier simple (enlève le "s" final)
  return n;
}

// Distance de Levenshtein : nombre minimal d'éditions pour passer de a à b.
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}

// Trouve le nom connu le plus proche d'une saisie (corrige les fautes de frappe).
// Renvoie null si rien n'est assez proche (= vrai nouvel ingrédient).
export function closestMatch(name: string, candidates: string[]): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = levenshtein(name, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  if (!best) return null;

  // tolérance : au plus 2 éditions, max 30% de la longueur, et même 1re lettre
  // (évite de confondre des ingrédients distincts comme "oeuf"/"boeuf").
  const tolerance = Math.min(2, Math.floor(name.length * 0.3));
  if (bestDist <= tolerance && bestDist > 0 && name[0] === best[0]) return best;
  if (bestDist === 0) return best;
  return null;
}

// Normalise un nom saisi librement et renvoie l'ingrédient normalisé correspondant.
// Gère : casse, accents, pluriel, et fautes de frappe (rapprochement du plus proche connu).
export async function normalizeIngredient(rawName: string) {
  const name = canonicalize(rawName);

  // 1) alias déjà connu ?
  const alias = await prisma.ingredientAlias.findUnique({ where: { alias: name } });
  if (alias) {
    return prisma.normalizedIngredient.findUniqueOrThrow({
      where: { id: alias.normalizedId },
    });
  }

  // 2) correspondance exacte ?
  const exact = await prisma.normalizedIngredient.findUnique({ where: { name } });
  if (exact) return exact;

  // 3) correction de faute : ingrédient connu le plus proche
  const known = await prisma.normalizedIngredient.findMany({ select: { name: true } });
  const match = closestMatch(name, known.map((k) => k.name));
  if (match) {
    return prisma.normalizedIngredient.findUniqueOrThrow({ where: { name: match } });
  }

  // 4) vrai nouvel ingrédient
  return prisma.normalizedIngredient.create({ data: { name } });
}
