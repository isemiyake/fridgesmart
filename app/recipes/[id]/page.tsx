"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type RecipeDetail = {
  id: string;
  title: string;
  description: string | null;
  servings: number;
  steps: { order: number; content: string }[];
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    inFridge: boolean;
    availableQuantity: number;
    availableUnit: string;
    sufficient: boolean;
  }[];
  score: number;
  classification: string;
  message: string;
  estimatedXp: number;
  estimatedCo2: number;
};

export default function RecipeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetch(`/api/recipes/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setRecipe(data);
        setLoading(false);
      });
  }, [params.id]);

  async function handleComplete() {
    setCompleting(true);
    const res = await fetch(`/api/recipes/${params.id}/complete`, {
      method: "POST",
    });
    if (!res.ok) {
      setCompleting(false);
      return;
    }
    const data = await res.json();
    if (data.xpEarned > 0) {
      alert(
        `Bravo ! +${data.xpEarned} XP et ${data.co2Saved} g de CO2 économisés.`
      );
    } else {
      alert("Tu as déjà réalisé cette recette aujourd'hui.");
    }
    router.push("/recipes");
    router.refresh();
  }

  if (loading) {
    return <main className="mx-auto max-w-2xl p-4">Chargement…</main>;
  }
  if (!recipe) {
    return <main className="mx-auto max-w-2xl p-4">Recette introuvable.</main>;
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4">
      <Link href="/recipes" className={buttonVariants({ variant: "outline" })}>
        ← Retour aux recettes
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-muted-foreground">{recipe.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Pour {recipe.servings} personne(s) · score {recipe.score} ·{" "}
          {recipe.classification}
        </p>
        {recipe.message && <p className="mt-2 text-sm">{recipe.message}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingrédients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {recipe.ingredients.map((ing) => (
            <div key={ing.name} className="flex justify-between">
              <span>
                {ing.name} — {ing.quantity} {ing.unit}
              </span>
              <span
                className={
                  ing.inFridge && ing.sufficient
                    ? "text-green-700"
                    : "text-orange-700"
                }
              >
                {ing.inFridge
                  ? ing.sufficient
                    ? "dans ton frigo"
                    : `seulement ${ing.availableQuantity} ${ing.availableUnit}`
                  : "à acheter"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Préparation</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {recipe.steps.map((s) => (
              <li key={s.order}>{s.content}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Si tu réalises cette recette</CardTitle>
          <CardDescription>
            +{recipe.estimatedXp} XP · {recipe.estimatedCo2} g de CO2 économisés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger
              className={buttonVariants()}
              disabled={completing}
            >
              Recette terminée
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Marquer comme réalisée ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Les ingrédients utilisés seront retirés de ton frigo et tu
                  gagneras des points.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleComplete}>
                  Oui, terminé
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </main>
  );
}
