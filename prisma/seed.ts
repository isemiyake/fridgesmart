import { PrismaClient, UnitEnum } from "@prisma/client";

const prisma = new PrismaClient();

// Même forme canonique que lib/normalize.ts (recopiée ici car le seed tourne hors Next).
function canonicalize(name: string): string {
  let n = name.trim().toLowerCase();
  n = n.normalize("NFD").replace(/[̀-ͯ]/g, "");
  n = n.replace(/s$/, "");
  return n;
}

// Ingrédients normalisés + CO2 économisé (g pour 100g), valeurs indicatives (ADEME / Our World in Data)
const ingredients: { name: string; co2: number }[] = [
  { name: "boeuf", co2: 2700 },
  { name: "poulet", co2: 690 },
  { name: "lardons", co2: 1200 },
  { name: "fromage", co2: 1050 },
  { name: "parmesan", co2: 1050 },
  { name: "oeufs", co2: 430 },
  { name: "lait", co2: 380 },
  { name: "yaourt", co2: 380 },
  { name: "creme", co2: 400 },
  { name: "beurre", co2: 900 },
  { name: "tomates", co2: 150 },
  { name: "carottes", co2: 120 },
  { name: "pommes de terre", co2: 100 },
  { name: "oignons", co2: 100 },
  { name: "courgettes", co2: 130 },
  { name: "epinards", co2: 150 },
  { name: "ail", co2: 100 },
  { name: "basilic", co2: 150 },
  { name: "pommes", co2: 200 },
  { name: "bananes", co2: 250 },
  { name: "pates", co2: 90 },
  { name: "riz", co2: 90 },
  { name: "farine", co2: 80 },
  { name: "pate brisee", co2: 100 },
];

type SeedRecipe = {
  title: string;
  description: string;
  servings: number;
  steps: string[];
  items: { name: string; quantity: number; unit: UnitEnum }[];
};

