"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Impact = {
  co2Total: number;
  recipesCount: number;
  ingredientsSaved: number;
  xp: number;
  level: number;
  history: { title: string; co2Saved: number; xpEarned: number; cookedAt: string }[];
};

const LEVELS = [
  { name: "Débutant", min: 0, max: 100 },
  { name: "Consciencieux", min: 101, max: 300 },
  { name: "Écolo", min: 301, max: 600 },
  { name: "Expert anti-gaspi", min: 601, max: 1000 },
  { name: "Héros Vert", min: 1001, max: Infinity },
];

export default function ImpactPage() {
  const [data, setData] = useState<Impact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/impact")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const level = data?.level ?? 1;
  const info = LEVELS[level - 1] ?? LEVELS[0];
  const xp = data?.xp ?? 0;
  const progress =
    info.max === Infinity
      ? 100
      : Math.min(100, Math.round(((xp - info.min) / (info.max - info.min)) * 100));

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">Mon impact</h1>
        <p className="mb-6 text-muted-foreground">
          Suis tes économies de CO2 et ta progression anti-gaspillage.
        </p>

        {loading && <p className="text-sm text-muted-foreground">Chargement…</p>}

        {data && (
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {(data.co2Total / 1000).toFixed(2)}
                    <span className="text-base font-medium"> kg</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">CO2 économisé</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">{data.recipesCount}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Recettes réalisées</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">{data.ingredientsSaved}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Aliments sauvés</p>
                </CardContent>
              </Card>
            </div>

            {/* Niveau / XP */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Niveau {level} — {info.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                  <span>{xp} XP</span>
                  {info.max !== Infinity && <span>Prochain niveau : {info.max + 1} XP</span>}
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Historique */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dernières recettes réalisées</CardTitle>
              </CardHeader>
              <CardContent>
                {data.history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucune recette réalisée pour le moment. Cuisine une recette
                    pour gagner des points !
                  </p>
                ) : (
                  <div className="space-y-2 text-sm">
                    {data.history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div>
                          <p className="font-medium">{h.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(h.cookedAt).toLocaleDateString("fr-BE")}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-green-600">{h.co2Saved} g CO2</p>
                          <p className="text-muted-foreground">+{h.xpEarned} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
