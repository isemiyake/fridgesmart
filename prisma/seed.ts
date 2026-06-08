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
  // viandes / poissons / protéines
  { name: "boeuf", co2: 2700 },
  { name: "poulet", co2: 690 },
  { name: "porc", co2: 1200 },
  { name: "lardons", co2: 1200 },
  { name: "jambon", co2: 1100 },
  { name: "saumon", co2: 500 },
  { name: "thon", co2: 600 },
  { name: "crevettes", co2: 1800 },
  { name: "oeufs", co2: 430 },
  // produits laitiers
  { name: "fromage", co2: 1050 },
  { name: "parmesan", co2: 1050 },
  { name: "mozzarella", co2: 900 },
  { name: "lait", co2: 380 },
  { name: "yaourt", co2: 380 },
  { name: "creme", co2: 400 },
  { name: "beurre", co2: 900 },
  // légumes
  { name: "tomates", co2: 150 },
  { name: "carottes", co2: 120 },
  { name: "pommes de terre", co2: 100 },
  { name: "oignons", co2: 100 },
  { name: "courgettes", co2: 130 },
  { name: "aubergines", co2: 150 },
  { name: "poivrons", co2: 200 },
  { name: "champignons", co2: 300 },
  { name: "epinards", co2: 150 },
  { name: "brocoli", co2: 200 },
  { name: "haricots verts", co2: 150 },
  { name: "petits pois", co2: 150 },
  { name: "salade", co2: 130 },
  { name: "concombre", co2: 100 },
  { name: "chou", co2: 130 },
  { name: "mais", co2: 120 },
  { name: "ail", co2: 100 },
  { name: "echalote", co2: 100 },
  // fruits
  { name: "pommes", co2: 200 },
  { name: "bananes", co2: 250 },
  { name: "citron", co2: 200 },
  { name: "oranges", co2: 250 },
  { name: "fraises", co2: 300 },
  { name: "poires", co2: 200 },
  // féculents / secs
  { name: "pates", co2: 90 },
  { name: "riz", co2: 90 },
  { name: "quinoa", co2: 90 },
  { name: "lentilles", co2: 90 },
  { name: "pois chiches", co2: 90 },
  { name: "farine", co2: 80 },
  { name: "pain", co2: 100 },
  { name: "semoule", co2: 90 },
  { name: "pate brisee", co2: 100 },
  { name: "pate feuilletee", co2: 100 },
  // divers
  { name: "basilic", co2: 150 },
  { name: "persil", co2: 150 },
  { name: "gingembre", co2: 150 },
  { name: "huile d'olive", co2: 300 },
  { name: "miel", co2: 100 },
  { name: "sucre", co2: 80 },
  { name: "chocolat", co2: 250 },
];

type SeedRecipe = {
  title: string;
  description: string;
  servings: number;
  steps: string[];
  items: { name: string; quantity: number; unit: UnitEnum }[];
};

