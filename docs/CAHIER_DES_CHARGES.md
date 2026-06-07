# FridgeSmart — Cahier des Charges

**Application de gestion intelligente du réfrigérateur, recommandation de recettes IA anti-gaspillage & gamification**

Projet étudiant · Développement Web · Projet individuel · MVP+ — 6 semaines · TFE

🔗 **Application en ligne : https://fridgesmart-psi.vercel.app**
📦 **Dépôt : https://github.com/isemiyake/fridgesmart**

---

## 1. Présentation du projet et contexte

FridgeSmart est une application web permettant de gérer les aliments présents dans son réfrigérateur virtuel, de suivre leurs dates de péremption et de recevoir des recommandations de recettes générées par intelligence artificielle locale (Ollama), dans une logique de réduction du gaspillage alimentaire. L'application intègre un système de gamification par XP/niveaux, un tableau de bord d'impact CO2 et une expérience complète de cuisine (détail de recette, suivi de réalisation, retrait automatique des ingrédients).

### 1.1 Contexte
Le gaspillage alimentaire représente un enjeu environnemental et économique majeur dans les foyers. Une part significative des aliments est jetée faute de suivi des produits disponibles. FridgeSmart répond à ce manque en combinant gestion intelligente, génération de recettes par IA locale et mécanique d'engagement gamifiée.

### 1.2 Périmètre
| Élément | Détail |
|---|---|
| Portage | Application web responsive (mobile-first) |
| Développeur | Projet individuel solo |
| Durée | 6 semaines (Projet + TFE) |
| Stack principale | Next.js 14, NextAuth v4, Prisma, PostgreSQL, Zod, Vitest, Tailwind, shadcn/ui |
| Stack IA | Ollama (llama3.2) — déploiement local, aucune donnée envoyée à un tiers |
| API externe | TheMealDB — onglet Découvrir (SHOULD) |

---

## 2. Problématique utilisateur·rice

| Problème | Impact | Solution FridgeSmart |
|---|---|---|
| Méconnaissance des produits disponibles | Achats en double, produits oubliés | Réfrigérateur virtuel avec liste claire |
| Pas de suivi des dates de péremption | Aliments périmés non détectés | Code couleur + tri par urgence |
| Recettes déconnectées du stock réel | Ingrédients achetés inutilement | Recommandation basée sur le frigo |
| Saisie libre mal interprétée | Ingrédients non reconnus | IA Ollama — compréhension sémantique |
| Aucun incitatif à agir | Gaspillage non conscientisé | Système XP + indicateur CO2 économisé |
| Absence d'explication des suggestions | Perte de confiance | Messages d'explication contextuels |

---

## 3. Proposition de valeur et différenciation

- **Génération IA locale (Ollama)** — recettes générées par un LLM local selon les ingrédients réels et leur urgence. Aucune donnée envoyée à un tiers.
- **Saisie libre intelligente** — l'utilisateur saisit librement, Ollama normalise.
- **Recommandation contextualisée** — score multicritère pondéré (urgence 60%, couverture 30%, CO2 10%).
- **Transparence algorithmique** — message d'explication + liste des ingrédients nécessaires.
- **Impact CO2 mesurable** — compteur de CO2 économisé par recette réalisée.
- **Gamification anti-gaspillage** — XP et niveaux proportionnels au score de la recette.

---

## 4. Public cible et personas

**Persona principal — Camille, 26 ans.** Étudiant·e en appartement, cuisine seul·e 4 à 5 fois par semaine, jette régulièrement des légumes oubliés, veut réduire ses dépenses et limiter le gaspillage. Sensible à la gamification, n'aime pas saisir beaucoup d'informations.

**Persona secondaire — Marc, 38 ans.** Parent de famille, planifie les repas de la semaine selon les aliments à consommer en priorité, sensible à l'argument CO2.

---

## 5. Backlog MoSCoW

### MUST (obligatoires)
- Inscription et connexion sécurisée (NextAuth v4)
- Suppression de compte avec purge complète des données (cascade Prisma)
- CRUD complet des ingrédients
- Champ date de péremption obligatoire par ingrédient
- Saisie libre des ingrédients — normalisation sémantique
- Visualisation du réfrigérateur avec code couleur (vert / orange / rouge / périmé)
- Tri des ingrédients par date de péremption croissante
- Génération de 5 recettes par Ollama avec debounce 60s
- Stockage des recettes générées en base avec cache
- Masquage/réaffichage automatique des recettes selon le frigo
- Algorithme de score multicritère v3.0
- Affichage des recettes avec message d'explication et classification
- Affichage des ingrédients nécessaires
- Page détail recette avec ingrédients, quantités et étapes
- Bouton « Recette terminée » — retrait automatique des ingrédients
- Validation des données avec Zod
- Tests unitaires sur le score et les endpoints critiques

