"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, BarChart3, PieChart, Activity, Loader2, Users, Scale, Wheat, TrendingDown, Info, Baby, UtensilsCrossed, Award, CheckCircle2, AlertTriangle, XCircle, Printer } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Standard rabbit growth reference curve (theoretical, no weight logs yet)
const croissanceRef = [
  { semaine: "S1", poidsMoyen: 0.18 },
  { semaine: "S2", poidsMoyen: 0.32 },
  { semaine: "S3", poidsMoyen: 0.52 },
  { semaine: "S4", poidsMoyen: 0.75 },
  { semaine: "S6", poidsMoyen: 1.20 },
  { semaine: "S8", poidsMoyen: 1.65 },
  { semaine: "S10", poidsMoyen: 2.10 },
  { semaine: "S12", poidsMoyen: 2.55 },
];

interface StatutItem { name: string; value: number; color: string }
interface RaceItem   { name: string; value: number; color: string }
interface ReproMonth { mois: string; portees: number; lapereaux: number }
interface Kpis {
  tauxMortalite: string;
  productivite: string;
  poidsMoyenAdulte: string;
  tauxGestation: string;
  tauxSurvie: string;
  nbPortees: number;
  totalAccouplements: number;
}
interface MortaliteSegmentee {
  mortsNes: number;
  sousLaMere: number;
  adultes: number;
  totalMortsPortees: number;
  totalNes: number;
  normeProf: number;
}
interface MargeAlimentaire {
  valeur: number;
  recettesVente: number;
  depensesAlim: number;
  parFemelle: string;
  nbFemellesRepro: number;
  positif: boolean;
}
interface TauxSurviePresevrage {
  valeur: string;
  lapereaux_sevres: number;
  nés_vivants: number;
  cible: string;
  conforme: boolean | null;
}
interface IndiceConsommation {
  valeur: string;
  totalAlimentKg: number;
  gainPoidsKg: number;
  cible: string;
  conforme: boolean | null;
}
interface Gte {
  mortaliteSegmentee: MortaliteSegmentee;
  gmqMoyen: string;
  nbPesees: number;
  tauxSurviePresevrage: TauxSurviePresevrage;
  indiceConsommation: IndiceConsommation;
  margeAlimentaire: MargeAlimentaire;
}
interface CroissanceItem { semaine: string; poidsMoyen: number; nbPesees: number }
interface RapportData {
  total: number;
  statutDistribution: StatutItem[];
  raceDistribution: RaceItem[];
  kpis: Kpis;
  reproductionData: ReproMonth[];
  gte: Gte;
  croissanceReelle: CroissanceItem[];
}

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ddd0b8",
  borderRadius: "8px",
  fontSize: "12px",
};

function calcPerformanceScore(kpis: Kpis, gte: Gte): { score: number; label: string; scoreClass: string; bgClass: string; barClass: string } {
  let pts = 0;
  const mort = parseFloat(kpis.tauxMortalite);
  if (!isNaN(mort)) { if (mort < 10) pts += 25; else if (mort < 20) pts += 15; else pts += 5; }
  const gest = parseFloat(kpis.tauxGestation);
  if (!isNaN(gest)) { if (gest >= 80) pts += 25; else if (gest >= 60) pts += 15; else pts += 5; }
  const prod = parseFloat(kpis.productivite);
  if (!isNaN(prod)) { if (prod >= 7) pts += 25; else if (prod >= 5) pts += 15; else pts += 5; }
  const survie = parseFloat(gte.tauxSurviePresevrage.valeur);
  if (!isNaN(survie)) { if (survie >= 85) pts += 25; else if (survie >= 70) pts += 15; else pts += 5; }
  if (pts >= 85) return { score: pts, label: "Excellent", scoreClass: "text-forest-700", bgClass: "bg-forest-50 border-forest-300", barClass: "bg-forest-500" };
  if (pts >= 65) return { score: pts, label: "Bon", scoreClass: "text-sage-600", bgClass: "bg-sage-50 border-sage-300", barClass: "bg-sage-500" };
  if (pts >= 40) return { score: pts, label: "À améliorer", scoreClass: "text-amber-600", bgClass: "bg-amber-50 border-amber-300", barClass: "bg-amber-500" };
  return { score: pts, label: "Insuffisant", scoreClass: "text-red-600", bgClass: "bg-red-50 border-red-300", barClass: "bg-red-500" };
}

