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
  // protéines
  { name: "dinde", co2: 690 },
  { name: "steak hache", co2: 2700 },
  { name: "saucisse", co2: 1200 },
  { name: "chorizo", co2: 1200 },
  { name: "cabillaud", co2: 500 },
  { name: "sardines", co2: 400 },
  { name: "thon en boite", co2: 600 },
  { name: "tofu", co2: 200 },
  { name: "feta", co2: 1050 },
  { name: "chevre", co2: 900 },
  { name: "ricotta", co2: 700 },
  // légumes
  { name: "patate douce", co2: 120 },
  { name: "potiron", co2: 130 },
  { name: "butternut", co2: 130 },
  { name: "poireau", co2: 120 },
  { name: "celeri", co2: 120 },
  { name: "betterave", co2: 120 },
  { name: "navet", co2: 100 },
  { name: "fenouil", co2: 130 },
  { name: "asperges", co2: 200 },
  { name: "avocat", co2: 300 },
  { name: "roquette", co2: 130 },
  { name: "radis", co2: 100 },
  { name: "olives", co2: 300 },
  // fruits
  { name: "ananas", co2: 300 },
  { name: "mangue", co2: 300 },
  { name: "raisins", co2: 250 },
  { name: "peches", co2: 250 },
  { name: "abricots", co2: 250 },
  { name: "melon", co2: 200 },
  { name: "kiwi", co2: 250 },
  { name: "myrtilles", co2: 300 },
  // féculents / secs
  { name: "couscous", co2: 90 },
  { name: "boulgour", co2: 90 },
  { name: "haricots rouges", co2: 90 },
  { name: "gnocchi", co2: 100 },
  { name: "flocons d'avoine", co2: 90 },
  // aromates / divers
  { name: "coriandre", co2: 150 },
  { name: "menthe", co2: 150 },
  { name: "thym", co2: 150 },
  { name: "noix", co2: 300 },
  { name: "amandes", co2: 300 },
  { name: "lait de coco", co2: 300 },
  { name: "tomate concentree", co2: 150 },
  { name: "moutarde", co2: 100 },
  { name: "pesto", co2: 300 },
  { name: "curry", co2: 100 },
  { name: "paprika", co2: 100 },
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
  { title: "Dinde rôtie aux légumes", description: "Plat de fête léger.", servings: 4, steps: ["Préchauffer à 200°C.", "Disposer dinde et légumes.", "Cuire 50 min."], items: [{ name: "dinde", quantity: 600, unit: "g" }, { name: "carottes", quantity: 3, unit: "pcs" }, { name: "pommes de terre", quantity: 4, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }] },
  { title: "Chili con carne", description: "Épicé et nourrissant.", servings: 4, steps: ["Dorer le steak haché.", "Ajouter haricots, tomates, poivrons.", "Mijoter 30 min."], items: [{ name: "steak hache", quantity: 400, unit: "g" }, { name: "haricots rouges", quantity: 200, unit: "g" }, { name: "tomates", quantity: 3, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "poivrons", quantity: 1, unit: "pcs" }] },
  { title: "Cabillaud au four", description: "Poisson tendre et citronné.", servings: 2, steps: ["Disposer le cabillaud.", "Ajouter citron et pommes de terre.", "Cuire 25 min."], items: [{ name: "cabillaud", quantity: 300, unit: "g" }, { name: "citron", quantity: 1, unit: "pcs" }, { name: "pommes de terre", quantity: 3, unit: "pcs" }, { name: "huile d'olive", quantity: 2, unit: "tbsp" }] },
  { title: "Buddha bowl", description: "Bol healthy et coloré.", servings: 2, steps: ["Cuire le quinoa.", "Couper avocat et tomates.", "Dresser avec roquette et pois chiches."], items: [{ name: "quinoa", quantity: 150, unit: "g" }, { name: "avocat", quantity: 1, unit: "pcs" }, { name: "tomates", quantity: 2, unit: "pcs" }, { name: "roquette", quantity: 50, unit: "g" }, { name: "pois chiches", quantity: 150, unit: "g" }] },
  { title: "Wok de tofu", description: "Sauté végétarien rapide.", servings: 2, steps: ["Faire dorer le tofu.", "Ajouter poivrons et courgettes.", "Servir avec le riz."], items: [{ name: "tofu", quantity: 200, unit: "g" }, { name: "poivrons", quantity: 1, unit: "pcs" }, { name: "courgettes", quantity: 1, unit: "pcs" }, { name: "riz", quantity: 150, unit: "g" }, { name: "ail", quantity: 1, unit: "pcs" }] },
  { title: "Couscous aux légumes", description: "Plat convivial.", servings: 4, steps: ["Cuire le couscous.", "Mijoter les légumes.", "Servir ensemble."], items: [{ name: "couscous", quantity: 250, unit: "g" }, { name: "carottes", quantity: 2, unit: "pcs" }, { name: "courgettes", quantity: 1, unit: "pcs" }, { name: "pois chiches", quantity: 150, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }] },
  { title: "Salade grecque", description: "Fraîcheur méditerranéenne.", servings: 2, steps: ["Couper tomates et concombre.", "Ajouter feta et olives."], items: [{ name: "tomates", quantity: 3, unit: "pcs" }, { name: "concombre", quantity: 1, unit: "pcs" }, { name: "feta", quantity: 100, unit: "g" }, { name: "olives", quantity: 50, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }] },
  { title: "Soupe de potiron", description: "Veloutée et douce.", servings: 4, steps: ["Cuire le potiron et l'oignon.", "Mixer.", "Ajouter la crème."], items: [{ name: "potiron", quantity: 600, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "creme", quantity: 100, unit: "ml" }] },
  { title: "Velouté de butternut", description: "Crémeux et automnal.", servings: 4, steps: ["Cuire le butternut.", "Mixer avec le lait.", "Assaisonner."], items: [{ name: "butternut", quantity: 600, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "lait", quantity: 200, unit: "ml" }] },
  { title: "Poireaux à la crème", description: "Accompagnement fondant.", servings: 3, steps: ["Émincer les poireaux.", "Cuire doucement.", "Ajouter la crème."], items: [{ name: "poireau", quantity: 3, unit: "pcs" }, { name: "creme", quantity: 150, unit: "ml" }, { name: "pommes de terre", quantity: 2, unit: "pcs" }] },
  { title: "Gratin de patate douce", description: "Sucré-salé gourmand.", servings: 4, steps: ["Couper les patates douces.", "Napper de crème et fromage.", "Cuire 40 min."], items: [{ name: "patate douce", quantity: 4, unit: "pcs" }, { name: "creme", quantity: 150, unit: "ml" }, { name: "fromage", quantity: 80, unit: "g" }] },
  { title: "Tartine avocat", description: "Petit-déj tendance.", servings: 1, steps: ["Écraser l'avocat.", "Tartiner sur le pain.", "Arroser de citron."], items: [{ name: "pain", quantity: 100, unit: "g" }, { name: "avocat", quantity: 1, unit: "pcs" }, { name: "citron", quantity: 1, unit: "pcs" }] },
  { title: "Salade de betterave et chèvre", description: "Douce et acidulée.", servings: 2, steps: ["Couper la betterave.", "Ajouter chèvre, roquette et noix."], items: [{ name: "betterave", quantity: 2, unit: "pcs" }, { name: "chevre", quantity: 100, unit: "g" }, { name: "roquette", quantity: 50, unit: "g" }, { name: "noix", quantity: 30, unit: "g" }] },
  { title: "Risotto au potiron", description: "Onctueux et de saison.", servings: 2, steps: ["Revenir l'oignon.", "Ajouter riz et potiron.", "Finir au parmesan."], items: [{ name: "riz", quantity: 200, unit: "g" }, { name: "potiron", quantity: 300, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "parmesan", quantity: 40, unit: "g" }] },
  { title: "Poulet au curry et lait de coco", description: "Exotique et parfumé.", servings: 4, steps: ["Dorer le poulet.", "Ajouter curry, oignons et lait de coco.", "Servir avec le riz."], items: [{ name: "poulet", quantity: 500, unit: "g" }, { name: "lait de coco", quantity: 200, unit: "ml" }, { name: "riz", quantity: 250, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "curry", quantity: 1, unit: "tbsp" }] },
  { title: "Boulettes sauce tomate", description: "Comfort food.", servings: 4, steps: ["Former les boulettes.", "Cuire dans la sauce tomate.", "Servir avec les pâtes."], items: [{ name: "steak hache", quantity: 400, unit: "g" }, { name: "tomates", quantity: 4, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "pates", quantity: 250, unit: "g" }] },
  { title: "Saucisses lentilles", description: "Plat d'hiver réconfortant.", servings: 4, steps: ["Cuire les lentilles.", "Faire dorer les saucisses.", "Mélanger avec carottes et oignons."], items: [{ name: "saucisse", quantity: 400, unit: "g" }, { name: "lentilles", quantity: 250, unit: "g" }, { name: "carottes", quantity: 2, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }] },
  { title: "Pizza maison", description: "Simple et savoureuse.", servings: 2, steps: ["Étaler la pâte.", "Étaler la tomate, ajouter la mozzarella.", "Cuire 15 min, parsemer de basilic."], items: [{ name: "pate brisee", quantity: 1, unit: "pcs" }, { name: "tomate concentree", quantity: 100, unit: "g" }, { name: "mozzarella", quantity: 125, unit: "g" }, { name: "basilic", quantity: 5, unit: "g" }] },
  { title: "Pâtes au pesto", description: "Express et parfumé.", servings: 2, steps: ["Cuire les pâtes.", "Mélanger avec le pesto.", "Ajouter tomates et parmesan."], items: [{ name: "pates", quantity: 200, unit: "g" }, { name: "pesto", quantity: 3, unit: "tbsp" }, { name: "parmesan", quantity: 40, unit: "g" }, { name: "tomates", quantity: 2, unit: "pcs" }] },
  { title: "Omelette chèvre épinards", description: "Végétarien rapide.", servings: 2, steps: ["Battre les oeufs.", "Ajouter épinards et chèvre.", "Cuire 5 min."], items: [{ name: "oeufs", quantity: 4, unit: "pcs" }, { name: "chevre", quantity: 80, unit: "g" }, { name: "epinards", quantity: 100, unit: "g" }] },
  { title: "Frittata aux légumes", description: "Omelette épaisse au four.", servings: 4, steps: ["Faire revenir les légumes.", "Verser les oeufs battus.", "Cuire au four 20 min."], items: [{ name: "oeufs", quantity: 6, unit: "pcs" }, { name: "courgettes", quantity: 1, unit: "pcs" }, { name: "poivrons", quantity: 1, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "fromage", quantity: 60, unit: "g" }] },
  { title: "Soupe poireaux pommes de terre", description: "Le classique réconfortant.", servings: 4, steps: ["Couper poireaux et pommes de terre.", "Couvrir d'eau, cuire 25 min.", "Mixer."], items: [{ name: "poireau", quantity: 3, unit: "pcs" }, { name: "pommes de terre", quantity: 3, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }] },
  { title: "Curry de légumes", description: "Végétarien et parfumé.", servings: 4, steps: ["Revenir les légumes.", "Ajouter lait de coco et curry.", "Servir avec le riz."], items: [{ name: "lait de coco", quantity: 200, unit: "ml" }, { name: "courgettes", quantity: 1, unit: "pcs" }, { name: "poivrons", quantity: 1, unit: "pcs" }, { name: "carottes", quantity: 2, unit: "pcs" }, { name: "riz", quantity: 200, unit: "g" }, { name: "curry", quantity: 1, unit: "tbsp" }] },
  { title: "Salade de quinoa", description: "Fraîche et complète.", servings: 2, steps: ["Cuire le quinoa.", "Couper tomates et concombre.", "Ajouter feta et menthe."], items: [{ name: "quinoa", quantity: 150, unit: "g" }, { name: "tomates", quantity: 2, unit: "pcs" }, { name: "concombre", quantity: 1, unit: "pcs" }, { name: "feta", quantity: 80, unit: "g" }, { name: "menthe", quantity: 5, unit: "g" }] },
  { title: "Boeuf sauté aux poivrons", description: "Sauté rapide.", servings: 3, steps: ["Saisir le boeuf.", "Ajouter poivrons et oignons.", "Servir avec le riz."], items: [{ name: "boeuf", quantity: 400, unit: "g" }, { name: "poivrons", quantity: 2, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "riz", quantity: 200, unit: "g" }] },
  { title: "Tarte aux poireaux", description: "Salée et fondante.", servings: 4, steps: ["Étaler la pâte.", "Faire fondre les poireaux.", "Ajouter crème et oeufs, cuire 30 min."], items: [{ name: "pate brisee", quantity: 1, unit: "pcs" }, { name: "poireau", quantity: 3, unit: "pcs" }, { name: "creme", quantity: 150, unit: "ml" }, { name: "oeufs", quantity: 3, unit: "pcs" }] },
  { title: "Crumble aux pommes", description: "Dessert croustillant.", servings: 6, steps: ["Couper les pommes.", "Préparer la pâte à crumble.", "Cuire 30 min."], items: [{ name: "pommes", quantity: 5, unit: "pcs" }, { name: "farine", quantity: 150, unit: "g" }, { name: "beurre", quantity: 80, unit: "g" }, { name: "sucre", quantity: 80, unit: "g" }] },
  { title: "Smoothie fruits rouges", description: "Vitaminé.", servings: 1, steps: ["Mettre tout dans le blender.", "Mixer."], items: [{ name: "myrtilles", quantity: 100, unit: "g" }, { name: "bananes", quantity: 1, unit: "pcs" }, { name: "lait", quantity: 200, unit: "ml" }, { name: "miel", quantity: 1, unit: "tbsp" }] },
  { title: "Salade de fruits exotiques", description: "Évasion sucrée.", servings: 4, steps: ["Couper les fruits.", "Mélanger délicatement."], items: [{ name: "mangue", quantity: 1, unit: "pcs" }, { name: "ananas", quantity: 1, unit: "pcs" }, { name: "kiwi", quantity: 2, unit: "pcs" }, { name: "oranges", quantity: 2, unit: "pcs" }] },
  { title: "Pancakes", description: "Pour un brunch gourmand.", servings: 4, steps: ["Mélanger farine, oeufs, lait.", "Cuire à la poêle.", "Servir avec du miel."], items: [{ name: "farine", quantity: 200, unit: "g" }, { name: "oeufs", quantity: 2, unit: "pcs" }, { name: "lait", quantity: 250, unit: "ml" }, { name: "miel", quantity: 2, unit: "tbsp" }] },
  { title: "Porridge", description: "Petit-déj énergétique.", servings: 1, steps: ["Chauffer les flocons dans le lait.", "Ajouter banane et miel."], items: [{ name: "flocons d'avoine", quantity: 60, unit: "g" }, { name: "lait", quantity: 200, unit: "ml" }, { name: "bananes", quantity: 1, unit: "pcs" }, { name: "miel", quantity: 1, unit: "tbsp" }] },
  { title: "Sandwich au poulet", description: "Repas sur le pouce.", servings: 1, steps: ["Cuire le poulet.", "Garnir le pain avec salade et tomates."], items: [{ name: "pain", quantity: 150, unit: "g" }, { name: "poulet", quantity: 150, unit: "g" }, { name: "salade", quantity: 1, unit: "pcs" }, { name: "tomates", quantity: 1, unit: "pcs" }] },
  { title: "Gnocchi à la crème", description: "Réconfortant en 15 min.", servings: 2, steps: ["Cuire les gnocchi.", "Ajouter crème et épinards.", "Parsemer de parmesan."], items: [{ name: "gnocchi", quantity: 400, unit: "g" }, { name: "creme", quantity: 150, unit: "ml" }, { name: "epinards", quantity: 100, unit: "g" }, { name: "parmesan", quantity: 40, unit: "g" }] },
  { title: "Poêlée chorizo pommes de terre", description: "Plat espagnol rapide.", servings: 3, steps: ["Cuire les pommes de terre.", "Faire revenir chorizo, oignons et poivrons.", "Mélanger."], items: [{ name: "chorizo", quantity: 150, unit: "g" }, { name: "pommes de terre", quantity: 4, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "poivrons", quantity: 1, unit: "pcs" }] },
  { title: "Riz cantonais", description: "Anti-gaspi par excellence.", servings: 3, steps: ["Cuire le riz.", "Faire sauter avec oeufs, petits pois et jambon."], items: [{ name: "riz", quantity: 250, unit: "g" }, { name: "oeufs", quantity: 2, unit: "pcs" }, { name: "petits pois", quantity: 100, unit: "g" }, { name: "jambon", quantity: 100, unit: "g" }, { name: "oignons", quantity: 1, unit: "pcs" }] },
  { title: "Dahl de lentilles corail", description: "Végétarien crémeux.", servings: 4, steps: ["Cuire les lentilles.", "Ajouter lait de coco, tomates et curry.", "Mijoter."], items: [{ name: "lentilles", quantity: 250, unit: "g" }, { name: "lait de coco", quantity: 200, unit: "ml" }, { name: "tomates", quantity: 2, unit: "pcs" }, { name: "oignons", quantity: 1, unit: "pcs" }, { name: "curry", quantity: 1, unit: "tbsp" }] },
  { title: "Salade de pâtes", description: "Idéale pour un pique-nique.", servings: 4, steps: ["Cuire les pâtes.", "Ajouter tomates, mozzarella et olives.", "Parsemer de basilic."], items: [{ name: "pates", quantity: 300, unit: "g" }, { name: "tomates", quantity: 3, unit: "pcs" }, { name: "mozzarella", quantity: 125, unit: "g" }, { name: "olives", quantity: 50, unit: "g" }, { name: "basilic", quantity: 5, unit: "g" }] },
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
