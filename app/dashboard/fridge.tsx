"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UNITS } from "@/lib/validations";

type Ingredient = {
  id: string;
  rawName: string;
  quantity: number;
  unit: string;
  expiryDate: string;
};

// Statut + couleurs selon les jours restants avant péremption
function getStatus(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(expiryDate);
  d.setHours(0, 0, 0, 0);
  const days = Math.round((d.getTime() - today.getTime()) / 86400000);

  if (days < 0)
    return { label: "Périmé", badge: "bg-gray-100 text-gray-500", dot: "bg-gray-400", expired: true };
  if (days < 2)
    return { label: "Urgent", badge: "bg-red-100 text-red-700", dot: "bg-red-500", expired: false };
  if (days <= 5)
    return { label: "Bientôt", badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500", expired: false };
  return { label: "Frais", badge: "bg-green-100 text-green-700", dot: "bg-green-600", expired: false };
}

export function Fridge() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [rawName, setRawName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [expiryDate, setExpiryDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/ingredients");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setRawName("");
    setQuantity("");
    setUnit("pcs");
    setExpiryDate("");
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const url = editingId ? `/api/ingredients/${editingId}` : "/api/ingredients";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawName, quantity, unit, expiryDate }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Une erreur est survenue");
      return;
    }

    resetForm();
    load();
  }

  function handleEdit(item: Ingredient) {
    setEditingId(item.id);
    setRawName(item.rawName);
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setExpiryDate(new Date(item.expiryDate).toISOString().slice(0, 10));
    setError("");
  }

  async function handleDelete(id: string) {
    await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    load();
  }

  const urgentCount = items.filter((i) => !getStatus(i.expiryDate).expired && getStatus(i.expiryDate).label === "Urgent").length;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
      {/* Formulaire */}
      <Card className="h-fit md:sticky md:top-20">
        <CardHeader>
          <CardTitle className="text-base">
            {editingId ? "Modifier l'ingrédient" : "Ajouter un ingrédient"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rawName">Ingrédient</Label>
              <Input
                id="rawName"
                value={rawName}
                onChange={(e) => setRawName(e.target.value)}
                placeholder="ex : tomates, poulet…"
                required
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Date de péremption</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Enregistrer" : "Ajouter"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Liste */}
      <div>
        <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {items.length} ingrédient{items.length > 1 ? "s" : ""}
          </span>
          {urgentCount > 0 && (
            <span className="font-medium text-red-600">
              {urgentCount} à consommer vite
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ton frigo est vide. Ajoute un premier ingrédient ! 🥕
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const status = getStatus(item.expiryDate);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.dot}`} />
                    <div className="min-w-0">
                      <p className={`truncate font-medium ${status.expired ? "text-gray-400 line-through" : ""}`}>
                        {item.rawName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit} ·{" "}
                        {new Date(item.expiryDate).toLocaleDateString("fr-BE")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.badge}`}>
                      {status.label}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      ✏️
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                      🗑️
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
