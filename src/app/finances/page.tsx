"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  BarChart3,
  Calendar,
  Filter,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AddTransactionForm } from "@/components/forms/add-transaction-form";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "depense" | "recette";
  categorie: string;
  montant: number;
  date: string;
  description: string;
  notes: string | null;
}

const categorieConfig: Record<string, { label: string; icon: string }> = {
  alimentation:  { label: "Alimentation",       icon: "🌾" },
  veterinaire:   { label: "Vétérinaire",         icon: "💉" },
  equipement:    { label: "Équipement",          icon: "🔧" },
  reproduction:  { label: "Reproduction",        icon: "🐇" },
  energie:       { label: "Énergie / Eau",       icon: "⚡" },
  vente_lapin:   { label: "Vente lapins",        icon: "🐇" },
  vente_viande:  { label: "Vente viande",        icon: "🥩" },
  vente_fumier:  { label: "Vente fumier",        icon: "🌱" },
  subvention:    { label: "Subvention",          icon: "🏛" },
  autre:         { label: "Autre",               icon: "📦" },
};

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ddd0b8",
  borderRadius: "8px",
  fontSize: "12px",
};

function formatEur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"tous" | "depense" | "recette">("tous");
  const [moisActif, setMoisActif] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  async function handleDelete(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setConfirmDel(null);
    fetchData();
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions");
      setTransactions(await res.json());
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Calculs globaux ──────────────────────────────────────────────────────
  const totalRecettes = transactions
    .filter((t) => t.type === "recette")
    .reduce((s, t) => s + t.montant, 0);

  const totalDepenses = transactions
    .filter((t) => t.type === "depense")
    .reduce((s, t) => s + t.montant, 0);

  const solde = totalRecettes - totalDepenses;

  // ── Données mensuelles (12 derniers mois) ────────────────────────────────
  const now = new Date();
  const monthlyData: Record<string, { mois: string; recettes: number; depenses: number }> = {};

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    monthlyData[key] = { mois: key, recettes: 0, depenses: 0 };
  }

  for (const t of transactions) {
    const d = new Date(t.date);
    const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    if (monthlyData[key]) {
      if (t.type === "recette") monthlyData[key].recettes += t.montant;
      else monthlyData[key].depenses += t.montant;
    }
  }
  const chartData = Object.values(monthlyData).map((m) => ({
    ...m,
    solde: m.recettes - m.depenses,
  }));

  // ── Répartition par catégorie ────────────────────────────────────────────
  const catMap: Record<string, { depenses: number; recettes: number }> = {};
  for (const t of transactions) {
    if (!catMap[t.categorie]) catMap[t.categorie] = { depenses: 0, recettes: 0 };
    if (t.type === "depense") catMap[t.categorie].depenses += t.montant;
    else catMap[t.categorie].recettes += t.montant;
  }
  const topDepenses = Object.entries(catMap)
    .filter(([, v]) => v.depenses > 0)
    .sort((a, b) => b[1].depenses - a[1].depenses)
    .slice(0, 5);
  const topRecettes = Object.entries(catMap)
    .filter(([, v]) => v.recettes > 0)
    .sort((a, b) => b[1].recettes - a[1].recettes)
    .slice(0, 5);

  // ── Liste filtrée ────────────────────────────────────────────────────────
  const filtered = transactions.filter((t) => {
    if (filter !== "tous" && t.type !== filter) return false;
    if (moisActif) {
      const key = new Date(t.date).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      if (key !== moisActif) return false;
    }
    return true;
  });

  const moisDisponibles = Array.from(new Set(
    transactions.map((t) =>
      new Date(t.date).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
    )
  ));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finances</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Suivi des dépenses et recettes de la ferme
          </p>
        </div>
        <AddTransactionForm onSuccess={fetchData} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-xl border border-earth-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-forest-600" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Recettes totales</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-forest-500" />
          </div>
          <p className="text-3xl font-bold text-forest-700">{formatEur(totalRecettes)}</p>
        </div>

        <div className="bg-white rounded-xl border border-earth-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Dépenses totales</span>
            </div>
            <ArrowDownRight className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-600">{formatEur(totalDepenses)}</p>
        </div>

        <div className={cn(
          "rounded-xl border p-5 shadow-sm",
          solde >= 0 ? "bg-forest-50 border-forest-200" : "bg-red-50 border-red-200"
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", solde >= 0 ? "bg-forest-200" : "bg-red-200")}>
                <Wallet className={cn("h-5 w-5", solde >= 0 ? "text-forest-700" : "text-red-600")} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Solde net</span>
            </div>
          </div>
          <p className={cn("text-3xl font-bold", solde >= 0 ? "text-forest-700" : "text-red-700")}>
            {solde >= 0 ? "+" : ""}{formatEur(solde)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {solde >= 0 ? "✅ Bénéfice" : "⚠️ Déficit"} sur toute la période
          </p>
        </div>
      </div>

      {/* Graphe mensuel */}
      <div className="bg-white rounded-xl border border-earth-100 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-forest-600" />
          Évolution mensuelle (12 derniers mois)
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Cliquez sur une barre pour filtrer les transactions</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={chartData}
            onClick={(d) => {
              if (d?.activeLabel) {
                setMoisActif((prev) => (prev === d.activeLabel ? null : d.activeLabel ?? null));
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2c4" />
            <XAxis dataKey="mois" tick={{ fontSize: 10, fill: "#8b6d42" }} />
            <YAxis tick={{ fontSize: 11, fill: "#8b6d42" }} tickFormatter={(v) => `${v}€`} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`${v.toFixed(0)} €`, ""]}
            />
            <Legend />
            <Bar dataKey="recettes" name="Recettes" fill="#5a9e5a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="depenses" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition par catégorie */}
        <div className="space-y-4">
          {/* Top dépenses */}
          <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Top dépenses
            </h3>
            {topDepenses.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucune dépense</p>
            ) : (
              <div className="space-y-2.5">
                {topDepenses.map(([cat, v]) => {
                  const cfg = categorieConfig[cat] ?? { label: cat, icon: "📦" };
                  const pct = totalDepenses > 0 ? (v.depenses / totalDepenses) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span>{cfg.icon}</span>
                          <span className="text-muted-foreground">{cfg.label}</span>
                        </span>
                        <span className="font-semibold text-red-600">{formatEur(v.depenses)}</span>
                      </div>
                      <div className="h-1.5 bg-earth-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top recettes */}
          <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-forest-600" />
              Top recettes
            </h3>
            {topRecettes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucune recette</p>
            ) : (
              <div className="space-y-2.5">
                {topRecettes.map(([cat, v]) => {
                  const cfg = categorieConfig[cat] ?? { label: cat, icon: "💶" };
                  const pct = totalRecettes > 0 ? (v.recettes / totalRecettes) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span>{cfg.icon}</span>
                          <span className="text-muted-foreground">{cfg.label}</span>
                        </span>
                        <span className="font-semibold text-forest-600">{formatEur(v.recettes)}</span>
                      </div>
                      <div className="h-1.5 bg-earth-100 rounded-full overflow-hidden">
                        <div className="h-full bg-forest-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Liste des transactions */}
        <div className="lg:col-span-2">
          {/* Filtres */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(["tous", "recette", "depense"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full font-medium border transition-colors",
                  filter === f
                    ? f === "depense" ? "bg-red-500 text-white border-red-500"
                      : f === "recette" ? "bg-forest-600 text-white border-forest-600"
                      : "bg-earth-700 text-white border-earth-700"
                    : "bg-white text-muted-foreground border-earth-200 hover:border-earth-400"
                )}
              >
                {f === "tous" ? "Toutes" : f === "recette" ? "💰 Recettes" : "💸 Dépenses"}
              </button>
            ))}

            {/* Filtre mois */}
            <div className="flex items-center gap-1 ml-auto">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={moisActif ?? ""}
                onChange={(e) => setMoisActif(e.target.value || null)}
                className="text-xs border border-earth-200 rounded-lg px-2 py-1.5 bg-white text-muted-foreground focus:outline-none"
              >
                <option value="">Tous les mois</option>
                {moisDisponibles.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {moisActif && (
            <div className="flex items-center gap-2 mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span>Filtré sur : <strong>{moisActif}</strong></span>
              <button onClick={() => setMoisActif(null)} className="underline ml-auto">Effacer</button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-forest-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-earth-100">
              <Wallet className="h-10 w-10 text-earth-300 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Aucune transaction</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enregistrez vos premières dépenses et recettes
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((t) => {
                const cfg = categorieConfig[t.categorie] ?? { label: t.categorie, icon: "📦" };
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "bg-white rounded-xl border shadow-sm p-3.5 hover:shadow-md transition-shadow flex items-center gap-3",
                      t.type === "depense" ? "border-red-100" : "border-forest-100"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0",
                      t.type === "depense" ? "bg-red-100" : "bg-forest-100"
                    )}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                        <span className="text-xs text-muted-foreground bg-earth-100 px-1.5 py-0.5 rounded">
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <div>
                        <p className={cn(
                          "text-base font-bold",
                          t.type === "depense" ? "text-red-600" : "text-forest-600"
                        )}>
                          {t.type === "depense" ? "-" : "+"}{formatEur(t.montant)}
                        </p>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          t.type === "depense"
                            ? "bg-red-100 text-red-600"
                            : "bg-forest-100 text-forest-600"
                        )}>
                          {t.type === "depense" ? "Dépense" : "Recette"}
                        </span>
                      </div>
                      {confirmDel === t.id ? (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleDelete(t.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg">Oui</button>
                          <button onClick={() => setConfirmDel(null)} className="text-xs px-2 py-1 border border-earth-200 rounded-lg">Non</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDel(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors" title="Supprimer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
