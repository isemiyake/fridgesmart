"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
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
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState("");

  async function load() {
    const res = await fetch("/api/recipes");
    if (res.ok) setRecipes(await res.json());
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setGenMessage("");
    try {
      const res = await fetch("/api/recipes/generate", { method: "POST" });
      if (res.status === 429) {
        setGenMessage("Patiente un instant avant de relancer une génération.");
        return;
      }
      const data = await res.json();
      if (data.created > 0) {
        setGenMessage(`${data.created} nouvelle(s) recette(s) générée(s) !`);
      } else {
        setGenMessage(
          "Aucune nouvelle recette cette fois. Réessaie, ou ajoute des ingrédients."
        );
      }
      await load();
    } catch {
      setGenMessage("La génération a échoué. Réessaie.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recettes suggérées</h1>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Mon frigo
        </Link>
      </div>

      <div className="mb-6 space-y-2">
        <Button onClick={handleGenerate} disabled={generating} className="w-full">
          {generating
            ? "⏳ Génération en cours… (1 à 2 min)"
            : "✨ Générer mes recettes anti-gaspillage"}
        </Button>
        {generating && (
          <p className="text-center text-sm text-muted-foreground">
            L'IA cuisine à partir de ton frigo, patiente un instant…
          </p>
        )}
        {genMessage && !generating && (
          <p className="text-center text-sm text-muted-foreground">{genMessage}</p>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Chargement…</p>}

      {!loading && recipes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucune recette à suggérer. Ajoute des ingrédients dans ton frigo, puis
          génère tes recettes.
        </p>
      )}

      <div className="space-y-4">
        {recipes.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>
                  <Link href={`/recipes/${r.id}`} className="hover:underline">
                    {r.title}
                  </Link>
                </CardTitle>
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
