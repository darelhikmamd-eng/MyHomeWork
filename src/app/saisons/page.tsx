"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  Thermometer,
  Droplets,
  Wheat,
  Stethoscope,
  Heart,
  Sparkles,
  Home,
  ChevronRight,
  CalendarDays,
  TrendingDown,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Saison, FarmStats, AlertePersonnalisee, Climat, Categorie } from "@/lib/saisons";

interface SaisonsResponse {
  saison: Saison;
  stats: FarmStats;
  alertes: AlertePersonnalisee[];
  climat: Climat;
  date: string;
}

const categorieConfig: Record<
  Categorie,
  { label: string; icon: typeof Thermometer; color: string; bg: string }
> = {
  temperature: { label: "Température & Ambiance", icon: Thermometer, color: "text-red-600", bg: "bg-red-50" },
  hydratation: { label: "Hydratation", icon: Droplets, color: "text-blue-600", bg: "bg-blue-50" },
  alimentation: { label: "Alimentation", icon: Wheat, color: "text-amber-600", bg: "bg-amber-50" },
  sante: { label: "Santé & Prévention", icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50" },
  reproduction: { label: "Reproduction", icon: Heart, color: "text-pink-600", bg: "bg-pink-50" },
  hygiene: { label: "Hygiène & Désinfection", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
  infrastructure: { label: "Infrastructure", icon: Home, color: "text-slate-600", bg: "bg-slate-50" },
};

const prioriteConfig = {
  haute: { label: "Priorité haute", color: "text-red-700", bg: "bg-red-100", border: "border-red-300" },
  normale: { label: "Priorité normale", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300" },
  basse: { label: "Priorité basse", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-300" },
};

const alerteConfig = {
  critique: { icon: AlertCircle, color: "text-red-700", bg: "bg-red-50", border: "border-red-300" },
  attention: { icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
  info: { icon: Info, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300" },
};

export default function SaisonsPage() {
  const [data, setData] = useState<SaisonsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [climat, setClimat] = useState<Climat>("tropical");
  const [filtreCategorie, setFiltreCategorie] = useState<Categorie | "tous">("tous");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/saisons?climat=${climat}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [climat]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-forest-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Impossible de charger les recommandations saisonnières.</p>
      </div>
    );
  }

  const { saison, stats, alertes } = data;
  const recommandationsFiltrees =
    filtreCategorie === "tous"
      ? saison.recommandations
      : saison.recommandations.filter((r) => r.categorie === filtreCategorie);

  const categoriesPresentes = Array.from(
    new Set(saison.recommandations.map((r) => r.categorie))
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-forest-600" />
            Gestion saisonnière
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Recommandations adaptées à la saison en cours et à l&apos;état de votre ferme
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 bg-forest-100 hover:bg-forest-200 px-3 py-2 rounded-lg transition-colors self-start"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Sélecteur climat */}
      <div className="bg-white rounded-xl border border-earth-100 shadow-sm p-4">
        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
          Zone climatique de votre ferme
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setClimat("tropical")}
            className={cn(
              "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
              climat === "tropical"
                ? "bg-forest-600 text-white border-forest-600"
                : "bg-white text-muted-foreground border-earth-200 hover:border-forest-400"
            )}
          >
            🌴 Tropical (Afrique de l&apos;Ouest)
          </button>
          <button
            onClick={() => setClimat("tempere")}
            className={cn(
              "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
              climat === "tempere"
                ? "bg-forest-600 text-white border-forest-600"
                : "bg-white text-muted-foreground border-earth-200 hover:border-forest-400"
            )}
          >
            🌍 Tempéré (Europe / Maghreb)
          </button>
        </div>
      </div>

      {/* Bandeau saison */}
      <div className="bg-gradient-to-br from-forest-50 via-sage-50 to-cream-100 rounded-2xl border-2 border-forest-200 p-6 shadow-sm">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="text-6xl flex-shrink-0">{saison.emoji}</div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs uppercase tracking-wider font-semibold text-forest-600 mb-1">
              Saison en cours
            </p>
            <h2 className="text-2xl font-bold text-forest-900">{saison.nom}</h2>
            <p className="text-sm text-forest-700 mt-0.5">{saison.mois}</p>
            <p className="text-sm text-foreground mt-3 leading-relaxed">{saison.description}</p>
          </div>
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-xl p-3 border border-forest-100">
            <p className="text-xs uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5" />
              Température optimale
            </p>
            <p className="text-sm font-medium text-foreground mt-1">{saison.temperatureOptimale}</p>
          </div>
          <div className="bg-white/70 rounded-xl p-3 border border-forest-100">
            <p className="text-xs uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Risques principaux
            </p>
            <ul className="text-xs text-foreground mt-1 space-y-0.5">
              {saison.risquesPrincipaux.slice(0, 3).map((r, i) => (
                <li key={i} className="flex gap-1">
                  <span className="text-red-500">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Stats ferme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-forest-500" />
            <span className="text-xs text-muted-foreground font-medium">Cheptel</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalAnimaux}</p>
        </div>
        <div className={cn(
          "rounded-xl border p-4 shadow-sm",
          stats.tauxMortalite > 15 ? "bg-red-50 border-red-200" : stats.tauxMortalite > 8 ? "bg-amber-50 border-amber-200" : "bg-white border-earth-100"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className={cn(
              "h-4 w-4",
              stats.tauxMortalite > 15 ? "text-red-500" : stats.tauxMortalite > 8 ? "text-amber-500" : "text-forest-500"
            )} />
            <span className="text-xs text-muted-foreground font-medium">Mortalité</span>
          </div>
          <p className={cn(
            "text-2xl font-bold",
            stats.tauxMortalite > 15 ? "text-red-600" : stats.tauxMortalite > 8 ? "text-amber-600" : "text-foreground"
          )}>
            {stats.tauxMortalite}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-4 w-4 text-pink-500" />
            <span className="text-xs text-muted-foreground font-medium">Reproducteurs</span>
          </div>
          <p className="text-2xl font-bold">{stats.nbReproducteurs}</p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground font-medium">Lapereaux</span>
          </div>
          <p className="text-2xl font-bold">{stats.nbLapereaux}</p>
        </div>
      </div>

      {/* Alertes personnalisées */}
      {alertes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Alertes spécifiques à votre ferme
          </h3>
          {alertes.map((alerte, i) => {
            const cfg = alerteConfig[alerte.niveau];
            const AlertIcon = cfg.icon;
            return (
              <div
                key={i}
                className={cn("rounded-xl border-2 p-4 flex gap-3", cfg.bg, cfg.border)}
              >
                <AlertIcon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", cfg.color)} />
                <div>
                  <p className={cn("font-bold text-sm", cfg.color)}>{alerte.titre}</p>
                  <p className="text-sm text-foreground mt-1 leading-relaxed">{alerte.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtres catégories */}
      <div>
        <h3 className="text-base font-bold text-foreground mb-3">
          Recommandations ({saison.recommandations.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltreCategorie("tous")}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full font-medium border transition-colors",
              filtreCategorie === "tous"
                ? "bg-forest-600 text-white border-forest-600"
                : "bg-white text-muted-foreground border-earth-200 hover:border-forest-400"
            )}
          >
            Toutes
          </button>
          {categoriesPresentes.map((cat) => {
            const cfg = categorieConfig[cat];
            const CatIcon = cfg.icon;
            const nb = saison.recommandations.filter((r) => r.categorie === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFiltreCategorie(cat)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full font-medium border transition-colors flex items-center gap-1.5",
                  filtreCategorie === cat
                    ? "bg-forest-600 text-white border-forest-600"
                    : "bg-white text-muted-foreground border-earth-200 hover:border-forest-400"
                )}
              >
                <CatIcon className="h-3.5 w-3.5" />
                {cfg.label}
                <span className="bg-white/30 text-current px-1 rounded-full text-[10px] font-bold">
                  {nb}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des recommandations */}
      <div className="space-y-3">
        {recommandationsFiltrees.map((reco) => {
          const catCfg = categorieConfig[reco.categorie];
          const prioCfg = prioriteConfig[reco.priorite];
          const CatIcon = catCfg.icon;
          return (
            <div
              key={reco.id}
              className="bg-white rounded-xl border border-earth-100 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    catCfg.bg
                  )}>
                    <CatIcon className={cn("h-5 w-5", catCfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-base text-foreground">{reco.titre}</h4>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide",
                        prioCfg.bg, prioCfg.color, prioCfg.border
                      )}>
                        {prioCfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{reco.description}</p>

                    <div className="mt-3 pt-3 border-t border-earth-100">
                      <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                        Actions concrètes
                      </p>
                      <ul className="space-y-1.5">
                        {reco.actions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <ChevronRight className="h-4 w-4 text-forest-500 flex-shrink-0 mt-0.5" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {recommandationsFiltrees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-earth-100">
          <p className="text-sm text-muted-foreground">
            Aucune recommandation dans cette catégorie pour la saison en cours.
          </p>
        </div>
      )}
    </div>
  );
}