### SHOULD (TFE prioritaires)
- Indicateur CO2 économisé par recette réalisée
- Tableau de bord d'impact personnel (CO2 cumulé, recettes, aliments sauvés)
- Système XP et niveaux (5 niveaux : Débutant → Héros Vert)
- Historique des recettes réalisées
- Onglet Découvrir — TheMealDB
- Consommation partielle
- Notifications visuelles péremption
- Email de rappel J-1 via Resend (cron Vercel)

### COULD (évolutions futures)
- Badges et achievements, liste de courses auto, scanner code-barres, multi-réfrigérateurs, PWA, partage de recettes

---

## 6. Spécifications fonctionnelles

### 6.1 Authentification
| Action | Comportement | Contrainte |
|---|---|---|
| Inscription | email + mot de passe, unicité email | mot de passe ≥ 8 caractères, hashé bcrypt |
| Connexion | NextAuth v4 credentials, session JWT | — |
| Suppression | confirmation explicite, purge cascade | action irréversible |

### 6.2 Gestion des ingrédients
Saisie libre normalisée. Date de péremption obligatoire (≥ aujourd'hui), quantité > 0. Modification, suppression, fusion de doublons (même ingrédient normalisé + même unité).

### 6.3 Code couleur
| Statut | Condition | Couleur |
|---|---|---|
| Frais | > 5 jours | Vert |
| Attention | 2 à 5 jours | Orange |
| Urgent | < 2 jours | Rouge |
| Périmé | date dépassée | Gris barré (exclu du score) |

### 6.4 Recommandation
Recettes classées par score décroissant, avec message d'explication, classification (réalisable / presque réalisable / nécessite des achats) et liste des ingrédients nécessaires.

### 6.5 Génération IA (Ollama)
Ollama (llama3.2) tourne localement. Debounce 60s après le dernier ajout, rate limit 1 génération/60s par utilisateur, timeout configurable, validation Zod + retry, fallback silencieux vers les recettes seedées.

### 6.6 Détail & complétion
Page détail (étapes, ingrédients, quantités, score, XP/CO2 estimés). Bouton « Recette terminée » : retrait des ingrédients, crédit XP + CO2, historique, protection d'idempotence (1 fois/jour).

### 6.7 Système XP et niveaux
`XP gagné = max(score × 3, 5)`. Niveaux : 1 Débutant (0–100), 2 Consciencieux (101–300), 3 Écolo (301–600), 4 Expert anti-gaspi (601–1000), 5 Héros Vert (1000+).

---

## 7. Algorithme de score multicritère (v3.0)

`Score = 0.6 × UrgenceScore + 0.3 × CouvertureScore + 0.1 × ImpactCO2Score − Pénalités`

- **UrgenceScore** (par ingrédient) : 0j=10, 1j=8, 2j=6, 3–5j=3, >5j=1, périmé=ignoré.
- **CouvertureScore** = (ingrédients présents / total requis) × 10.
- **ImpactCO2Score** = Σ co2SavedGrams des ingrédients utilisés / 100.
- **Pénalités** = −1.0 par ingrédient absent, −0.5 par quantité insuffisante.

Départages : score, puis nb d'ingrédients urgents, puis CO2 potentiel, puis ordre alphabétique. Conversions d'unités kg↔g et L↔ml gérées.

---

## 8. Modèle de données

9 entités (Prisma / PostgreSQL) : **User**, **NormalizedIngredient** (avec `co2SavedGrams`), **IngredientAlias**, **UserIngredient**, **Recipe** (`isAIGenerated`), **RecipeIngredient**, **RecipeStep**, **CookedHistory**, **UserXP**.

Enum `UnitEnum` : g, kg, ml, L, pcs, tbsp, tsp.
Suppressions en cascade : `UserIngredient`, `CookedHistory`, `UserXP` (RGPD).
Schéma complet : voir [`prisma/schema.prisma`](../prisma/schema.prisma).

---

## 9. Architecture technique

Next.js 14 (App Router) full-stack · NextAuth v4 (JWT) · Prisma + PostgreSQL (Supabase EU) · Zod · Tailwind + shadcn/ui · Vitest · Ollama (local) · TypeScript.

L'appel Ollama est synchrone (le serverless Vercel ne survivrait pas à un traitement en arrière-plan). Le client IA est isolé dans `lib/ollama.ts` — seul fichier à modifier pour basculer vers un LLM externe (OpenAI, Anthropic, Mistral) en production.

---

## 10. Endpoints API

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Non | Création de compte |
| POST | /api/auth/[...nextauth] | Non | Connexion / déconnexion |
| GET / POST | /api/ingredients | Oui | Liste / ajout d'ingrédients |
| PUT / DELETE | /api/ingredients/[id] | Oui | Modification / suppression |
| GET | /api/recipes | Oui | Recettes classées par score |
| POST | /api/recipes/generate | Oui | Génération Ollama |
| GET | /api/recipes/[id] | Oui | Détail d'une recette |
| POST | /api/recipes/[id]/complete | Oui | Terminer une recette (XP + CO2) |
| DELETE | /api/user | Oui | Suppression du compte (cascade) |

---

## 11. Validation et gestion des erreurs

Validation Zod : `rawName` (1–100), `quantity` (> 0, ≤ 9999), `unit` (enum), `expiryDate` (≥ aujourd'hui), `email` valide, `password` ≥ 8.
Codes : 200, 201, 204, 400 (Zod), 401, 403, 404, 429 (rate limit), 500.

---

## 12. Tests et qualité

Tests unitaires (Vitest) : score multicritère, CO2, XP, niveaux, conversion d'unités, recommandation, validation Zod, parser Ollama. **46 tests verts.**

---

## 13. Versionning et déploiement

**Git** : `main` (production), `develop` (intégration), `feature/xxx` (fonctionnalités), `fix/xxx` (corrections). Merge requests vers `develop`, puis `develop` → `main`.

**Déploiement** : Vercel (https://fridgesmart-psi.vercel.app), base PostgreSQL Supabase (région UE — Francfort). Ollama tourne en local (non déployé, documenté). Variables : `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OLLAMA_HOST`, `OLLAMA_MODEL`.

---

## 14. Aspects légaux et conformité RGPD

Application soumise au RGPD (Règlement UE 2016/679).
- **Données minimales** : email, mot de passe (hashé bcrypt), ingrédients, historique. Aucun tracking.
- **IA locale** : Ollama en local, aucune donnée alimentaire transmise à un tiers.
- **Droit à l'effacement** : suppression de compte avec purge complète en cascade, confirmation explicite.
- **Droit d'accès** : consultation et suppression des données via l'interface.
- **Consentement cookies** : cookies de session NextAuth uniquement, pas de cookie tiers.
- **Consentement email** : opt-in explicite avant tout rappel (SHOULD).
- **Hébergement** : données stockées dans l'UE (Supabase Francfort).
- **Mention légale** : FridgeSmart est un outil de suggestion et de sensibilisation. Les recommandations IA sont fournies à titre indicatif et ne remplacent pas le jugement de l'utilisateur·rice concernant la sécurité alimentaire. L'indicateur CO2 (estimations ADEME / Our World in Data) est un outil de sensibilisation, non une comptabilité carbone certifiée.

---

## 15. Planning de développement (6 semaines)

| Semaine | Contenu |
|---|---|
| 1 | Setup, authentification, modèle de données |
| 2 | CRUD ingrédients + intégration Ollama |
| 3 | Score multicritère + recettes + détail |
| 4 | Complétion + impact + tests |
| 5 | TFE — onglet Découvrir + polish |
| 6 | Déploiement + livrable TFE |

---

## 16. Critères de réussite

Application fonctionnelle en ligne, génération IA opérationnelle (avec fallback), recommandations pertinentes, ingrédients nécessaires affichés, détail recette complet, flux « Recette terminée », données sécurisées, tests passants, explications lisibles.

---

## 17. Conclusion

FridgeSmart présente un périmètre MVP+ réaliste pour un développeur solo sur 6 semaines. Sa différenciation repose sur la génération IA locale (confidentialité RGPD), la recommandation basée sur le stock réel via un score multicritère, la transparence des suggestions et la mesure d'impact CO2. Le système de gamification et le tableau de bord d'impact constituent les apports TFE. L'isolement du client IA dans `lib/ollama.ts` démontre l'évolutivité du système au-delà du périmètre TFE.
