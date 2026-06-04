# FridgeSmart

Application web de gestion intelligente du réfrigérateur.
Projet individuel (TFE) - Développement Web.

## But du projet

Gérer les aliments de son frigo, suivre les dates de péremption et recevoir
des recettes générées par une IA locale (Ollama) pour réduire le gaspillage.
L'app inclut aussi un système de points (XP) et un suivi du CO2 économisé.

## Stack technique

- Next.js 14 (App Router) + TypeScript
- NextAuth v4 (authentification)
- Prisma + PostgreSQL
- Zod (validation)
- Tailwind + shadcn/ui
- Vitest (tests)
- Ollama (llama3.2) pour l'IA locale

## Installation (à compléter au fur et à mesure)

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Organisation du travail

Le projet suit une logique agile (SCRUM) :
- Les fonctionnalités sont découpées en **User Stories** (issues avec le label `User Story`)
- Chaque User Story est découpée en **issues techniques** (sous-issues liées)
- Les User Stories sont regroupées en **Milestones** (sprints)

### Branches

- `main` : code stable
- `develop` : branche d'intégration
- `feature/xxx` : une branche par fonctionnalité, merge request vers `develop`
