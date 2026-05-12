"use client";

import { useState } from "react";
import { Plus, Loader2, Heart } from "lucide-react";
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
  sexe: string;
  race: string;
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
    notes: "",
  });

  const males = rabbits.filter((r) => r.sexe === "male");
  const femelles = rabbits.filter((r) => r.sexe === "femelle");

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
      setForm({ pereId: "", mereId: "", dateAccouplement: new Date().toISOString().split("T")[0], notes: "" });
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
              {males.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.identifiant}) — {r.race}
                </option>
              ))}
            </Select>
            {males.length === 0 && (
              <p className="text-xs text-amber-600">Aucun mâle enregistré. Ajoutez d'abord un lapin mâle.</p>
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
              <p className="text-xs text-amber-600">Aucune femelle enregistrée. Ajoutez d'abord une lapine.</p>
            )}
          </div>

          {/* Date accouplement */}
          <div className="space-y-1.5">
            <Label htmlFor="dateAccouplement">Date d'accouplement *</Label>
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
