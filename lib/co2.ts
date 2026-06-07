// Calcul de l'impact CO2.
// co2SavedGrams = grammes de CO2 économisés pour 100g d'aliment sauvé.

// Composante CO2 du score : somme des co2SavedGrams des ingrédients utilisés / 100
export function calculateCO2Score(co2SavedGramsList: number[]): number {
  const total = co2SavedGramsList.reduce((sum, g) => sum + g, 0);
  return total / 100;
}

// CO2 total économisé (en grammes) quand une recette est réalisée
export function computeCO2Saved(co2SavedGramsList: number[]): number {
  return co2SavedGramsList.reduce((sum, g) => sum + g, 0);
}