export default function RapportsPage() {
  const [data, setData] = useState<RapportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rapports")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-forest-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Impossible de charger les rapports.
      </div>
    );
  }

  const { total, statutDistribution, raceDistribution, kpis, reproductionData, gte, croissanceReelle } = data;
  const maxStatut = Math.max(...statutDistribution.map((s) => s.value), 1);
  const perf = calcPerformanceScore(kpis, gte);

  const recommendations: { icon: React.ElementType; title: string; text: string; type: "danger" | "warning" | "success" | "info" }[] = [];
  const mortVal = parseFloat(kpis.tauxMortalite);
  const gestVal = parseFloat(kpis.tauxGestation);
  const prodVal = parseFloat(kpis.productivite);
  if (!isNaN(mortVal) && mortVal > 15) recommendations.push({ icon: AlertTriangle, title: "Mortalité à la naissance élevée", text: `Votre taux est de ${kpis.tauxMortalite}. Vérifiez les conditions de mise-bas (température, nid, tranquillité de la mère).`, type: "danger" });
  if (!isNaN(gestVal) && gestVal < 70) recommendations.push({ icon: AlertTriangle, title: "Taux de gestation faible", text: `Seulement ${kpis.tauxGestation} des saillies aboutissent. Vérifiez l\'état corporel des femelles et le timing des accouplements.`, type: "warning" });
  if (!isNaN(prodVal) && prodVal >= 7) recommendations.push({ icon: CheckCircle2, title: "Excellente productivité", text: `${kpis.productivite} est au-dessus de l\'objectif de 7 lapereaux/portée. Continuez vos pratiques actuelles.`, type: "success" });
  if (!gte.margeAlimentaire.positif && (gte.margeAlimentaire.recettesVente > 0 || gte.margeAlimentaire.depensesAlim > 0)) recommendations.push({ icon: AlertTriangle, title: "Marge alimentaire négative", text: "Les recettes de vente ne couvrent pas les dépenses alimentaires. Revoyez vos prix de vente ou réduisez le gaspillage.", type: "danger" });
  if (gte.nbPesees < 5) recommendations.push({ icon: XCircle, title: "Peu de pesées enregistrées", text: "Enregistrez des pesées régulières (1×/semaine par lapin) pour calculer le GMQ réel et suivre la croissance du troupeau.", type: "info" });
  if (gte.tauxSurviePresevrage.conforme === false) recommendations.push({ icon: AlertTriangle, title: "Survie pré-sevrage en dessous de la cible", text: `Taux à ${gte.tauxSurviePresevrage.valeur} (cible ≥ 85%). Vérifiez la densité des portées, l\'alimentation des mères allaitantes et la chaleur des nids.`, type: "warning" });

  // Fusionner les données théoriques et réelles pour le graphique de croissance
  const mergedCroissance = (() => {
    const allWeeks = new Set<string>();
    croissanceRef.forEach((d) => allWeeks.add(d.semaine));
    (croissanceReelle ?? []).forEach((d) => allWeeks.add(d.semaine));
    const sorted = Array.from(allWeeks).sort((a, b) => {
      const na = parseInt(a.replace("S", ""), 10);
      const nb = parseInt(b.replace("S", ""), 10);
      return na - nb;
    });
    return sorted.map((semaine) => ({
      semaine,
      theorique: croissanceRef.find((d) => d.semaine === semaine)?.poidsMoyen ?? null,
      reel: (croissanceReelle ?? []).find((d) => d.semaine === semaine)?.poidsMoyen ?? null,
    }));
  })();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rapports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analyse des performances — {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-forest-50 border border-forest-200 rounded-xl px-3 py-2">
            <Users className="h-4 w-4 text-forest-600" />
            <span className="text-sm font-bold text-forest-700">{total} lapin{total > 1 ? "s" : ""}</span>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 border border-earth-200 rounded-xl bg-white hover:bg-earth-50 transition-colors"
            title="Imprimer le rapport"
          >
            <Printer className="h-4 w-4 text-muted-foreground" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
        </div>
      </div>

      {/* Score de performance global */}
      <div className={`rounded-2xl border-2 p-5 shadow-sm ${perf.bgClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-xl border border-earth-200 flex items-center justify-center shadow-sm flex-shrink-0">
              <Award className={`h-7 w-7 ${perf.scoreClass}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score de performance global</p>
              <p className={`text-3xl font-bold ${perf.scoreClass}`}>{perf.score}<span className="text-base font-normal text-muted-foreground">/100</span></p>
              <span className={`text-sm font-semibold ${perf.scoreClass}`}>{perf.label}</span>
            </div>
          </div>
          <div className="flex-1 max-w-sm">
            <div className="h-3 bg-white/70 rounded-full overflow-hidden border border-earth-200">
              <div className={`h-full rounded-full transition-all ${perf.barClass}`} style={{ width: `${perf.score}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Basé sur la mortalité, le taux de gestation, la productivité et la survie pré-sevrage</p>
          </div>
          {recommendations.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {recommendations.filter(r => r.type === "danger").length > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full border border-red-200">
                  {recommendations.filter(r => r.type === "danger").length} critique{recommendations.filter(r => r.type === "danger").length > 1 ? "s" : ""}
                </span>
              )}
              {recommendations.filter(r => r.type === "warning").length > 0 && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                  {recommendations.filter(r => r.type === "warning").length} alerte{recommendations.filter(r => r.type === "warning").length > 1 ? "s" : ""}
                </span>
              )}
              {recommendations.filter(r => r.type === "success").length > 0 && (
                <span className="px-2 py-1 bg-forest-100 text-forest-700 rounded-full border border-forest-200">
                  {recommendations.filter(r => r.type === "success").length} point{recommendations.filter(r => r.type === "success").length > 1 ? "s" : ""} fort{recommendations.filter(r => r.type === "success").length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section GTE */}
      <div className="bg-gradient-to-r from-forest-50 to-sage-50 border-2 border-forest-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-forest-600" />
          <h2 className="text-base font-bold text-forest-900">Indicateurs Technico-Économiques (GTE)</h2>
          <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full border border-forest-200 font-medium">Norme ITAVI</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {/* Mortalité segmentée */}
          <div className="bg-white rounded-xl border border-earth-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mortalité segmentée</p>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Mort-nés", value: gte.mortaliteSegmentee.mortsNes, color: "bg-red-500" },
                { label: "Sous la mère", value: Math.max(0, gte.mortaliteSegmentee.sousLaMere), color: "bg-orange-400" },
                { label: "Adultes décédés", value: gte.mortaliteSegmentee.adultes, color: "bg-amber-500" },
              ].map((seg) => (
                <div key={seg.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{seg.label}</span>
                    <span className="font-bold">{seg.value.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-earth-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${seg.color}`} style={{ width: `${Math.min(seg.value * 5, 100)}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-earth-100 flex items-center gap-1.5">
                <Info className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Norme prof. après sevrage : &lt;{gte.mortaliteSegmentee.normeProf}%</p>
              </div>
            </div>
          </div>

          {/* GMQ */}
          <div className="bg-white rounded-xl border border-earth-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-forest-500" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gain Moyen Quotidien</p>
            </div>
            <p className="text-3xl font-bold text-forest-700">{gte.gmqMoyen}</p>
            <p className="text-xs text-muted-foreground mt-1">Basé sur {gte.nbPesees} pesée{gte.nbPesees > 1 ? "s" : ""} enregistrée{gte.nbPesees > 1 ? "s" : ""}</p>
            <div className="mt-3 pt-3 border-t border-earth-100">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Objectif industriel : 35–45 g/j
              </p>
              {gte.nbPesees < 2 && (
                <p className="text-[10px] text-amber-600 mt-1">Enregistrez des pesées régulières pour calculer le GMQ réel</p>
              )}
            </div>
          </div>

          {/* Marge alimentaire */}
          <div className={`rounded-xl border p-4 ${gte.margeAlimentaire.positif ? "bg-white border-earth-100" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Wheat className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Marge / coût alim.</p>
            </div>
            <p className={`text-2xl font-bold ${gte.margeAlimentaire.positif ? "text-forest-700" : "text-red-600"}`}>
              {gte.margeAlimentaire.positif ? "+" : ""}{gte.margeAlimentaire.valeur.toLocaleString("fr-FR")} FCFA
            </p>
            <div className="space-y-1 mt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Recettes vente</span>
                <span className="text-forest-600 font-medium">+{gte.margeAlimentaire.recettesVente.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Dépenses alim.</span>
                <span className="text-red-500 font-medium">-{gte.margeAlimentaire.depensesAlim.toLocaleString("fr-FR")} F</span>
              </div>
              {gte.margeAlimentaire.nbFemellesRepro > 0 && (
                <div className="pt-2 border-t border-earth-100 flex justify-between text-xs">
                  <span className="text-muted-foreground">Par femelle reproductrice</span>
                  <span className="font-bold">{gte.margeAlimentaire.parFemelle}</span>
                </div>
              )}
            </div>
          </div>
          {/* Taux de survie pré-sevrage */}
          <div className="bg-white rounded-xl border border-earth-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Baby className="h-4 w-4 text-pink-500" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Survie pré-sevrage</p>
            </div>
            <p className={`text-3xl font-bold ${gte.tauxSurviePresevrage.conforme ? "text-forest-700" : gte.tauxSurviePresevrage.conforme === false ? "text-red-600" : "text-muted-foreground"}`}>
              {gte.tauxSurviePresevrage.valeur}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {gte.tauxSurviePresevrage.lapereaux_sevres} sevrés / {gte.tauxSurviePresevrage["nés_vivants"]} nés vivants
            </p>
            <div className="mt-3 pt-3 border-t border-earth-100">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Cible : {gte.tauxSurviePresevrage.cible}
              </p>
            </div>
          </div>

          {/* Indice de Consommation */}
          <div className={`rounded-xl border p-4 ${
            gte.indiceConsommation.conforme === true
              ? "bg-white border-earth-100"
              : gte.indiceConsommation.conforme === false
              ? "bg-amber-50 border-amber-200"
              : "bg-white border-earth-100"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Indice Consom. (IC)</p>
            </div>
            <p className={`text-3xl font-bold ${gte.indiceConsommation.conforme === true ? "text-forest-700" : gte.indiceConsommation.conforme === false ? "text-amber-700" : "text-muted-foreground"}`}>
              {gte.indiceConsommation.valeur}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {gte.indiceConsommation.totalAlimentKg} kg aliment / {gte.indiceConsommation.gainPoidsKg} kg gain
            </p>
            <div className="mt-3 pt-3 border-t border-earth-100">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Cible industrielle : {gte.indiceConsommation.cible}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Survie des portées", value: kpis.tauxSurvie, icon: Activity, color: "text-forest-600", bg: "bg-forest-100", norm: "Cible : ≥ 85%" },
          { label: "Lapereaux / portée", value: kpis.productivite, icon: TrendingUp, color: "text-sage-600", bg: "bg-sage-100", norm: "Objectif : ≥ 7" },
          { label: "Taux de gestation", value: kpis.tauxGestation, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-100", norm: "Cible : ≥ 80%" },
          { label: "Mortalité à la naissance", value: kpis.tauxMortalite, icon: PieChart, color: "text-red-600", bg: "bg-red-100", norm: "Seuil : < 10%" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <Info className="h-3 w-3" />{kpi.norm}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Reproduction chart — real data */}
        <div className="bg-white rounded-xl border border-earth-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-sage-600" />
            Reproduction mensuelle (12 derniers mois)
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {kpis.nbPortees} portées enregistrées sur {kpis.totalAccouplements} accouplements
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reproductionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e2c4" />
              <XAxis dataKey="mois" tick={{ fontSize: 10, fill: "#8b6d42" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8b6d42" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="lapereaux" fill="#5a9e5a" name="Lapereaux nés" radius={[4, 4, 0, 0]} />
              <Bar dataKey="portees" fill="#a8be9b" name="Portées" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth curve — real + reference */}
        <div className="bg-white rounded-xl border border-earth-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-forest-600" />
            Courbe de croissance (kg)
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {(croissanceReelle ?? []).length > 0
              ? "Données réelles de pesées (courbe verte) vs. référence théorique ITAVI (pointillés)"
              : "Courbe théorique standard — enregistrez des pesées pour afficher vos données réelles"}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mergedCroissance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e2c4" />
              <XAxis dataKey="semaine" tick={{ fontSize: 11, fill: "#8b6d42" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8b6d42" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="theorique"
                stroke="#a8be9b"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                name="Référence théorique"
              />
              <Line
                type="monotone"
                dataKey="reel"
                stroke="#3d7a3d"
                strokeWidth={2.5}
                dot={{ fill: "#3d7a3d", r: 4 }}
                name="Poids réel moyen"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Race distribution — real data */}
        <div className="bg-white rounded-xl border border-earth-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-earth-600" />
            Répartition par race ({total} lapins)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsPieChart>
              <Pie
                data={raceDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {raceDistribution.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} lapins`, ""]} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution — real data */}
        <div className="bg-white rounded-xl border border-earth-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-600" />
            Répartition par statut ({total} lapins)
          </h2>
          <div className="space-y-3 mt-2">
            {statutDistribution.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold">
                    {item.value} lapin{item.value > 1 ? "s" : ""}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      ({((item.value / total) * 100).toFixed(0)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-earth-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(item.value / maxStatut) * 100}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Real KPIs */}
          <div className="mt-6 pt-4 border-t border-earth-100">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Indicateurs clés
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Mortalité à la naissance", value: kpis.tauxMortalite, color: "text-red-600" },
                { label: "Productivité", value: kpis.productivite, color: "text-forest-600" },
                { label: "Poids moyen adulte", value: kpis.poidsMoyenAdulte, color: "text-earth-600" },
                { label: "Taux de gestation", value: kpis.tauxGestation, color: "text-sage-600" },
              ].map((ind) => (
                <div key={ind.label} className="bg-cream-50 rounded-lg p-2.5">
                  <p className="text-xs text-muted-foreground">{ind.label}</p>
                  <p className={`text-sm font-bold mt-0.5 ${ind.color}`}>{ind.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Recommandations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-earth-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-4 w-4 text-forest-600" />
            <h2 className="text-base font-bold text-foreground">Recommandations</h2>
          </div>
          {recommendations.map((rec, i) => {
            const Icon = rec.icon;
            const styles = {
              danger:  { border: "border-red-200",    bg: "bg-red-50",    iconColor: "text-red-600",    titleColor: "text-red-700" },
              warning: { border: "border-amber-200",  bg: "bg-amber-50",  iconColor: "text-amber-600", titleColor: "text-amber-700" },
              success: { border: "border-forest-200", bg: "bg-forest-50", iconColor: "text-forest-600",titleColor: "text-forest-700" },
              info:    { border: "border-blue-200",   bg: "bg-blue-50",   iconColor: "text-blue-600",  titleColor: "text-blue-700" },
            }[rec.type];
            return (
              <div key={i} className={`flex items-start gap-3 rounded-xl border p-3.5 ${styles.bg} ${styles.border}`}>
                <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
                <div>
                  <p className={`text-sm font-semibold ${styles.titleColor}`}>{rec.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
