// Conversions d'unités pour comparer le stock à la quantité requise.
// Seules kg<->g et L<->ml sont gérées (les conversions croisées sont une limite assumée du CDC).

const FAMILY: Record<string, string> = {
  g: "mass",
  kg: "mass",
  ml: "vol",
  L: "vol",
};

const FACTOR: Record<string, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  L: 1000,
};

// Le stock disponible couvre-t-il la quantité requise ?
export function isSufficient(
  haveQty: number,
  haveUnit: string,
  reqQty: number,
  reqUnit: string
): boolean {
  if (haveUnit === reqUnit) return haveQty >= reqQty;

  // même famille (masse ou volume) -> on convertit
  if (FAMILY[haveUnit] && FAMILY[haveUnit] === FAMILY[reqUnit]) {
    return haveQty * FACTOR[haveUnit] >= reqQty * FACTOR[reqUnit];
  }

  // unités non convertibles entre elles -> on considère présent (limite assumée)
  return true;
}
