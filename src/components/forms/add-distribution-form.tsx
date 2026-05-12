"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Aliment {
  id: string;
  nom: string;
  type: string;
  unite: string;
  stockActuel: number;
}

interface Props {
  aliments: Aliment[];
  onSuccess: () => void;
}

const typeIcon: Record<string, string> = {
  foin: "🌾",
  granules: "🟤",
  legumes: "🥬",
  supplement: "💊",
  autre: "📦",
};

export function AddDistributionForm({ aliments, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    alimentId: "",
    quantite: "",
    date: today,
    cageNumero: "",
    notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const selectedAliment = aliments.find((a) => a.id === form.alimentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.alimentId || !form.quantite) {
      setError("Aliment et quantité sont obligatoires.");
      return;
    }
    if (selectedAliment && parseFloat(form.quantite) > selectedAliment.stockActuel) {
      setError(`Stock insuffisant (${selectedAliment.stockActuel} ${selectedAliment.unite} disponibles).`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/distributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Erreur lors de l'enregistrement.");
        return;
      }
      setOpen(false);
      setForm({ alimentId: "", quantite: "", date: today, cageNumero: "", notes: "" });
      onSuccess();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
          Enregistrer une distribution
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle distribution</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="space-y-1.5">
            <Label htmlFor="alimentId">Aliment *</Label>
            <Select id="alimentId" value={form.alimentId} onChange={(e) => set("alimentId", e.target.value)} required>
              <option value="">Sélectionner un aliment</option>
              {aliments.map((a) => (
                <option key={a.id} value={a.id}>
                  {typeIcon[a.type] ?? "📦"} {a.nom} — stock: {a.stockActuel} {a.unite}
                </option>
              ))}
            </Select>
          </div>

          {selectedAliment && (
            <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-2">
              <span>Stock disponible :</span>
              <span className="font-bold">{selectedAliment.stockActuel} {selectedAliment.unite}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantite">Quantité distribuée *</Label>
              <Input
                id="quantite"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="0"
                value={form.quantite}
                onChange={(e) => set("quantite", e.target.value)}
                required
              />
              {selectedAliment && (
                <p className="text-xs text-muted-foreground">Unité : {selectedAliment.unite}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="cageNumero">Cage / Zone (optionnel)</Label>
              <Input id="cageNumero" placeholder="Ex: A1, B3, Toutes" value={form.cageNumero} onChange={(e) => set("cageNumero", e.target.value)} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Observations..." value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium border border-earth-200 rounded-lg hover:bg-earth-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm font-medium bg-forest-600 hover:bg-forest-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
