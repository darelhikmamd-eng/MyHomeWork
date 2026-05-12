"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wheat,
  AlertTriangle,
  Package,
  TrendingDown,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  Sun,
  Moon,
  Sunset,
} from "lucide-react";
import { AddAlimentForm } from "@/components/forms/add-aliment-form";
import { AddDistributionForm } from "@/components/forms/add-distribution-form";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Distribution {
  id: string;
  date: string;
  quantite: number;
  cageNumero: string | null;
  notes: string | null;
  aliment: { id: string; nom: string; type: string; unite: string };
}

interface Aliment {
  id: string;
  nom: string;
  type: string;
  unite: string;
  stockActuel: number;
  stockMin: number;
  prixUnitaire: number | null;
  fournisseur: string | null;
  notes: string | null;
  distributions: Distribution[];
}

const typeConfig: Record<string, { label: string; icon: string; color: string; bg: string; badge: string }> = {
  foin:       { label: "Foin",            icon: "🌾", color: "text-yellow-700", bg: "bg-yellow-100", badge: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  granules:   { label: "Granulés",        icon: "🟤", color: "text-amber-700",  bg: "bg-amber-100",  badge: "bg-amber-100 text-amber-700 border-amber-200" },
  legumes:    { label: "Légumes/Verdure", icon: "🥬", color: "text-forest-700", bg: "bg-forest-100", badge: "bg-forest-100 text-forest-700 border-forest-200" },
  supplement: { label: "Supplément",      icon: "💊", color: "text-purple-700", bg: "bg-purple-100", badge: "bg-purple-100 text-purple-700 border-purple-200" },
  autre:      { label: "Autre",           icon: "📦", color: "text-earth-700",  bg: "bg-earth-100",  badge: "bg-earth-100 text-earth-700 border-earth-200" },
};

const PROFILES = [
  {
    id: "lapereauxSousMere",
    titre: "🐣 Lapereaux sous la mère (0-21 jours)",
    bg: "bg-pink-50", border: "border-pink-200",
    repas: [
      { moment: "24h/24", icon: "🥛", label: "Lait maternel", detail: "Illimité — ne pas déranger la mère les 3 premiers jours", tag: "Automatique" },
      { moment: "Dès J14", icon: "🌾", label: "Foin de qualité", detail: "Accès libre — les lapereaux commencent à grignoter à J14", tag: "Introduire" },
      { moment: "Dès J21", icon: "🟤", label: "Granulés démarrage", detail: "Petite quantité à disposition — prépare le sevrage", tag: "Introduire" },
    ],
    conseil: "Ne jamais toucher les lapereaux les 48 premières heures pour éviter l'abandon par la mère.",
  },
  {
    id: "lapereauxSevres",
    titre: "🐰 Lapereaux sevrés (21-49 jours)",
    bg: "bg-amber-50", border: "border-amber-200",
    repas: [
      { moment: "🌅 6h-8h", icon: "🟤", label: "Granulés démarrage", detail: "30-50 g/lapereau + eau fraîche renouvelée", tag: "Obligatoire" },
      { moment: "🌙 18h-20h", icon: "🟤", label: "Granulés démarrage", detail: "30-50 g/lapereau + foin à volonté (mangent surtout la nuit)", tag: "Obligatoire" },
      { moment: "24h/24", icon: "🌾", label: "Foin à volonté", detail: "Toujours disponible — essentiel pour le transit intestinal", tag: "Permanent" },
    ],
    conseil: "Les lapereaux sevrés sont fragiles (entérites). Changez l'eau 2x/jour et surveillez les selles.",
  },
  {
    id: "jeunes",
    titre: "🐇 Jeunes en croissance (49-90 jours)",
    bg: "bg-forest-50", border: "border-forest-200",
    repas: [
      { moment: "🌅 6h-8h", icon: "🟤", label: "Granulés croissance", detail: "80-100 g/lapin + eau fraîche", tag: "Obligatoire" },
      { moment: "🌞 12h", icon: "🥬", label: "Légumes frais", detail: "20-30 g/lapin : carotte, chicorée (introduire progressivement)", tag: "Recommandé" },
      { moment: "🌙 18h-20h", icon: "🟤", label: "Granulés croissance", detail: "80-100 g/lapin + foin abondant", tag: "Obligatoire" },
      { moment: "24h/24", icon: "🌾", label: "Foin à volonté", detail: "Toujours disponible", tag: "Permanent" },
    ],
    conseil: "Introduire les légumes progressivement (1 seul type à la fois) pour éviter les diarrhées.",
  },
  {
    id: "engraissement",
    titre: "🥩 Lapins à l'engraissement (90j → abattage)",
    bg: "bg-earth-50", border: "border-earth-200",
    repas: [
      { moment: "🌅 6h-8h", icon: "🟤", label: "Granulés engraissement", detail: "130-160 g/lapin + eau fraîche", tag: "Obligatoire" },
      { moment: "🌞 12h", icon: "🥬", label: "Légumes (optionnel)", detail: "50 g/lapin max — carotte, chou", tag: "Optionnel" },
      { moment: "🌙 18h-20h", icon: "🟤", label: "Granulés engraissement", detail: "130-160 g/lapin + foin à volonté", tag: "Obligatoire" },
      { moment: "24h/24", icon: "🌾", label: "Foin à volonté", detail: "Favorise le bien-être et le transit", tag: "Permanent" },
    ],
    conseil: "Évitez les changements d'alimentation brusques dans les 2 semaines avant l'abattage.",
  },
  {
    id: "reproducteursM",
    titre: "♂️ Reproducteurs mâles",
    bg: "bg-blue-50", border: "border-blue-200",
    repas: [
      { moment: "🌅 6h-8h", icon: "🟤", label: "Granulés entretien", detail: "100-120 g/lapin + eau fraîche", tag: "Obligatoire" },
      { moment: "🌞 12h", icon: "🥬", label: "Légumes frais", detail: "50 g : carotte, persil, endive (bonne libido)", tag: "Recommandé" },
      { moment: "🌙 18h-20h", icon: "🌾", label: "Foin à volonté", detail: "Granulés limités le soir pour éviter l'obésité", tag: "Obligatoire" },
    ],
    conseil: "Un mâle trop gras devient infertile. Surveillez le poids et limitez les granulés si nécessaire.",
  },
  {
    id: "gestante",
    titre: "🤰 Femelle gestante (J0 → J31)",
    bg: "bg-purple-50", border: "border-purple-200",
    repas: [
      { moment: "🌅 6h-8h", icon: "🟤", label: "Granulés reproduction", detail: "J0-J14 : 120 g → J14-J28 : +10 g tous les 5 jours → J28-J31 : 160 g + eau à volonté", tag: "Augmentation progressive" },
      { moment: "🌞 12h", icon: "🥬", label: "Légumes frais", detail: "50 g : carotte, persil, pomme de terre cuite (énergie)", tag: "Recommandé" },
      { moment: "🌙 18h-20h", icon: "🌾", label: "Foin à volonté", detail: "Essentiel — prévient la constipation pré-partum", tag: "Obligatoire" },
      { moment: "⚠️ J28", icon: "🪺", label: "Installer le nichoir", detail: "Avec foin doux — la femelle commence à arracher ses poils", tag: "Action requise" },
    ],
    conseil: "Ne jamais restreindre l'eau d'une femelle gestante — déshydratation = avortement possible.",
  },
  {
    id: "allaitante",
    titre: "🍼 Femelle allaitante (J0 → J35)",
    bg: "bg-rose-50", border: "border-rose-200",
    repas: [
      { moment: "24h/24", icon: "🟤", label: "Granulés à volonté", detail: "Consommation ×2-3 (production de lait) — ne jamais restreindre !", tag: "À VOLONTÉ" },
      { moment: "24h/24", icon: "💧", label: "Eau à volonté", detail: "CRITIQUE : une femelle allaitante boit 0,5-1 L/jour. Manque d'eau = abandon des petits", tag: "CRITIQUE" },
      { moment: "🌞 12h", icon: "🥬", label: "Légumes frais", detail: "100 g/jour : carotte, salade, persil — stimulent la lactation", tag: "Recommandé" },
      { moment: "24h/24", icon: "🌾", label: "Foin à volonté", detail: "Toujours disponible", tag: "Permanent" },
    ],
    conseil: "C'est la phase la plus exigeante : vérifiez eau et granulés 2 fois par jour. Ne dérangez pas le nichoir.",
  },
];

const tagColor: Record<string, string> = {
  "Obligatoire":           "bg-forest-100 text-forest-700 border-forest-200",
  "Permanent":             "bg-sage-100 text-sage-700 border-sage-200",
  "Recommandé":            "bg-amber-100 text-amber-700 border-amber-200",
  "Optionnel":             "bg-earth-100 text-earth-700 border-earth-200",
  "Automatique":           "bg-pink-100 text-pink-700 border-pink-200",
  "Introduire":            "bg-blue-100 text-blue-700 border-blue-200",
  "Action requise":        "bg-orange-100 text-orange-700 border-orange-200",
  "Augmentation progressive": "bg-purple-100 text-purple-700 border-purple-200",
  "À VOLONTÉ":             "bg-red-100 text-red-700 border-red-200",
  "CRITIQUE":              "bg-red-200 text-red-800 border-red-300",
};

export default function AlimentationPage() {
  const [aliments, setAliments] = useState<Aliment[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [activeTab, setActiveTab] = useState<"stock" | "plans">("stock");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, dRes] = await Promise.all([
        fetch("/api/aliments"),
        fetch("/api/distributions"),
      ]);
      setAliments(await aRes.json());
      setDistributions(await dRes.json());
    } catch {
      setAliments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const alertes = aliments.filter((a) => a.stockActuel <= a.stockMin);
  const totalValeurStock = aliments.reduce(
    (sum, a) => sum + (a.stockActuel * (a.prixUnitaire ?? 0)), 0
  );

  const filtered = activeFilter === "Tous"
    ? aliments
    : aliments.filter((a) => a.type === activeFilter);

  const types = ["Tous", ...Array.from(new Set(aliments.map((a) => a.type)))];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alimentation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestion des stocks et distributions d&apos;aliments
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AddDistributionForm aliments={aliments} onSuccess={fetchData} />
          <AddAlimentForm onSuccess={fetchData} />
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-earth-200">
        {([["stock", "📦 Stock & Distributions"], ["plans", "📋 Plans d'alimentation"]] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── ONGLET PLANS D'ALIMENTATION ────────────────────────────────── */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          {/* Rappel horaire */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-800 text-sm">Rappel clé :</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1.5 bg-white border border-amber-200 px-3 py-1.5 rounded-full">
                <Sun className="h-3.5 w-3.5 text-yellow-500" /> <strong>6h-8h</strong> — Granulés + eau fraîche
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-amber-200 px-3 py-1.5 rounded-full">
                <Sun className="h-3.5 w-3.5 text-orange-400" /> <strong>12h</strong> — Légumes frais
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-amber-200 px-3 py-1.5 rounded-full">
                <Sunset className="h-3.5 w-3.5 text-orange-600" /> <strong>18h-20h</strong> — Granulés + foin
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-amber-200 px-3 py-1.5 rounded-full">
                <Moon className="h-3.5 w-3.5 text-indigo-500" /> <strong>Nuit</strong> — Foin illimité (activité principale)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROFILES.map((profile) => (
              <div key={profile.id} className={cn("rounded-xl border p-4 shadow-sm", profile.bg, profile.border)}>
                <h3 className="text-sm font-bold text-foreground mb-3">{profile.titre}</h3>
                <div className="space-y-2">
                  {profile.repas.map((repas, i) => (
                    <div key={i} className="bg-white/80 rounded-lg p-2.5 flex items-start gap-2.5">
                      <span className="text-base flex-shrink-0 mt-0.5">{repas.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold">{repas.label}</p>
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", tagColor[repas.tag] ?? "bg-earth-100 text-earth-700 border-earth-200")}>
                            {repas.tag}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{repas.detail}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{repas.moment}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/60">
                  <p className="text-xs text-muted-foreground italic">💡 {profile.conseil}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ONGLET STOCK & DISTRIBUTIONS ──────────────────────────────── */}
      {activeTab === "stock" && <>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Types d&apos;aliments</span>
          </div>
          <p className="text-2xl font-bold">{aliments.length}</p>
        </div>

        <div className={cn("bg-white rounded-xl border p-4 shadow-sm", alertes.length > 0 ? "border-red-200" : "border-earth-100")}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", alertes.length > 0 ? "bg-red-100" : "bg-forest-100")}>
              <AlertTriangle className={cn("h-4 w-4", alertes.length > 0 ? "text-red-600" : "text-forest-600")} />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Stocks bas</span>
          </div>
          <p className={cn("text-2xl font-bold", alertes.length > 0 ? "text-red-600" : "text-forest-600")}>
            {alertes.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-forest-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-forest-600" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Distributions (total)</span>
          </div>
          <p className="text-2xl font-bold">{distributions.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-sage-100 rounded-lg flex items-center justify-center">
              <Wheat className="h-4 w-4 text-sage-600" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Valeur stock</span>
          </div>
          <p className="text-2xl font-bold">{totalValeurStock.toFixed(0)} €</p>
        </div>
      </div>

      {/* Alertes stock bas */}
      {alertes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h2 className="text-sm font-semibold text-red-700">
              {alertes.length} aliment{alertes.length > 1 ? "s" : ""} en stock insuffisant
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertes.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1.5 text-xs bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium">
                {typeConfig[a.type]?.icon} {a.nom}
                <span className="text-red-400">— {a.stockActuel} {a.unite}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock d'aliments */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-600" />
              Stock d&apos;aliments ({filtered.length})
            </h2>
          </div>

          {/* Filtres type */}
          <div className="flex flex-wrap gap-2 mb-4">
            {types.map((t) => {
              const cfg = t !== "Tous" ? typeConfig[t] : null;
              return (
                <button
                  key={t}
                  onClick={() => setActiveFilter(t)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium border transition-colors flex items-center gap-1.5",
                    activeFilter === t
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-muted-foreground border-earth-200 hover:border-amber-400"
                  )}
                >
                  {cfg && <span>{cfg.icon}</span>}
                  {t === "Tous" ? "Tous" : cfg?.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((aliment) => {
                const cfg = typeConfig[aliment.type] ?? typeConfig.autre;
                const pct = Math.min(100, (aliment.stockActuel / Math.max(aliment.stockMin * 2, 1)) * 100);
                const isLow = aliment.stockActuel <= aliment.stockMin;
                return (
                  <div key={aliment.id} className={cn("bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow", isLow ? "border-red-200" : "border-earth-100")}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0", cfg.bg)}>
                          {cfg.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{aliment.nom}</p>
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", cfg.badge)}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn("text-lg font-bold", isLow ? "text-red-600" : "text-foreground")}>
                          {aliment.stockActuel} <span className="text-sm font-normal text-muted-foreground">{aliment.unite}</span>
                        </p>
                        {aliment.prixUnitaire && (
                          <p className="text-xs text-muted-foreground">{aliment.prixUnitaire} €/{aliment.unite}</p>
                        )}
                      </div>
                    </div>

                    {/* Barre de stock */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Stock</span>
                        <span className={isLow ? "text-red-600 font-medium" : ""}>
                          {isLow ? "⚠ Stock bas" : "✓ OK"} — seuil : {aliment.stockMin} {aliment.unite}
                        </span>
                      </div>
                      <div className="h-2 bg-earth-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", isLow ? "bg-red-400" : "bg-forest-500")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {aliment.fournisseur && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Fournisseur : <span className="font-medium">{aliment.fournisseur}</span>
                      </p>
                    )}
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-earth-100">
                  <Wheat className="h-10 w-10 text-earth-300 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Aucun aliment enregistré</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ajoutez vos premiers aliments pour commencer
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Journal des distributions */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-forest-600" />
            Dernières distributions
          </h2>
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-forest-500" />
              </div>
            ) : distributions.length === 0 ? (
              <div className="bg-white rounded-xl border border-earth-100 p-6 text-center">
                <TrendingDown className="h-8 w-8 text-earth-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune distribution enregistrée</p>
              </div>
            ) : (
              distributions.slice(0, 20).map((d) => {
                const cfg = typeConfig[d.aliment.type] ?? typeConfig.autre;
                return (
                  <div key={d.id} className="bg-white rounded-xl border border-earth-100 p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0", cfg.bg)}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{d.aliment.nom}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{formatDate(d.date)}</span>
                          {d.cageNumero && (
                            <span className="text-xs bg-earth-100 text-earth-700 px-1.5 py-0.5 rounded font-mono">
                              {d.cageNumero}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-forest-700">
                          -{d.quantite} <span className="text-xs font-normal">{d.aliment.unite}</span>
                        </p>
                        <CheckCircle2 className="h-3.5 w-3.5 text-forest-400 ml-auto mt-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      </>}
    </div>
  );
}
