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
import { cn } from "@/lib/utils";

interface Props {
  defaultType?: "depense" | "recette";
  onSuccess: () => void;
}

const categoriesDepense = [
  { value: "alimentation",  label: "🌾 Alimentation" },
  { value: "veterinaire",   label: "💉 Vétérinaire" },
  { value: "equipement",    label: "🔧 Équipement / Matériel" },
  { value: "reproduction",  label: "🐇 Reproduction" },
  { value: "energie",       label: "⚡ Énergie / Eau" },
  { value: "autre",         label: "📦 Autre dépense" },
];

const categoriesRecette = [
  { value: "vente_lapin",   label: "🐇 Vente de lapins vivants" },
  { value: "vente_viande",  label: "🥩 Vente de viande" },
  { value: "vente_fumier",  label: "🌱 Vente de fumier" },
  { value: "subvention",    label: "🏛 Subvention / Aide" },
  { value: "autre",         label: "💶 Autre recette" },
];

export function AddTransactionForm({ defaultType = "depense", onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    type: defaultType,
    categorie: defaultType === "depense" ? "alimentation" : "vente_lapin",
    montant: "",
    date: today,
    description: "",
    notes: "",
  });

  const set = (k: string, v: string) => {
    if (k === "type") {
      const t = v as "depense" | "recette";
      setForm((f) => ({
        ...f,
        type: t,
        categorie: t === "depense" ? "alimentation" : "vente_lapin",
      }));
    } else {
      setForm((f) => ({ ...f, [k]: v }));
    }
  };

  const categories = form.type === "depense" ? categoriesDepense : categoriesRecette;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.montant || parseFloat(form.montant) <= 0) {
      setError("Le montant doit être supérieur à 0.");
      return;
    }
    if (!form.description.trim()) {
      setError("La description est obligatoire.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transactions", {
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
      setForm({ type: defaultType, categorie: defaultType === "depense" ? "alimentation" : "vente_lapin", montant: "", date: today, description: "", notes: "" });
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
          Nouvelle transaction
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Toggle Dépense / Recette */}
          <div className="grid grid-cols-2 gap-2">
            {(["depense", "recette"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("type", t)}
                className={cn(
                  "py-2.5 rounded-lg text-sm font-semibold border transition-colors",
                  form.type === t
                    ? t === "depense"
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-forest-600 text-white border-forest-600"
                    : "bg-white text-muted-foreground border-earth-200 hover:border-earth-400"
                )}
              >
                {t === "depense" ? "💸 Dépense" : "💰 Recette"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="categorie">Catégorie *</Label>
              <Select
                id="categorie"
                value={form.categorie}
                onChange={(e) => set("categorie", e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="montant">Montant (FCFA) *</Label>
              <Input
                id="montant"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.montant}
                onChange={(e) => set("montant", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                required
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder={form.type === "depense" ? "Ex: Achat foin 50 kg" : "Ex: Vente 5 lapins M. Dupont"}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                required
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Informations complémentaires..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium border border-earth-200 rounded-lg hover:bg-earth-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50",
                form.type === "depense"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-forest-600 hover:bg-forest-700"
              )}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