const recipes: SeedRecipe[] = [
  {
    title: "Omelette aux légumes",
    description: "Une omelette rapide pour utiliser les restes de légumes.",
    servings: 2,
    steps: [
      "Battre les oeufs dans un bol.",
      "Faire revenir les courgettes et oignons à la poêle.",
      "Ajouter les oeufs et le fromage, cuire 5 minutes.",
    ],
    items: [
      { name: "oeufs", quantity: 4, unit: "pcs" },
      { name: "courgettes", quantity: 1, unit: "pcs" },
      { name: "oignons", quantity: 1, unit: "pcs" },
      { name: "fromage", quantity: 50, unit: "g" },
    ],
  },
  {
    title: "Quiche lorraine",
    description: "Le grand classique aux lardons.",
    servings: 4,
    steps: [
      "Étaler la pâte dans un moule.",
      "Mélanger oeufs, crème et lardons.",
      "Verser sur la pâte et cuire 30 minutes à 180°C.",
    ],
    items: [
      { name: "pate brisee", quantity: 1, unit: "pcs" },
      { name: "oeufs", quantity: 3, unit: "pcs" },
      { name: "creme", quantity: 200, unit: "ml" },
      { name: "lardons", quantity: 150, unit: "g" },
      { name: "fromage", quantity: 100, unit: "g" },
    ],
  },
  {
    title: "Poulet rôti aux carottes",
    description: "Un plat complet au four.",
    servings: 4,
    steps: [
      "Préchauffer le four à 200°C.",
      "Disposer le poulet, les carottes et les pommes de terre.",
      "Cuire 45 minutes.",
    ],
    items: [
      { name: "poulet", quantity: 500, unit: "g" },
      { name: "carottes", quantity: 3, unit: "pcs" },
      { name: "pommes de terre", quantity: 4, unit: "pcs" },
      { name: "ail", quantity: 2, unit: "pcs" },
    ],
  },
  {
    title: "Pâtes à la tomate",
    description: "Simple, rapide et végétarien.",
    servings: 2,
    steps: [
      "Cuire les pâtes.",
      "Faire revenir oignons, ail et tomates.",
      "Mélanger et ajouter le basilic.",
    ],
    items: [
      { name: "pates", quantity: 200, unit: "g" },
      { name: "tomates", quantity: 3, unit: "pcs" },
      { name: "oignons", quantity: 1, unit: "pcs" },
      { name: "ail", quantity: 1, unit: "pcs" },
      { name: "basilic", quantity: 5, unit: "g" },
    ],
  },
  {
    title: "Soupe de légumes",
    description: "Pour finir les légumes du frigo.",
    servings: 4,
    steps: [
      "Éplucher et couper les légumes.",
      "Couvrir d'eau et cuire 25 minutes.",
      "Mixer.",
    ],
    items: [
      { name: "carottes", quantity: 3, unit: "pcs" },
      { name: "pommes de terre", quantity: 2, unit: "pcs" },
      { name: "oignons", quantity: 1, unit: "pcs" },
      { name: "courgettes", quantity: 1, unit: "pcs" },
    ],
  },
  {
    title: "Risotto au parmesan",
    description: "Crémeux et réconfortant.",
    servings: 2,
    steps: [
      "Faire revenir l'oignon.",
      "Ajouter le riz puis le bouillon petit à petit.",
      "Incorporer beurre et parmesan.",
    ],
    items: [
      { name: "riz", quantity: 200, unit: "g" },
      { name: "parmesan", quantity: 50, unit: "g" },
      { name: "oignons", quantity: 1, unit: "pcs" },
      { name: "beurre", quantity: 20, unit: "g" },
    ],
  },
  {
    title: "Gratin de courgettes",
    description: "Un gratin léger.",
    servings: 4,
    steps: [
      "Couper les courgettes en rondelles.",
      "Mélanger avec crème, oeufs et fromage.",
      "Cuire au four 30 minutes.",
    ],
    items: [
      { name: "courgettes", quantity: 3, unit: "pcs" },
      { name: "creme", quantity: 150, unit: "ml" },
      { name: "fromage", quantity: 80, unit: "g" },
      { name: "oeufs", quantity: 2, unit: "pcs" },
    ],
  },
  {
    title: "Salade de tomates",
    description: "Fraîche et rapide.",
    servings: 2,
    steps: ["Couper les tomates et l'oignon.", "Assaisonner et ajouter le basilic."],
    items: [
      { name: "tomates", quantity: 4, unit: "pcs" },
      { name: "oignons", quantity: 1, unit: "pcs" },
      { name: "basilic", quantity: 5, unit: "g" },
    ],
  },
  {
    title: "Banana bread",
    description: "Pour utiliser les bananes trop mûres.",
    servings: 6,
    steps: [
      "Écraser les bananes.",
      "Mélanger avec farine, oeufs et beurre.",
      "Cuire 45 minutes à 180°C.",
    ],
    items: [
      { name: "bananes", quantity: 3, unit: "pcs" },
      { name: "farine", quantity: 250, unit: "g" },
      { name: "oeufs", quantity: 2, unit: "pcs" },
      { name: "beurre", quantity: 100, unit: "g" },
    ],
  },
  {
    title: "Compote de pommes",
    description: "Anti-gaspi par excellence.",
    servings: 4,
    steps: ["Éplucher et couper les pommes.", "Cuire 20 minutes avec un peu d'eau.", "Mixer."],
    items: [{ name: "pommes", quantity: 5, unit: "pcs" }],
  },
  {
    title: "Boeuf aux carottes",
    description: "Mijoté traditionnel.",
    servings: 4,
    steps: [
      "Faire dorer le boeuf.",
      "Ajouter carottes, oignons et pommes de terre.",
      "Mijoter 1h30.",
    ],
    items: [
      { name: "boeuf", quantity: 500, unit: "g" },
      { name: "carottes", quantity: 4, unit: "pcs" },
      { name: "oignons", quantity: 2, unit: "pcs" },
      { name: "pommes de terre", quantity: 4, unit: "pcs" },
    ],
  },
  {
    title: "Yaourt aux fruits",
    description: "Dessert express.",
    servings: 1,
    steps: ["Couper les fruits.", "Mélanger avec le yaourt."],
    items: [
      { name: "yaourt", quantity: 125, unit: "g" },
      { name: "bananes", quantity: 1, unit: "pcs" },
      { name: "pommes", quantity: 1, unit: "pcs" },
    ],
  },
];

async function main() {
  // ingrédients normalisés (noms canoniques)
  for (const ing of ingredients) {
    const name = canonicalize(ing.name);
    await prisma.normalizedIngredient.upsert({
      where: { name },
      update: { co2SavedGrams: ing.co2 },
      create: { name, co2SavedGrams: ing.co2 },
    });
  }
  console.log(`${ingredients.length} ingrédients normalisés prêts.`);

  // reset des recettes pour les ré-aligner sur les noms canoniques
  await prisma.cookedHistory.deleteMany({});
  await prisma.recipeIngredient.deleteMany({});
  await prisma.recipeStep.deleteMany({});
  await prisma.recipe.deleteMany({});

  for (const r of recipes) {
    const recipe = await prisma.recipe.create({
      data: {
        title: r.title,
        description: r.description,
        servings: r.servings,
        steps: {
          create: r.steps.map((content, i) => ({ order: i + 1, content })),
        },
      },
    });

    for (const it of r.items) {
      const norm = await prisma.normalizedIngredient.findUnique({
        where: { name: canonicalize(it.name) },
      });
      if (!norm) continue;
      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          normalizedId: norm.id,
          quantity: it.quantity,
          unit: it.unit,
        },
      });
    }
  }
  console.log(`${recipes.length} recettes créées.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
