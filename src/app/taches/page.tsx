"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Clock, XCircle, Loader2, CalendarDays, RefreshCw } from "lucide-react";
import { LABELS_TACHES, ICONS_TACHES, TypeTache } from "@/lib/taches";
import { formatDate } from "@/lib/utils";

interface Accouplement {
  id: string;
  mere: { id: string; name: string; identifiant: string; cageNumero: string | null };
  pere: { id: string; name: string; identifiant: string };
}

interface Tache {
  id: string;
  type: TypeTache;
  dateEcheance: string;
  statut: "a_faire" | "fait" | "ignore";
  notes: string | null;
  accouplement: Accouplement | null;
}

const STATUT_LABELS = { a_faire: "À faire", fait: "Fait ✓", ignore: "Ignoré" };
const HORIZON_OPTIONS = [
  { value: "7", label: "7 jours" },
  { value: "14", label: "14 jours" },
  { value: "30", label: "30 jours" },
  { value: "60", label: "60 jours" },
  { value: "", label: "Tout" },
];

function urgencyClass(dateEcheance: string, statut: string) {
  if (statut !== "a_faire") return "";
  const diff = Math.ceil((new Date(dateEcheance).getTime() - Date.now()) / 86400000);
  if (diff < 0) return "border-red-300 bg-red-50";
  if (diff <= 3) return "border-amber-300 bg-amber-50";
  return "border-earth-100 bg-white";
}

function urgencyBadge(dateEcheance: string, statut: string) {
  if (statut !== "a_faire") return null;
  const diff = Math.ceil((new Date(dateEcheance).getTime() - Date.now()) / 86400000);
  if (diff < 0) return <span className="text-xs font-bold text-red-700 bg-red-100 rounded-full px-2 py-0.5">En retard de {Math.abs(diff)}j</span>;
  if (diff === 0) return <span className="text-xs font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">Aujourd&apos;hui</span>;
  if (diff <= 3) return <span className="text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">Dans {diff}j</span>;
  return null;
}

export default function TachesPage() {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState("30");
  const [filtreStatut, setFiltreStatut] = useState("a_faire");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTaches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtreStatut) params.set("statut", filtreStatut);
    if (horizon) params.set("horizon", horizon);
    const res = await fetch(`/api/taches?${params}`);
    if (res.ok) setTaches(await res.json());
    setLoading(false);
  }, [filtreStatut, horizon]);

  useEffect(() => { fetchTaches(); }, [fetchTaches]);

  async function updateStatut(id: string, statut: "fait" | "ignore" | "a_faire") {
    setUpdating(id);
    await fetch("/api/taches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, statut }),
    });
    await fetchTaches();
    setUpdating(null);
  }

  const counts = {
    a_faire: taches.filter((t) => t.statut === "a_faire").length,
    en_retard: taches.filter((t) => t.statut === "a_faire" && new Date(t.dateEcheance) < new Date()).length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-forest-600" />
            Calendrier des tâches
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Générées automatiquement depuis les saillies
          </p>
        </div>
        <button onClick={fetchTaches} className="p-2 rounded-lg border border-earth-200 hover:bg-earth-50">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-earth-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">À faire (horizon)</p>
          <p className="text-2xl font-bold mt-1">{counts.a_faire}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-xs text-red-700">En retard</p>
          <p className="text-2xl font-bold mt-1 text-red-700">{counts.en_retard}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <div className="flex rounded-lg border border-earth-200 overflow-hidden">
          {(["a_faire", "fait", "ignore", ""] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filtreStatut === s ? "bg-forest-600 text-white" : "bg-white text-muted-foreground hover:bg-earth-50"
              }`}
            >
              {s === "" ? "Tout" : STATUT_LABELS[s]}
            </button>
          ))}
        </div>
        <select
          value={horizon}
          onChange={(e) => setHorizon(e.target.value)}
          className="text-xs border border-earth-200 rounded-lg px-2 py-1.5 bg-white"
        >
          {HORIZON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Liste des tâches */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-forest-600" />
        </div>
      ) : taches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune tâche trouvée</p>
          <p className="text-sm mt-1">Les tâches sont générées automatiquement lors d&apos;un nouvel accouplement.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {taches.map((tache) => (
            <div
              key={tache.id}
              className={`rounded-xl border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ${urgencyClass(tache.dateEcheance, tache.statut)}`}
            >
              {/* Icône + type */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{ICONS_TACHES[tache.type]}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{LABELS_TACHES[tache.type]}</span>
                    {urgencyBadge(tache.dateEcheance, tache.statut)}
                    {tache.statut === "fait" && (
                      <span className="text-xs text-forest-700 bg-forest-100 rounded-full px-2 py-0.5">✓ Fait</span>
                    )}
                    {tache.statut === "ignore" && (
                      <span className="text-xs text-muted-foreground bg-earth-100 rounded-full px-2 py-0.5">Ignoré</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(tache.dateEcheance)}
                    {tache.accouplement && (
                      <> — <span className="font-medium">{tache.accouplement.mere.name}</span>
                        {tache.accouplement.mere.cageNumero && ` · Cage ${tache.accouplement.mere.cageNumero}`}
                        {" × "}{tache.accouplement.pere.name}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {tache.statut === "a_faire" ? (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateStatut(tache.id, "fait")}
                    disabled={updating === tache.id}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 disabled:opacity-60"
                  >
                    {updating === tache.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                    Fait
                  </button>
                  <button
                    onClick={() => updateStatut(tache.id, "ignore")}
                    disabled={updating === tache.id}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-earth-200 rounded-lg hover:bg-earth-100 disabled:opacity-60"
                  >
                    <XCircle className="h-3 w-3" />
                    Ignorer
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => updateStatut(tache.id, "a_faire")}
                  disabled={updating === tache.id}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-earth-200 rounded-lg hover:bg-earth-100 disabled:opacity-60 text-muted-foreground"
                >
                  <Clock className="h-3 w-3" />
                  Rouvrir
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
