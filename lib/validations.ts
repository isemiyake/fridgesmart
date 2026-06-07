import { z } from "zod";

// Validation de l'inscription / connexion
export const registerSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
