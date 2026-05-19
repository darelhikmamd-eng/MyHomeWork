"use client";

import { useState } from "react";
import { Plus, Loader2, Heart, AlertTriangle } from "lucide-react";
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

interface ReproductionInfo {
  maxFemelles: number;
  nbFemellesDistinctes: number;
  nbAccouplements: number;
  nbPortees: number;
  quotaAtteint: boolean;
  placesRestantes: number;
}

interface Rabbit {
  id: string;
  name: string;
  identifiant: string;
  sexe: string;
  race: string;
  reproduction?: ReproductionInfo | null;
}

interface AddAccouplementFormProps {
  rabbits: Rabbit[];
  onSuccess: () => void;
}

export function AddAccouplementForm({ rabbits, onSuccess }: AddAccouplementFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    pereId: "",
    mereId: "",
    dateAccouplement: new Date().toISOString().split("T")[0],
    couleurVulve: "",
    notes: "",
  });

  const males = rabbits.filter((r) => r.sexe === "male");
  const femelles = rabbits.filter((r) => r.sexe === "femelle");

  const selectedMale = males.find((m) => m.id === form.pereId);
  const maleQuotaAtteint = selectedMale?.reproduction?.quotaAtteint === true;
  // Si le quota est atteint, on n'autorise que les femelles déjà accouplées à ce mâle.
  // ⚠️ Le serveur valide aussi cette règle (cf. POST /api/accouplements).

  const field = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const dateMiseBas = form.dateAccouplement
    ? new Date(new Date(form.dateAccouplement).getTime() + 31 * 24 * 60 * 60 * 1000)
        .toLocaleDateString("fr-FR")
    : "—";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/accouplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");

      setOpen(false);
      setForm({ pereId: "", mereId: "", dateAccouplement: new Date().toISOString().split("T")[0], couleurVulve: "", notes: "" });
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
          Nouvel accouplement
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Nouvel accouplement
          </DialogTitle>
          <DialogDescription>
            La date de mise-bas sera calculée automatiquement (J+31).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Père */}
          <div className="space-y-1.5">
            <Label htmlFor="pereId">Père (mâle) *</Label>
            <Select id="pereId" value={form.pereId} onChange={field("pereId")} required>
              <option value="">-- Choisir un mâle --</option>
              {males.map((r) => {
                const repro = r.reproduction;
                const quota = repro
                  ? ` — ${repro.nbFemellesDistinctes}/${repro.maxFemelles} femelles${repro.quotaAtteint ? " ⛔ QUOTA ATTEINT" : ""}`
                  : "";
                return (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.identifiant}) — {r.race}{quota}
                  </option>
                );
              })}
            </Select>
            {males.length === 0 && (
              <p className="text-xs text-amber-600">Aucun mâle enregistré. Ajoutez d&apos;abord un lapin mâle.</p>
            )}
            {maleQuotaAtteint && (
              <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                ⚠️ Ce mâle a déjà atteint le quota de {selectedMale?.reproduction?.maxFemelles} femelles distinctes.
                Vous ne pouvez plus l’accoupler qu’avec une femelle déjà enregistrée dans ses portées.
              </p>
            )}
          </div>

          {/* Mère */}
          <div className="space-y-1.5">
            <Label htmlFor="mereId">Mère (femelle) *</Label>
            <Select id="mereId" value={form.mereId} onChange={field("mereId")} required>
              <option value="">-- Choisir une femelle --</option>
              {femelles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.identifiant}) — {r.race}
                </option>
              ))}
            </Select>
            {femelles.length === 0 && (
              <p className="text-xs text-amber-600">Aucune femelle enregistrée. Ajoutez d&apos;abord une lapine.</p>
            )}
          </div>

          {/* Date accouplement */}
          <div className="space-y-1.5">
            <Label htmlFor="dateAccouplement">Date d&apos;accouplement *</Label>
            <Input id="dateAccouplement" type="date" value={form.dateAccouplement} onChange={field("dateAccouplement")} required />
          </div>

          {/* Mise-bas calculée */}
          <div className="flex items-center gap-3 bg-forest-50 border border-forest-200 rounded-lg px-4 py-3">
            <span className="text-2xl">🐣</span>
            <div>
              <p className="text-xs text-forest-700 font-medium">Mise-bas prévue (calculée)</p>
              <p className="text-base font-bold text-forest-800">{dateMiseBas}</p>
            </div>
          </div>

          {/* Couleur de vulve */}
          <div className="space-y-1.5">
            <Label htmlFor="couleurVulve">Couleur de la vulve</Label>
            <Select id="couleurVulve" value={form.couleurVulve} onChange={field("couleurVulve")}>
              <option value="">-- Non renseignée --</option>
              <option value="blanche">⚪ Blanche — faibles chances ⚠️</option>
              <option value="rose">🩷 Rose — réceptivité normale</option>
              <option value="rouge">🔴 Rouge — bonne réceptivité ✓</option>
              <option value="violacee">🟣 Violacée — pic de réceptivité ✓✓</option>
            </Select>
            {form.couleurVulve === "blanche" && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>Vulve blanche : chances de fécondation très faibles. Envisager de reporter la saillie.</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Observations sur l'accouplement..." value={form.notes} onChange={field("notes")} />
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