const recipes: SeedRecipe[] = [
  { title: "Omelette aux légumes", description: "Rapide pour utiliser les restes de légumes.", servings: 2, steps: ["Battre les oeufs.", "Faire revenir courgettes et oignons.", "Ajouter oeufs et fromage, cuire 5 min."], items: [{ name: "oeufs", quantity: 4, unit: "pcs" }, { name: "courgettes", quantity: 1, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "fromage", quantity: 50, unit: "g" }] },
  { title: "Quiche lorraine", description: "Le classique aux lardons.", servings: 4, steps: ["Étaler la pâte.", "Mélanger oeufs, crème et lardons.", "Cuire 30 min à 180°C."], items: [{ name: "pate brisee", quantity: 1, unit: "pcs" }, { name: "oeufs", quantity: 3, unit: "pcs" }, { name: "creme", quantity: 200, unit: "ml" }, { name: "lardons", quantity: 150, unit: "g" }, { name: "fromage", quantity: 100, unit: "g" }] },
  { title: "Poulet rôti aux carottes", description: "Plat complet au four.", servings: 4, steps: ["Préchauffer à 200°C.", "Disposer poulet, carottes, pommes de terre.", "Cuire 45 min."], items: [{ name: "poulet", quantity: 500, unit: "g" }, { name: "carottes", quantity: 3, unit: "pcs" }, { name: "pommes de terre", quantity: 4, unit: "pcs" }, { name: "ail", quantity: 2, unit: "pcs" }] },
  { title: "Pâtes à la tomate", description: "Simple et végétarien.", servings: 2, steps: ["Cuire les pâtes.", "Revenir oignons, ail, tomates.", "Mélanger et ajouter le basilic."], items: [{ name: "pates", quantity: 200, unit: "g" }, { name: "tomates", quantity: 3, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "ail", quantity: 1, unit: "pcs" }, { name: "basilic", quantity: 5, unit: "g" }] },
  { title: "Soupe de légumes", description: "Pour finir les légumes du frigo.", servings: 4, steps: ["Couper les légumes.", "Couvrir d'eau, cuire 25 min.", "Mixer."], items: [{ name: "carottes", quantity: 3, unit: "pcs" }, { name: "pommes de terre", quantity: 2, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "courgettes", quantity: 1, unit: "pcs" }] },
  { title: "Risotto au parmesan", description: "Crémeux et réconfortant.", servings: 2, steps: ["Revenir l'oignon.", "Ajouter le riz puis le bouillon petit à petit.", "Incorporer beurre et parmesan."], items: [{ name: "riz", quantity: 200, unit: "g" }, { name: "parmesan", quantity: 50, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "beurre", quantity: 20, unit: "g" }] },
  { title: "Gratin de courgettes", description: "Un gratin léger.", servings: 4, steps: ["Couper les courgettes.", "Mélanger crème, oeufs, fromage.", "Cuire au four 30 min."], items: [{ name: "courgettes", quantity: 3, unit: "pcs" }, { name: "creme", quantity: 150, unit: "ml" }, { name: "fromage", quantity: 80, unit: "g" }, { name: "oeufs", quantity: 2, unit: "pcs" }] },
  { title: "Salade de tomates", description: "Fraîche et rapide.", servings: 2, steps: ["Couper tomates et oignon.", "Assaisonner, ajouter le basilic."], items: [{ name: "tomates", quantity: 4, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "basilic", quantity: 5, unit: "g" }] },
  { title: "Banana bread", description: "Pour les bananes trop mûres.", servings: 6, steps: ["Écraser les bananes.", "Mélanger farine, oeufs, beurre.", "Cuire 45 min à 180°C."], items: [{ name: "bananes", quantity: 3, unit: "pcs" }, { name: "farine", quantity: 250, unit: "g" }, { name: "oeufs", quantity: 2, unit: "pcs" }, { name: "beurre", quantity: 100, unit: "g" }] },
  { title: "Compote de pommes", description: "Anti-gaspi par excellence.", servings: 4, steps: ["Éplucher et couper les pommes.", "Cuire 20 min.", "Mixer."], items: [{ name: "pommes", quantity: 5, unit: "pcs" }] },
  { title: "Boeuf aux carottes", description: "Mijoté traditionnel.", servings: 4, steps: ["Dorer le boeuf.", "Ajouter carottes, oignons, pommes de terre.", "Mijoter 1h30."], items: [{ name: "boeuf", quantity: 500, unit: "g" }, { name: "carottes", quantity: 4, unit: "pcs" }, { name: "oignons", quantity: 2, unit: "pcs" }, { name: "pommes de terre", quantity: 4, unit: "pcs" }] },
  { title: "Yaourt aux fruits", description: "Dessert express.", servings: 1, steps: ["Couper les fruits.", "Mélanger avec le yaourt."], items: [{ name: "yaourt", quantity: 125, unit: "g" }, { name: "bananes", quantity: 1, unit: "pcs" }, { name: "pommes", quantity: 1, unit: "pcs" }] },
  { title: "Pâtes au poulet et à la crème", description: "Onctueux et gourmand.", servings: 2, steps: ["Cuire les pâtes.", "Faire dorer le poulet avec l'ail.", "Ajouter la crème et les champignons, mélanger."], items: [{ name: "pates", quantity: 200, unit: "g" }, { name: "poulet", quantity: 300, unit: "g" }, { name: "creme", quantity: 150, unit: "ml" }, { name: "champignons", quantity: 150, unit: "g" }, { name: "ail", quantity: 1, unit: "pcs" }] },
  { title: "Saumon grillé au citron", description: "Léger et savoureux.", servings: 2, steps: ["Assaisonner le saumon.", "Griller 10 min.", "Arroser de citron et d'huile d'olive."], items: [{ name: "saumon", quantity: 300, unit: "g" }, { name: "citron", quantity: 1, unit: "pcs" }, { name: "huile d'olive", quantity: 2, unit: "tbsp" }] },
  { title: "Salade César", description: "Croquante avec du poulet.", servings: 2, steps: ["Cuire le poulet.", "Couper la salade.", "Ajouter parmesan et croûtons de pain."], items: [{ name: "salade", quantity: 1, unit: "pcs" }, { name: "poulet", quantity: 250, unit: "g" }, { name: "parmesan", quantity: 40, unit: "g" }, { name: "pain", quantity: 100, unit: "g" }] },
  { title: "Curry de poulet", description: "Parfumé, avec du riz.", servings: 4, steps: ["Dorer le poulet et l'oignon.", "Ajouter ail et crème.", "Servir avec le riz."], items: [{ name: "poulet", quantity: 500, unit: "g" }, { name: "riz", quantity: 250, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "creme", quantity: 100, unit: "ml" }, { name: "ail", quantity: 2, unit: "pcs" }] },
  { title: "Tortilla espagnole", description: "Omelette épaisse aux pommes de terre.", servings: 4, steps: ["Cuire les pommes de terre et oignons.", "Mélanger aux oeufs battus.", "Cuire à la poêle des deux côtés."], items: [{ name: "oeufs", quantity: 6, unit: "pcs" }, { name: "pommes de terre", quantity: 3, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }] },
  { title: "Poêlée de légumes", description: "Colorée et rapide.", servings: 3, steps: ["Couper tous les légumes.", "Faire sauter à la poêle avec l'ail.", "Assaisonner."], items: [{ name: "courgettes", quantity: 1, unit: "pcs" }, { name: "poivrons", quantity: 1, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "champignons", quantity: 150, unit: "g" }, { name: "ail", quantity: 1, unit: "pcs" }] },
  { title: "Gratin dauphinois", description: "Fondant à la crème.", servings: 4, steps: ["Couper les pommes de terre en fines tranches.", "Disposer avec crème et lait.", "Couvrir de fromage, cuire 1h."], items: [{ name: "pommes de terre", quantity: 6, unit: "pcs" }, { name: "creme", quantity: 200, unit: "ml" }, { name: "lait", quantity: 200, unit: "ml" }, { name: "fromage", quantity: 100, unit: "g" }] },
  { title: "Soupe à l'oignon", description: "Réconfortante et gratinée.", servings: 4, steps: ["Faire fondre les oignons dans le beurre.", "Couvrir d'eau, cuire 20 min.", "Servir avec pain et fromage gratiné."], items: [{ name: "oignons", quantity: 4, unit: "pcs" }, { name: "pain", quantity: 100, unit: "g" }, { name: "fromage", quantity: 80, unit: "g" }, { name: "beurre", quantity: 20, unit: "g" }] },
  { title: "Pâtes carbonara", description: "L'authentique, sans crème.", servings: 2, steps: ["Cuire les pâtes.", "Faire revenir les lardons.", "Mélanger hors du feu avec oeufs et parmesan."], items: [{ name: "pates", quantity: 200, unit: "g" }, { name: "lardons", quantity: 120, unit: "g" }, { name: "oeufs", quantity: 2, unit: "pcs" }, { name: "parmesan", quantity: 50, unit: "g" }] },
  { title: "Risotto aux champignons", description: "Terreux et crémeux.", servings: 2, steps: ["Revenir oignon et champignons.", "Ajouter le riz puis le bouillon.", "Terminer au parmesan."], items: [{ name: "riz", quantity: 200, unit: "g" }, { name: "champignons", quantity: 200, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "parmesan", quantity: 40, unit: "g" }] },
  { title: "Poulet au lait et aux épices", description: "Tendre et parfumé.", servings: 4, steps: ["Dorer le poulet.", "Ajouter oignons, ail et lait.", "Mijoter 40 min."], items: [{ name: "poulet", quantity: 600, unit: "g" }, { name: "lait", quantity: 300, unit: "ml" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "ail", quantity: 2, unit: "pcs" }] },
  { title: "Salade de pommes de terre", description: "Parfaite pour un repas froid.", servings: 4, steps: ["Cuire les pommes de terre.", "Couper avec oeufs durs et oignon.", "Assaisonner."], items: [{ name: "pommes de terre", quantity: 5, unit: "pcs" }, { name: "oeufs", quantity: 2, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }] },
  { title: "Tarte aux pommes", description: "Le dessert classique.", servings: 6, steps: ["Étaler la pâte.", "Disposer les pommes en tranches.", "Saupoudrer de sucre, cuire 35 min."], items: [{ name: "pate brisee", quantity: 1, unit: "pcs" }, { name: "pommes", quantity: 4, unit: "pcs" }, { name: "sucre", quantity: 50, unit: "g" }, { name: "beurre", quantity: 30, unit: "g" }] },
  { title: "Smoothie banane", description: "Boisson énergisante.", servings: 1, steps: ["Mettre tout dans le blender.", "Mixer jusqu'à onctuosité."], items: [{ name: "bananes", quantity: 2, unit: "pcs" }, { name: "lait", quantity: 200, unit: "ml" }, { name: "miel", quantity: 1, unit: "tbsp" }] },
  { title: "Boeuf bourguignon simplifié", description: "Mijoté riche.", servings: 4, steps: ["Dorer le boeuf.", "Ajouter carottes, oignons, champignons.", "Mijoter 2h."], items: [{ name: "boeuf", quantity: 600, unit: "g" }, { name: "carottes", quantity: 3, unit: "pcs" }, { name: "oignons", quantity: 2, unit: "pcs" }, { name: "champignons", quantity: 200, unit: "g" }] },
  { title: "Saumon au four et pommes de terre", description: "Repas complet.", servings: 2, steps: ["Disposer saumon et pommes de terre.", "Arroser d'huile et de citron.", "Cuire 25 min à 200°C."], items: [{ name: "saumon", quantity: 300, unit: "g" }, { name: "pommes de terre", quantity: 3, unit: "pcs" }, { name: "citron", quantity: 1, unit: "pcs" }, { name: "huile d'olive", quantity: 2, unit: "tbsp" }] },
  { title: "Ratatouille", description: "Le plat de légumes du soleil.", servings: 4, steps: ["Couper tous les légumes.", "Faire mijoter avec ail et huile.", "Laisser compoter 40 min."], items: [{ name: "tomates", quantity: 3, unit: "pcs" }, { name: "courgettes", quantity: 2, unit: "pcs" }, { name: "aubergines", quantity: 1, unit: "pcs" }, { name: "poivrons", quantity: 1, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "ail", quantity: 2, unit: "pcs" }] },
  { title: "Crêpes", description: "Pour le goûter.", servings: 4, steps: ["Mélanger farine, oeufs, lait.", "Laisser reposer.", "Cuire à la poêle avec un peu de beurre."], items: [{ name: "farine", quantity: 250, unit: "g" }, { name: "oeufs", quantity: 3, unit: "pcs" }, { name: "lait", quantity: 500, unit: "ml" }, { name: "beurre", quantity: 30, unit: "g" }] },
  { title: "Quinoa aux légumes", description: "Sain et équilibré.", servings: 3, steps: ["Cuire le quinoa.", "Faire sauter les légumes.", "Mélanger le tout."], items: [{ name: "quinoa", quantity: 200, unit: "g" }, { name: "courgettes", quantity: 1, unit: "pcs" }, { name: "poivrons", quantity: 1, unit: "pcs" }, { name: "tomates", quantity: 2, unit: "pcs" }] },
  { title: "Dahl de lentilles", description: "Plat indien réconfortant.", servings: 4, steps: ["Cuire les lentilles.", "Revenir oignons, ail, gingembre.", "Ajouter les tomates et mijoter."], items: [{ name: "lentilles", quantity: 250, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "tomates", quantity: 2, unit: "pcs" }, { name: "ail", quantity: 2, unit: "pcs" }, { name: "gingembre", quantity: 10, unit: "g" }] },
  { title: "Salade de pois chiches", description: "Fraîche et protéinée.", servings: 2, steps: ["Rincer les pois chiches.", "Couper tomates, concombre, oignon.", "Mélanger et assaisonner."], items: [{ name: "pois chiches", quantity: 200, unit: "g" }, { name: "tomates", quantity: 2, unit: "pcs" }, { name: "concombre", quantity: 1, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }] },
  { title: "Poulet aux poivrons", description: "Sauté coloré.", servings: 3, steps: ["Dorer le poulet.", "Ajouter poivrons et oignons.", "Servir avec le riz."], items: [{ name: "poulet", quantity: 400, unit: "g" }, { name: "poivrons", quantity: 2, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "riz", quantity: 200, unit: "g" }] },
  { title: "Hachis parmentier", description: "Gratin de boeuf et purée.", servings: 4, steps: ["Préparer la purée de pommes de terre.", "Faire revenir le boeuf et l'oignon.", "Monter en gratin et cuire 20 min."], items: [{ name: "boeuf", quantity: 400, unit: "g" }, { name: "pommes de terre", quantity: 6, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "beurre", quantity: 30, unit: "g" }] },
  { title: "Velouté de courgettes", description: "Doux et crémeux.", servings: 4, steps: ["Cuire courgettes et oignon.", "Mixer.", "Ajouter la crème."], items: [{ name: "courgettes", quantity: 4, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "creme", quantity: 100, unit: "ml" }] },
  { title: "Pain perdu", description: "Anti-gaspi pour le pain rassis.", servings: 2, steps: ["Battre oeufs, lait et sucre.", "Tremper les tranches de pain.", "Dorer à la poêle."], items: [{ name: "pain", quantity: 200, unit: "g" }, { name: "oeufs", quantity: 2, unit: "pcs" }, { name: "lait", quantity: 200, unit: "ml" }, { name: "sucre", quantity: 30, unit: "g" }] },
  { title: "Salade de fruits", description: "Légère et vitaminée.", servings: 4, steps: ["Couper tous les fruits.", "Mélanger délicatement."], items: [{ name: "pommes", quantity: 2, unit: "pcs" }, { name: "bananes", quantity: 2, unit: "pcs" }, { name: "oranges", quantity: 2, unit: "pcs" }, { name: "fraises", quantity: 150, unit: "g" }] },
  { title: "Gratin de pâtes au jambon", description: "Plat familial.", servings: 4, steps: ["Cuire les pâtes.", "Mélanger crème, fromage et jambon.", "Gratiner au four 20 min."], items: [{ name: "pates", quantity: 300, unit: "g" }, { name: "fromage", quantity: 100, unit: "g" }, { name: "creme", quantity: 150, unit: "ml" }, { name: "jambon", quantity: 150, unit: "g" }] },
  { title: "Tajine de poulet au citron", description: "Mijoté parfumé.", servings: 4, steps: ["Dorer le poulet.", "Ajouter carottes, oignons et citron.", "Mijoter 50 min."], items: [{ name: "poulet", quantity: 600, unit: "g" }, { name: "carottes", quantity: 3, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "citron", quantity: 1, unit: "pcs" }] },
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
