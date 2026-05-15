"use client";

import { useState, useEffect } from "react";
import { Pencil, Loader2, Trash2 } from "lucide-react";
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

interface RabbitData {
  id: string;
  name: string;
  identifiant: string;
  race: string;
  sexe: string;
  dateNaissance: string | null;
  poids: number | null;
  couleur: string | null;
  statut: string;
  cageNumero: string | null;
  notes: string | null;
}

interface EditRabbitFormProps {
  rabbit: RabbitData;
  onSuccess: () => void;
}

export function EditRabbitForm({ rabbit, onSuccess }: EditRabbitFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
      setForm({
        name: rabbit.name,
        identifiant: rabbit.identifiant,
        race: rabbit.race,
        sexe: rabbit.sexe,
        dateNaissance: rabbit.dateNaissance
          ? new Date(rabbit.dateNaissance).toISOString().split("T")[0]
          : "",
        poids: rabbit.poids?.toString() ?? "",
        couleur: rabbit.couleur ?? "",
        statut: rabbit.statut,
        cageNumero: rabbit.cageNumero ?? "",
        notes: rabbit.notes ?? "",
      });
      setError("");
      setConfirmDelete(false);
    }
  }, [open, rabbit]);

  const field =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rabbits/${rabbit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/rabbits/${rabbit.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-earth-500 hover:text-forest-600 transition-colors shadow-sm border border-earth-100"
          title="Modifier"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>✏️ Modifier — {rabbit.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nom *</Label>
            <Input id="edit-name" value={form.name} onChange={field("name")} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-race">Race *</Label>
            <Select id="edit-race" value={form.race} onChange={field("race")} required>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-sexe">Sexe *</Label>
              <Select id="edit-sexe" value={form.sexe} onChange={field("sexe")}>
                <option value="femelle">♀ Femelle</option>
                <option value="male">♂ Mâle</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-statut">Statut</Label>
              <Select id="edit-statut" value={form.statut} onChange={field("statut")}>
                <option value="actif">Actif</option>
                <option value="reproducteur">Reproducteur</option>
                <option value="vendu">Vendu</option>
                <option value="decede">Décédé</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-dateNaissance">Date de naissance *</Label>
            <Input id="edit-dateNaissance" type="date" value={form.dateNaissance} onChange={field("dateNaissance")} required />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-poids">Poids (kg)</Label>
              <Input id="edit-poids" type="number" step="0.01" value={form.poids} onChange={field("poids")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-couleur">Couleur</Label>
              <Input id="edit-couleur" value={form.couleur} onChange={field("couleur")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-cage">Cage N°</Label>
              <Input id="edit-cage" value={form.cageNumero} onChange={field("cageNumero")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" value={form.notes} onChange={field("notes")} />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                confirmDelete
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "text-red-600 hover:bg-red-50 border border-red-200"
              }`}
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              {confirmDelete ? "Confirmer la suppression" : "Supprimer"}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setConfirmDelete(false); }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-earth-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 hover:bg-forest-700 text-white rounded-lg transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
