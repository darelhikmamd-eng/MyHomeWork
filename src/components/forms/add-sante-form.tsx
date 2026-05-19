"use client";

import { useState } from "react";
import { Plus, Loader2, Syringe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Rabbit {
  id: string;
  name: string;
  identifiant: string;
}

interface AddSanteFormProps {
  rabbits: Rabbit[];
  onSuccess: () => void;
}

const typeLabels = {
  vaccin: "💉 Vaccin",
  traitement: "💊 Traitement",
  observation: "👁 Observation",
  veterinaire: "🩺 Vétérinaire",
};

export function AddSanteForm({ rabbits, onSuccess }: AddSanteFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    rabbitId: "",
    type: "vaccin",
    description: "",
    date: new Date().toISOString().split("T")[0],
    prochainRappel: "",
    delaiAttenteJours: "",
    veterinaire: "",
    cout: "",
    notes: "",
  });

  const field = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");

      setOpen(false);
      setForm({ rabbitId: "", type: "vaccin", description: "", date: new Date().toISOString().split("T")[0], prochainRappel: "", delaiAttenteJours: "", veterinaire: "", cout: "", notes: "" });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
          Ajouter un soin
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-forest-600" />
            Nouveau soin
          </DialogTitle>
          <DialogDescription>
            Enregistrez un vaccin, traitement, observation ou visite vétérinaire.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Lapin */}
          <div className="space-y-1.5">
            <Label htmlFor="rabbitId">Lapin *</Label>
            <Select id="rabbitId" value={form.rabbitId} onChange={field("rabbitId")} required>
              <option value="">-- Choisir un lapin --</option>
              {rabbits.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.identifiant})
                </option>
              ))}
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label htmlFor="type">Type de soin *</Label>
            <Select id="type" value={form.type} onChange={field("type")}>
              {Object.entries(typeLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Input id="description" placeholder="Ex : Vaccin Myxomatose + VHD" value={form.description} onChange={field("description")} required />
          </div>

          {/* Date + Rappel */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date du soin *</Label>
              <Input id="date" type="date" value={form.date} onChange={field("date")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prochainRappel">Prochain rappel</Label>
              <Input id="prochainRappel" type="date" value={form.prochainRappel} onChange={field("prochainRappel")} />
            </div>
          </div>

          {/* Vétérinaire + Coût (si pertinent) */}
          {(form.type === "veterinaire" || form.type === "traitement") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="veterinaire">Vétérinaire</Label>
                <Input id="veterinaire" placeholder="Dr. Dupont" value={form.veterinaire} onChange={field("veterinaire")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cout">Coût (FCFA)</Label>
                <Input id="cout" type="number" step="0.01" placeholder="Ex : 35.50" value={form.cout} onChange={field("cout")} />
              </div>
            </div>
          )}

          {/* Délai d'attente — uniquement pour les traitements */}
          {form.type === "traitement" && (
            <div className="space-y-1.5">
              <Label htmlFor="delaiAttenteJours" className="flex items-center gap-1.5">
                ⛔ Délai d&apos;attente (jours)
                <span className="text-xs text-muted-foreground font-normal">(interdit de vente/abattage pendant ce délai)</span>
              </Label>
              <Input
                id="delaiAttenteJours"
                type="number"
                min="0"
                placeholder="Ex : 28 jours"
                value={form.delaiAttenteJours}
                onChange={field("delaiAttenteJours")}
              />
              {form.delaiAttenteJours && Number(form.delaiAttenteJours) > 0 && form.date && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  ⚠️ Fin du délai : {new Date(new Date(form.date).getTime() + Number(form.delaiAttenteJours) * 86400000).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes supplémentaires</Label>
            <Textarea id="notes" placeholder="Remarques, doses, réactions..." value={form.notes} onChange={field("notes")} />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-earth-100 rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 hover:bg-forest-700 text-white rounded-lg transition-colors disabled:opacity-60">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
