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

// Statut + couleur selon les jours restants avant péremption
function getStatus(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(expiryDate);
  d.setHours(0, 0, 0, 0);
  const days = Math.round((d.getTime() - today.getTime()) / 86400000);

  if (days < 0) return { label: "Périmé", dot: "bg-gray-400", expired: true };
  if (days < 2) return { label: "Urgent", dot: "bg-red-500", expired: false };
  if (days <= 5) return { label: "Bientôt", dot: "bg-orange-500", expired: false };
  return { label: "Frais", dot: "bg-green-600", expired: false };
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

    const url = editingId
      ? `/api/ingredients/${editingId}`
      : "/api/ingredients";
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
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
                placeholder="ex: tomates"
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
              <Button type="submit">
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

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Ton frigo est vide. Ajoute un ingrédient ci-dessus.
          </p>
        )}
        {items.map((item) => {
          const status = getStatus(item.expiryDate);
          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${status.dot}`} />
                <div>
                  <p
                    className={`font-medium ${
                      status.expired ? "text-gray-400 line-through" : ""
                    }`}
                  >
                    {item.rawName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit} ·{" "}
                    {new Date(item.expiryDate).toLocaleDateString("fr-BE")} ·{" "}
                    {status.label}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
