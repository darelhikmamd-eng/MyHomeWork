"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
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

interface AddRabbitFormProps {
  onSuccess: () => void;
}

async function generateIdentifiant(): Promise<string> {
  try {
    const res = await fetch("/api/rabbits");
    const data = await res.json();
    const count = Array.isArray(data) ? data.length + 1 : 1;
    return `LAP-${String(count).padStart(3, "0")}`;
  } catch {
    return `LAP-${String(Date.now()).slice(-3)}`;
  }
}

export function AddRabbitForm({ onSuccess }: AddRabbitFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    identifiant: "",
    race: "",
    sexe: "femelle",
    dateNaissance: "",
    poids: "",
    couleur: "",
    statut: "actif",
    cageNumero: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      generateIdentifiant().then((id) =>
        setForm((f) => ({ ...f, identifiant: id }))
      );
    }
  }, [open]);

  const field = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rabbits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 409) throw new Error(`❌ L'identifiant "${form.identifiant}" est déjà utilisé. Cliquez sur 🔄 pour en générer un nouveau.`);
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");

      setOpen(false);
      setForm({ name: "", identifiant: "", race: "", sexe: "femelle", dateNaissance: "", poids: "", couleur: "", statut: "actif", cageNumero: "", notes: "" });
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
          Ajouter un lapin
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🐇 Nouveau lapin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nom */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom *</Label>
            <Input id="name" placeholder="Ex : Blanche" value={form.name} onChange={field("name")} required />
          </div>

          {/* Race */}
          <div className="space-y-1.5">
            <Label htmlFor="race">Race *</Label>
            <Select id="race" value={form.race} onChange={field("race")} required>
              <option value="">— Choisir une race —</option>
              <optgroup label="Races à viande">
                <option value="Néo-Zélandais">Néo-Zélandais</option>
                <option value="Californien">Californien</option>
                <option value="Fauve de Bourgogne">Fauve de Bourgogne</option>
                <option value="Géant Blanc de Bouscat">Géant Blanc de Bouscat</option>
                <option value="Géant des Flandres">Géant des Flandres</option>
                <option value="Blanc de Termonde">Blanc de Termonde</option>
                <option value="Argenté de Champagne">Argenté de Champagne</option>
                <option value="Bélier Français">Bélier Français</option>
                <option value="Géant Papillon">Géant Papillon</option>
              </optgroup>
              <optgroup label="Races mixtes">
                <option value="Lapin Commun Local">Lapin Commun Local</option>
                <option value="Croisé Néo-Californien">Croisé Néo-Californien</option>
                <option value="Bouscat × Néo-Zélandais">Bouscat × Néo-Zélandais</option>
              </optgroup>
              <optgroup label="Races légères / ornement">
                <option value="Nain de Hollande">Nain de Hollande</option>
                <option value="Rex">Rex</option>
                <option value="Angora Français">Angora Français</option>
                <option value="Lapin Angora Géant">Lapin Angora Géant</option>
                <option value="Russe (Himalayan)">Russe (Himalayan)</option>
              </optgroup>
              <option value="Autre">Autre / Race non listée</option>
            </Select>
          </div>

          {/* Sexe + Statut */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sexe">Sexe *</Label>
              <Select id="sexe" value={form.sexe} onChange={field("sexe")}>
                <option value="femelle">♀ Femelle</option>
                <option value="male">♂ Mâle</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="statut">Statut</Label>
              <Select id="statut" value={form.statut} onChange={field("statut")}>
                <option value="actif">Actif</option>
                <option value="reproducteur">Reproducteur</option>
                <option value="vendu">Vendu</option>
                <option value="decede">Décédé</option>
              </Select>
            </div>
          </div>

          {/* Date naissance */}
          <div className="space-y-1.5">
            <Label htmlFor="dateNaissance">Date de naissance *</Label>
            <Input id="dateNaissance" type="date" value={form.dateNaissance} onChange={field("dateNaissance")} required />
          </div>

          {/* Poids + Couleur + Cage */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="poids">Poids (kg)</Label>
              <Input id="poids" type="number" step="0.01" placeholder="Ex : 4.2" value={form.poids} onChange={field("poids")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="couleur">Couleur</Label>
              <Input id="couleur" placeholder="Ex : Blanc" value={form.couleur} onChange={field("couleur")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cageNumero">Cage N°</Label>
              <Input id="cageNumero" placeholder="Ex : A1" value={form.cageNumero} onChange={field("cageNumero")} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Observations particulières..." value={form.notes} onChange={field("notes")} />
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
