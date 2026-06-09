import { z } from "zod";

// Validation de l'inscription / connexion
export const userRegistrationSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type RegisterInput = z.infer<typeof userRegistrationSchema>;

// Unités autorisées (aligné avec l'enum Prisma)
export const UNITS = ["g", "kg", "ml", "L", "pcs", "tbsp", "tsp"] as const;

// Validation d'un ingrédient (ajout et modification)
export const ingredientSchema = z.object({
  rawName: z
    .string()
    .min(1, "Le nom de l'ingrédient est requis")
    .max(100),
  quantity: z.coerce
    .number()
    .positive("La quantité doit être un nombre positif")
    .max(9999),
  unit: z.enum(UNITS),
  expiryDate: z.coerce.date().refine((d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }, "La date de péremption ne peut pas être dans le passé"),
});

export type IngredientInput = z.infer<typeof ingredientSchema>;

// Validation d'une recette générée par Ollama
export const generatedRecipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  steps: z.array(z.string().min(1)).min(1),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.coerce.number().positive(),
        unit: z.string().min(1),
      })
    )
    .min(1),
});

export const generatedRecipesSchema = z.object({
  recipes: z.array(generatedRecipeSchema).min(1),
});

export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>;
