"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Grid3X3, List, Loader2 } from "lucide-react";
import { RabbitCard } from "@/components/rabbits/rabbit-card";
import { AddRabbitForm } from "@/components/forms/add-rabbit-form";
import { EditRabbitForm } from "@/components/forms/edit-rabbit-form";
import { cn } from "@/lib/utils";

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
}

const races = ["Toutes", "Néo-Zélandais", "Californien", "Géant Flamand"];
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
        <AddRabbitForm onSuccess={fetchRabbits} />
      </div>

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
            <RabbitCard key={rabbit.id} rabbit={rabbit} onUpdate={fetchRabbits} />
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
              {filtered.map((rabbit) => (
                <tr
                  key={rabbit.id}
                  className="hover:bg-cream-50 transition-colors cursor-pointer"
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
                    <EditRabbitForm rabbit={rabbit} onSuccess={fetchRabbits} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
