// Calcul de l'impact CO2.
// co2SavedGrams = grammes de CO2 économisés pour 100g d'aliment sauvé.

// Composante CO2 du score : somme des co2SavedGrams des ingrédients utilisés / 100
export function calculateCO2Score(co2SavedGramsList: number[]): number {
  const total = co2SavedGramsList.reduce((sum, g) => sum + g, 0);
  return total / 100;
}

// CO2 total économisé (en grammes) — somme simple (utilisé pour les tests historiques)
export function computeCO2Saved(co2SavedGramsList: number[]): number {
  return co2SavedGramsList.reduce((sum, g) => sum + g, 0);
}

// Poids approximatif en grammes selon l'unité (pour les unités non massiques).
const GRAMS_PER_UNIT: Record<string, number> = {
  g: 1,
  kg: 1000,
  ml: 1, // ~1 g/ml
  L: 1000,
  pcs: 100, // estimation : une pièce ~ 100 g
  tbsp: 15, // cuillère à soupe ~ 15 g
  tsp: 5, // cuillère à café ~ 5 g
};

export function toGrams(quantity: number, unit: string): number {
  return quantity * (GRAMS_PER_UNIT[unit] ?? 100);
}

// CO2 économisé pour une quantité donnée d'un aliment (proportionnel au poids).
// co2Per100g = co2SavedGrams (valeur pour 100 g).
export function co2ForQuantity(
  co2Per100g: number,
  quantity: number,
  unit: string
): number {
  return Math.round((co2Per100g * toGrams(quantity, unit)) / 100);
}
