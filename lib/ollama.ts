import { generatedRecipesSchema, type GeneratedRecipe } from "./validations";

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";
// Timeout configurable (CDC : 15s par défaut). Modèles lents/CPU : à augmenter.
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS ?? 15000);

export type PromptIngredient = {
  name: string;
  quantity: number;
  unit: string;
  daysLeft: number;
};

// Ramène une unité libre vers une unité connue (sinon "pcs")
const UNIT_MAP: Record<string, string> = {
  g: "g", gr: "g", gramme: "g", grammes: "g", grams: "g",
  kg: "kg", kilo: "kg", kilos: "kg",
  ml: "ml",
  l: "L", litre: "L", litres: "L",
  pcs: "pcs", piece: "pcs", pieces: "pcs", "pièce": "pcs", "pièces": "pcs",
  unite: "pcs", "unité": "pcs",
  tbsp: "tbsp", cas: "tbsp",
  tsp: "tsp", cac: "tsp",
};

function mapUnit(raw: string): string {
  return UNIT_MAP[raw.trim().toLowerCase()] ?? "pcs";
}

function buildPrompt(ingredients: PromptIngredient[]): string {
  const list = ingredients
    .map(
      (i) =>
        `- ${i.name} (${i.quantity} ${i.unit}, périme dans ${i.daysLeft} jour(s))`
    )
    .join("\n");

  const noms = ingredients.map((i) => i.name).join(", ");

  return `Tu es un chef cuisinier expérimenté et créatif, spécialisé dans l'anti-gaspillage.

Voici les ingrédients disponibles dans le frigo :
${list}

Propose 3 recettes RÉALISTES et SAVOUREUSES (des plats que les gens cuisinent vraiment) qui mettent en valeur ces ingrédients, en PRIORISANT ceux qui périment le plus vite.

RÈGLES :
- Les recettes doivent être COHÉRENTES et appétissantes (des plats qui existent vraiment). NE MÉLANGE PAS des aliments incompatibles (ex : ne mets jamais de fruits avec du poulet ou des pâtes salées).
- Regroupe les ingrédients par affinité : les fruits ensemble (smoothie, salade de fruits), les ingrédients salés ensemble. Une recette peut n'utiliser qu'une PARTIE des ingrédients du frigo si ça la rend cohérente.
- Les 3 recettes doivent être VRAIMENT DIFFÉRENTES (pas plusieurs versions du même plat).
- Garde EXACTEMENT les noms des ingrédients du frigo (sans faute) : ${noms}. N'écris pas "riz cuit", écris "riz".
- TRÈS IMPORTANT : la liste "ingredients" doit contenir TOUS les ingrédients cités dans les étapes (y compris sel, huile, oignon, herbes…). Pas d'ingrédient dans les étapes qui manque dans la liste.

Réponds UNIQUEMENT en JSON valide, sans texte autour, au format exact suivant :
{
  "recipes": [
    {
      "title": "Nom de la recette",
      "description": "Courte description appétissante",
      "steps": ["étape 1", "étape 2", "étape 3"],
      "ingredients": [ { "name": "ingrédient", "quantity": 2, "unit": "pcs" } ]
    }
  ]
}
Les unités autorisées sont : g, kg, ml, L, pcs, tbsp, tsp.`;
}

// Extrait et valide le JSON (tolère du texte/markdown autour)
export function parseRecipes(text: string): GeneratedRecipe[] | null {
  let raw = text.trim();
  // enlève d'éventuels blocs markdown
  raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  // isole le premier objet JSON
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1) raw = raw.slice(start, end + 1);

  try {
    const parsed = JSON.parse(raw);
    const result = generatedRecipesSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data.recipes;
  } catch {
    return null;
  }
}

async function callOllama(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: "json",
        think: false, // désactive le mode raisonnement (modèles type qwen3) -> plus rapide
      }),
      signal: controller.signal,
    });
    const data = await res.json();
    return data.response ?? "";
  } finally {
    clearTimeout(timeout);
  }
}

// Nettoie les unités et écarte les quantités aberrantes
function sanitize(recipes: GeneratedRecipe[]): GeneratedRecipe[] {
  return recipes
    .map((r) => ({
      ...r,
      ingredients: r.ingredients
        .map((ing) => ({ ...ing, unit: mapUnit(ing.unit) }))
        .filter((ing) => ing.quantity > 0 && ing.quantity <= 10000),
    }))
    .filter((r) => r.ingredients.length > 0);
}

// Génère des recettes via Ollama. Renvoie [] en cas d'échec (le caller retombe sur les recettes seedées).
export async function generateRecipes(
  ingredients: PromptIngredient[]
): Promise<GeneratedRecipe[]> {
  if (ingredients.length === 0) return [];
  const prompt = buildPrompt(ingredients);

  // 1 tentative + 2 retries en cas de JSON invalide.
  // En cas de timeout réseau, on arrête tout de suite (retenter ne ferait qu'empiler).
  for (let attempt = 0; attempt < 3; attempt++) {
    let text: string;
    try {
      text = await callOllama(prompt);
    } catch {
      return []; // timeout / erreur -> fallback immédiat
    }
    const recipes = parseRecipes(text);
    if (recipes) {
      const clean = sanitize(recipes);
      if (clean.length > 0) return clean;
    }
    // JSON invalide -> on retente
  }
  return [];
}
