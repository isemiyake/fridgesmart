// Algorithme de score multicritère (v3.0)
// Score = 0.6 x Urgence + 0.3 x Couverture + 0.1 x CO2 - Pénalités

// Points d'urgence d'un ingrédient selon les jours restants avant péremption.
// Un ingrédient périmé (jours < 0) est ignoré (0 point).
export function urgencePoints(daysLeft: number): number {
  if (daysLeft < 0) return 0;
  if (daysLeft === 0) return 10;
  if (daysLeft === 1) return 8;
  if (daysLeft === 2) return 6;
  if (daysLeft <= 5) return 3;
  return 1;
}

// Somme des points d'urgence des ingrédients disponibles utilisés
export function calculateUrgenceScore(daysLeftList: number[]): number {
  return daysLeftList.reduce((sum, d) => sum + urgencePoints(d), 0);
}

// Ratio d'ingrédients présents sur le total requis, ramené sur 10
export function calculateCouvertureScore(
  covered: number,
  totalRequired: number
): number {
  if (totalRequired === 0) return 0;
  return (covered / totalRequired) * 10;
}

// Pénalités : -1.0 par ingrédient absent, -0.5 par ingrédient en quantité insuffisante
export function calculatePenalties(absent: number, insufficient: number): number {
  return 1.0 * absent + 0.5 * insufficient;
}

// Score final combiné, arrondi à 2 décimales
export function calculateFinalScore(params: {
  urgenceScore: number;
  couvertureScore: number;
  co2Score: number;
  absent: number;
  insufficient: number;
}): number {
  const { urgenceScore, couvertureScore, co2Score, absent, insufficient } =
    params;
  const score =
    0.6 * urgenceScore +
    0.3 * couvertureScore +
    0.1 * co2Score -
    calculatePenalties(absent, insufficient);
  return Math.round(score * 100) / 100;
}

// XP gagné en réalisant une recette : score x 3, minimum 5
export function computeXP(score: number): number {
  return Math.max(Math.round(score * 3), 5);
}

// Niveau correspondant à un total d'XP (5 paliers du CDC)
export function levelForXP(xp: number): number {
  if (xp <= 100) return 1; // Débutant
  if (xp <= 300) return 2; // Consciencieux
  if (xp <= 600) return 3; // Écolo
  if (xp <= 1000) return 4; // Expert anti-gaspi
  return 5; // Héros Vert
}
