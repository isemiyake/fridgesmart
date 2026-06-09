"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
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
  if (c === "réalisable") return "bg-green-100 text-green-700";
  if (c === "presque réalisable") return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-600";
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

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette recette ? Elle ne réapparaîtra plus.")) return;
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    load();
  }

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
      setGenMessage(
        data.created > 0
          ? `${data.created} nouvelle(s) recette(s) générée(s) !`
          : "Aucune nouvelle recette cette fois. Réessaie, ou ajoute des ingrédients."
      );
      await load();
    } catch {
      setGenMessage("La génération a échoué. Réessaie.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">Recettes suggérées</h1>
        <p className="mb-6 text-muted-foreground">
          Classées selon ce qui périme dans ton frigo.
        </p>

        <div className="mb-6 space-y-2">
          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating
              ? "⏳ Génération en cours… (1 à 2 min)"
              : "✨ Générer mes recettes anti-gaspillage"}
          </Button>
          {generating && (
            <p className="text-center text-sm text-muted-foreground">
              L&apos;IA cuisine à partir de ton frigo, patiente un instant…
            </p>
          )}
          {genMessage && !generating && (
            <p className="text-center text-sm text-muted-foreground">{genMessage}</p>
          )}
        </div>

        {loading && <p className="text-sm text-muted-foreground">Chargement…</p>}

        {!loading && recipes.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Aucune recette à suggérer. Ajoute des ingrédients dans ton frigo, puis
            génère tes recettes.
          </div>
        )}

        <div className="space-y-4">
          {recipes.map((r) => (
            <Card key={r.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">
                    <Link href={`/recipes/${r.id}`} className="hover:underline">
                      {r.title}
                    </Link>
                  </CardTitle>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${classificationColor(
                      r.classification
                    )}`}
                  >
                    {r.classification}
                  </span>
                </div>
                <CardDescription>{r.message}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                <div>
                  <span className="font-medium text-green-700">Tu as : </span>
                  {r.available.map((a) => a.name).join(", ") || "—"}
                </div>
                {r.needed.length > 0 && (
                  <div>
                    <span className="font-medium text-orange-700">Il te manque : </span>
                    {r.needed.map((n) => n.name).join(", ")}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/recipes/${r.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Voir la recette →
                  </Link>
                  <button
                    onClick={() => handleDelete(r.id)}
                    title="Ne plus proposer cette recette"
                    className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    👎
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
