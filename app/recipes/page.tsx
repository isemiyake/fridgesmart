"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ScoredRecipe = {
  id: string;
  title: string;
  score: number;
  classification: string;
  message: string;
  available: { name: string; daysLeft: number }[];
  needed: { name: string; reason: string }[];
};

function classificationColor(c: string) {
  if (c === "réalisable") return "text-green-700 bg-green-100";
  if (c === "presque réalisable") return "text-orange-700 bg-orange-100";
  return "text-gray-700 bg-gray-100";
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<ScoredRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recipes")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recettes suggérées</h1>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Mon frigo
        </Link>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Chargement…</p>}

      {!loading && recipes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucune recette à suggérer. Ajoute des ingrédients dans ton frigo.
        </p>
      )}

      <div className="space-y-4">
        {recipes.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{r.title}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  score {r.score}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${classificationColor(
                    r.classification
                  )}`}
                >
                  {r.classification}
                </span>
              </div>
              <CardDescription>{r.message}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Dans ton frigo : </span>
                {r.available.map((a) => a.name).join(", ") || "—"}
              </div>
              {r.needed.length > 0 && (
                <div>
                  <span className="font-medium">Nécessaire : </span>
                  {r.needed.map((n) => `${n.name} (${n.reason})`).join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
