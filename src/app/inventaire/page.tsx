"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Grid3X3, List, Loader2, Download, Printer, X } from "lucide-react";
import { RabbitCard } from "@/components/rabbits/rabbit-card";
import { AddRabbitForm } from "@/components/forms/add-rabbit-form";
import { EditRabbitForm } from "@/components/forms/edit-rabbit-form";
import { cn } from "@/lib/utils";

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
  race: string;
  sexe: string;
  dateNaissance: string;
  poids: number | null;
  couleur: string | null;
  statut: string;
  cageNumero: string | null;
  notes: string | null;
  reproduction?: ReproductionInfo | null;
}

// races est maintenant calculé dynamiquement depuis les données réelles
const statuts = ["Tous", "actif", "reproducteur", "vendu", "decede"];
const sexes = ["Tous", "male", "femelle"];

const statutLabels: Record<string, string> = {
  actif: "Actif",
  reproducteur: "Reproducteur",
  vendu: "Vendu",
  decede: "Décédé",
};

export default function InventairePage() {
  const [search, setSearch] = useState("");
  const [selectedRace, setSelectedRace] = useState("Toutes");
  const [selectedStatut, setSelectedStatut] = useState("Tous");
  const [selectedSexe, setSelectedSexe] = useState("Tous");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fichePrint, setFichePrint] = useState<Rabbit | null>(null);

  const fetchRabbits = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/rabbits");
      const data = await res.json();
      setRabbits(data);
    } catch {
      setRabbits([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchRabbits(); }, [fetchRabbits]);

  const races = ["Toutes", ...Array.from(new Set(rabbits.map((r) => r.race))).sort()];

  function exportCSV() {
    const headers = ["Nom", "Identifiant", "Race", "Sexe", "Date naissance", "Poids (kg)", "Statut", "Cage", "Notes"];
    const rows = filtered.map((r) => [
      r.name,
      r.identifiant,
      r.race,
      r.sexe === "male" ? "Mâle" : "Femelle",
      r.dateNaissance ? new Date(r.dateNaissance).toLocaleDateString("fr-FR") : "",
      r.poids ?? "",
      r.statut,
      r.cageNumero ?? "",
      r.notes ?? "",
    ]);
    const csv = [headers, ...rows].map((row) => row.map(String).map((v) => `"${v.replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cunigestion_inventaire_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = rabbits.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.identifiant.toLowerCase().includes(search.toLowerCase());
    const matchRace = selectedRace === "Toutes" || r.race === selectedRace;
    const matchStatut = selectedStatut === "Tous" || r.statut === selectedStatut;
    const matchSexe = selectedSexe === "Tous" || r.sexe === selectedSexe;
    return matchSearch && matchRace && matchStatut && matchSexe;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventaire</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loadingData ? "Chargement..." : `${filtered.length} lapin${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 border border-earth-200 rounded-lg bg-white hover:bg-earth-50 transition-colors disabled:opacity-40"
            title="Exporter la liste filtrée en CSV"
          >
            <Download className="h-4 w-4 text-forest-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <AddRabbitForm onSuccess={fetchRabbits} />
        </div>
      </div>

      {/* Modal fiche cage imprimable */}
      {fichePrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden" onClick={() => setFichePrint(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-earth-100">
              <h2 className="font-bold text-base">Fiche cage — {fichePrint.name}</h2>
              <button onClick={() => setFichePrint(null)} className="p-1 rounded-lg hover:bg-earth-100"><X className="h-4 w-4" /></button>
            </div>
            <div id="fiche-cage-print" className="p-5 space-y-3">
              <div className="flex items-start gap-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`CUNI:${fichePrint.identifiant}:${fichePrint.name}:${fichePrint.cageNumero ?? ""}`)}`}
                  alt="QR Code"
                  className="w-24 h-24 border border-earth-100 rounded-lg flex-shrink-0"
                />
                <div className="space-y-1 text-sm">
                  <p className="text-lg font-bold">{fichePrint.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{fichePrint.identifiant}</p>
                  <p className="text-muted-foreground">{fichePrint.race} — {fichePrint.sexe === "male" ? "♂ Mâle" : "♀ Femelle"}</p>
                  {fichePrint.cageNumero && <p className="font-semibold">Cage : {fichePrint.cageNumero}</p>}
                  {fichePrint.poids && <p>Poids : {fichePrint.poids} kg</p>}
                  {fichePrint.dateNaissance && <p>Né(e) : {new Date(fichePrint.dateNaissance).toLocaleDateString("fr-FR")}</p>}
                  <p>État : <span className="font-semibold capitalize">{fichePrint.statut}</span></p>
                </div>
              </div>
              {fichePrint.notes && (
                <div className="bg-cream-50 border border-earth-100 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                  {fichePrint.notes}
                </div>
              )}
              <p className="text-[9px] text-muted-foreground text-center pt-1">Cunigestion — {new Date().toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="p-4 border-t border-earth-100 flex justify-end gap-2">
              <button onClick={() => setFichePrint(null)} className="text-sm px-4 py-2 border border-earth-200 rounded-lg hover:bg-earth-50">Fermer</button>
              <button
                onClick={() => window.print()}
                className="text-sm inline-flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700"
              >
                <Printer className="h-4 w-4" />Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom ou identifiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-earth-200 rounded-lg bg-cream-50 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />

          {/* Race filter */}
          <div className="flex flex-wrap gap-1.5">
            {races.map((race) => (
              <button
                key={race}
                onClick={() => setSelectedRace(race)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full font-medium border transition-colors",
                  selectedRace === race
                    ? "bg-forest-600 text-white border-forest-600"
                    : "bg-white text-muted-foreground border-earth-200 hover:border-forest-400"
                )}
              >
                {race}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-earth-200 hidden sm:block" />

          {/* Sexe filter */}
          <div className="flex flex-wrap gap-1.5">
            {sexes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSexe(s)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full font-medium border transition-colors",
                  selectedSexe === s
                    ? "bg-sage-500 text-white border-sage-500"
                    : "bg-white text-muted-foreground border-earth-200 hover:border-sage-400"
                )}
              >
                {s === "male" ? "♂ Mâle" : s === "femelle" ? "♀ Femelle" : s}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                viewMode === "grid"
                  ? "bg-forest-100 border-forest-300 text-forest-700"
                  : "bg-white border-earth-200 text-muted-foreground hover:bg-earth-50"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                viewMode === "list"
                  ? "bg-forest-100 border-forest-300 text-forest-700"
                  : "bg-white border-earth-200 text-muted-foreground hover:bg-earth-50"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Statut filter */}
        <div className="flex flex-wrap gap-1.5">
          {statuts.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatut(s)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-medium border transition-colors",
                selectedStatut === s
                  ? "bg-earth-500 text-white border-earth-500"
                  : "bg-white text-muted-foreground border-earth-200 hover:border-earth-400"
              )}
            >
              {s === "Tous" ? "Tous statuts" : statutLabels[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loadingData ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-forest-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">🐇</span>
          <p className="mt-4 text-muted-foreground font-medium">
            Aucun lapin ne correspond à ces critères
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedRace("Toutes");
              setSelectedStatut("Tous");
              setSelectedSexe("Tous");
            }}
            className="mt-3 text-sm text-forest-600 hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((rabbit) => (
            <div key={rabbit.id} className="relative group">
              <RabbitCard rabbit={rabbit} onUpdate={fetchRabbits} />
              <button
                onClick={() => setFichePrint(rabbit)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white border border-earth-200 rounded-lg shadow-sm hover:bg-earth-50"
                title="Fiche cage imprimable"
              >
                <Printer className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-earth-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 border-b border-earth-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Lapin
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                  Race
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Sexe
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  Naissance
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  Poids
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Statut
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                  Cage
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-50">
              {filtered.map((rabbit) => {
                const quotaAtteint = rabbit.sexe === "male" && rabbit.reproduction?.quotaAtteint === true;
                return (
                <tr
                  key={rabbit.id}
                  className={cn(
                    "transition-colors cursor-pointer",
                    quotaAtteint
                      ? "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500"
                      : "hover:bg-cream-50"
                  )}
                  title={quotaAtteint ? `⚠️ Quota atteint : ${rabbit.reproduction?.nbFemellesDistinctes}/${rabbit.reproduction?.maxFemelles} femelles` : undefined}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🐇</span>
                      <div>
                        <p className="font-semibold">{rabbit.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {rabbit.identifiant}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {rabbit.race}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full border",
                        rabbit.sexe === "male"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-pink-100 text-pink-700 border-pink-200"
                      )}
                    >
                      {rabbit.sexe === "male" ? "♂ Mâle" : "♀ Femelle"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                    {new Date(rabbit.dateNaissance).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-medium">
                    {rabbit.poids} kg
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full border",
                        rabbit.statut === "reproducteur"
                          ? "bg-sage-100 text-sage-600 border-sage-200"
                          : rabbit.statut === "actif"
                          ? "bg-forest-100 text-forest-700 border-forest-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      )}
                    >
                      {statutLabels[rabbit.statut] ?? rabbit.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="bg-earth-100 text-earth-600 text-xs font-mono px-2 py-0.5 rounded">
                      {rabbit.cageNumero}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setFichePrint(rabbit)}
                        className="p-1.5 rounded-lg hover:bg-earth-50 text-muted-foreground hover:text-forest-600"
                        title="Fiche cage"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      <EditRabbitForm rabbit={rabbit} onSuccess={fetchRabbits} />
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
