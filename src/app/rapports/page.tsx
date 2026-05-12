"use client";

import { useEffect, useState } from "react";
import { TrendingUp, BarChart3, PieChart, Activity, Loader2, Users } from "lucide-react";
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
interface RapportData {
  total: number;
  statutDistribution: StatutItem[];
  raceDistribution: RaceItem[];
  kpis: Kpis;
  reproductionData: ReproMonth[];
}

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ddd0b8",
  borderRadius: "8px",
  fontSize: "12px",
};

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

  const { total, statutDistribution, raceDistribution, kpis, reproductionData } = data;
  const maxStatut = Math.max(...statutDistribution.map((s) => s.value), 1);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rapports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analyse des performances de la ferme
          </p>
        </div>
        <div className="flex items-center gap-2 bg-forest-50 border border-forest-200 rounded-xl px-4 py-2.5">
          <Users className="h-4 w-4 text-forest-600" />
          <span className="text-sm font-bold text-forest-700">{total} lapins</span>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Taux de survie portées", value: kpis.tauxSurvie, icon: Activity, color: "text-forest-600", bg: "bg-forest-100" },
          { label: "Moy. lapereaux/portée", value: kpis.productivite, icon: TrendingUp, color: "text-sage-600", bg: "bg-sage-100" },
          { label: "Taux de gestation", value: kpis.tauxGestation, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Taux de mortalité", value: kpis.tauxMortalite, icon: PieChart, color: "text-red-600", bg: "bg-red-100" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
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
              <Bar dataKey="lapereaux" fill="#5a9e5a" name="Lapereaux nés" radius={[4, 4, 0, 0]} />
              <Bar dataKey="portees" fill="#a8be9b" name="Portées" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth curve — reference */}
        <div className="bg-white rounded-xl border border-earth-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-forest-600" />
            Courbe de croissance de référence (kg)
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Courbe théorique standard — les pesées individuelles alimenteront ce graphique
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={croissanceRef}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e2c4" />
              <XAxis dataKey="semaine" tick={{ fontSize: 11, fill: "#8b6d42" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8b6d42" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="poidsMoyen"
                stroke="#3d7a3d"
                strokeWidth={2.5}
                dot={{ fill: "#3d7a3d", r: 4 }}
                name="Poids (kg)"
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
                { label: "Taux de mortalité", value: kpis.tauxMortalite, color: "text-red-600" },
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
    </div>
  );
}
