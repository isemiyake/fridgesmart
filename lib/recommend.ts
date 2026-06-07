import {
  calculateUrgenceScore,
  calculateCouvertureScore,
  calculateFinalScore,
} from "./score";
import { calculateCO2Score } from "./co2";
import { isSufficient } from "./units";

export type FridgeItem = {
  normalizedId: string;
  quantity: number;
  unit: string;
  daysLeft: number;
};

export type RecipeIngredientForScore = {
  normalizedId: string;
  name: string;
  quantity: number;
  unit: string;
  co2SavedGrams: number;
};

export type RecipeForScore = {
  id: string;
  title: string;
  ingredients: RecipeIngredientForScore[];
};

export type ScoredRecipe = {
  id: string;
  title: string;
  score: number;
  classification: "réalisable" | "presque réalisable" | "nécessite des achats";
  message: string;
  available: { name: string; daysLeft: number }[];
  needed: { name: string; reason: string }[];
  urgentCount: number;
  co2Potential: number;
};

// Score une recette par rapport au contenu du frigo.
// Renvoie null si aucun ingrédient de la recette n'est disponible (recette exclue).
export function scoreRecipe(
  recipe: RecipeForScore,
  fridge: FridgeItem[]
): ScoredRecipe | null {
  // ingrédients utilisables (non périmés), indexés par ingrédient normalisé
  const usable = new Map<string, FridgeItem>();
  for (const item of fridge) {
    if (item.daysLeft >= 0) usable.set(item.normalizedId, item);
  }

  const available: { name: string; daysLeft: number }[] = [];
  const needed: { name: string; reason: string }[] = [];
  const usedDaysLeft: number[] = [];
  const usedCo2: number[] = [];
  let covered = 0;
  let absent = 0;
  let insufficient = 0;

  for (const ing of recipe.ingredients) {
    const inFridge = usable.get(ing.normalizedId);

    if (!inFridge) {
      absent++;
      needed.push({ name: ing.name, reason: "absent du frigo" });
      continue;
    }

    covered++;
    usedDaysLeft.push(inFridge.daysLeft);
    usedCo2.push(ing.co2SavedGrams);
    available.push({ name: ing.name, daysLeft: inFridge.daysLeft });

    if (!isSufficient(inFridge.quantity, inFridge.unit, ing.quantity, ing.unit)) {
      insufficient++;
      needed.push({ name: ing.name, reason: "quantité insuffisante" });
    }
  }

  // recette exclue si rien d'utilisable
  if (covered === 0) return null;

  const urgenceScore = calculateUrgenceScore(usedDaysLeft);
  const couvertureScore = calculateCouvertureScore(
    covered,
    recipe.ingredients.length
  );
  const co2Score = calculateCO2Score(usedCo2);
  const score = calculateFinalScore({
    urgenceScore,
    couvertureScore,
    co2Score,
    absent,
    insufficient,
  });

  const classification =
    needed.length === 0
      ? "réalisable"
      : needed.length <= 2
        ? "presque réalisable"
        : "nécessite des achats";

  // ingrédients qui périment vite (≤ 2 jours)
  const urgents = available.filter((a) => a.daysLeft <= 2);
  const urgentCount = urgents.length;

  let message: string;
  if (urgents.length > 0) {
    message = `Utilise ${urgents.map((u) => u.name).join(", ")} qui périme(nt) bientôt.`;
  } else if (classification === "réalisable") {
    message = "Tu as tout ce qu'il faut pour cette recette.";
  } else {
    message = "Bonne option avec ce que tu as déjà.";
  }

  return {
    id: recipe.id,
    title: recipe.title,
    score,
    classification,
    message,
    available,
    needed,
    urgentCount,
    co2Potential: usedCo2.reduce((s, c) => s + c, 0),
  };
}

// Classe une liste de recettes (score décroissant + départages du CDC)
export function rankRecipes(
  recipes: RecipeForScore[],
  fridge: FridgeItem[]
): ScoredRecipe[] {
  const scored = recipes
    .map((r) => scoreRecipe(r, fridge))
    .filter((r): r is ScoredRecipe => r !== null);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.urgentCount !== a.urgentCount) return b.urgentCount - a.urgentCount;
    if (b.co2Potential !== a.co2Potential) return b.co2Potential - a.co2Potential;
    return a.title.localeCompare(b.title);
  });

  return scored;
}
