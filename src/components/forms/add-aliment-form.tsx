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

interface Props {
  onSuccess: () => void;
}

export function AddAlimentForm({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "",
    type: "granules",
    unite: "kg",
    stockActuel: "",
    stockMin: "5",
    prixUnitaire: "",
    fournisseur: "",
    notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom || !form.type) {
      setError("Nom et type sont obligatoires.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/aliments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Erreur lors de la création.");
        return;
      }
      setOpen(false);
      setForm({ nom: "", type: "granules", unite: "kg", stockActuel: "", stockMin: "5", prixUnitaire: "", fournisseur: "", notes: "" });
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
        <button className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
          Ajouter un aliment
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel aliment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" placeholder="Ex: Foin de luzerne" value={form.nom} onChange={(e) => set("nom", e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">Type *</Label>
              <Select id="type" value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="foin">Foin</option>
                <option value="granules">Granulés</option>
                <option value="legumes">Légumes / Verdure</option>
                <option value="supplement">Supplément</option>
                <option value="autre">Autre</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unite">Unité</Label>
              <Select id="unite" value={form.unite} onChange={(e) => set("unite", e.target.value)}>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">Litres</option>
                <option value="botte">Bottes</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stockActuel">Stock actuel</Label>
              <Input id="stockActuel" type="number" step="0.1" min="0" placeholder="0" value={form.stockActuel} onChange={(e) => set("stockActuel", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stockMin">Seuil d&apos;alerte</Label>
              <Input id="stockMin" type="number" step="0.1" min="0" placeholder="5" value={form.stockMin} onChange={(e) => set("stockMin", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prixUnitaire">Prix unitaire (€)</Label>
              <Input id="prixUnitaire" type="number" step="0.01" min="0" placeholder="0.00" value={form.prixUnitaire} onChange={(e) => set("prixUnitaire", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fournisseur">Fournisseur</Label>
              <Input id="fournisseur" placeholder="Nom du fournisseur" value={form.fournisseur} onChange={(e) => set("fournisseur", e.target.value)} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Informations complémentaires..." value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium border border-earth-200 rounded-lg hover:bg-earth-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
