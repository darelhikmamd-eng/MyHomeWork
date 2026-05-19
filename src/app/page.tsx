"use client";

import {
  Users,
  Heart,
  Baby,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Syringe,
  CheckCircle2,
  ArrowRight,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface Rabbit {
  id: string; name: string; identifiant: string; race: string;
  sexe: string; statut: string; poids: number | null; cageNumero: string | null;
  dateNaissance: string | null;
}
interface Accouplement {
  id: string; statut: string; dateMiseBas: string | null;
  dateAccouplement: string;
  nombreNes: number | null;
  nombreVivants: number | null;
  mere: { id: string; name: string };
  pere: { id: string; name: string };
}
interface SanteLog {
  id: string; type: string; description: string; prochainRappel: string | null;
  finDelaiAttente: string | null;
  rabbit: { id: string; name: string };
}
interface Transaction {
  id: string; type: "depense" | "recette"; categorie: string; montant: number;
}

export default function DashboardPage() {
  const today = new Date();
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [accouplements, setAccouplements] = useState<Accouplement[]>([]);
  const [santeLogs, setSanteLogs] = useState<SanteLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, aRes, sRes, tRes] = await Promise.all([
        fetch("/api/rabbits"),
        fetch("/api/accouplements"),
        fetch("/api/sante"),
        fetch("/api/transactions"),
      ]);
      setRabbits(await rRes.json());
      setAccouplements(await aRes.json());
      setSanteLogs(await sRes.json());
      setTransactions(await tRes.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const males = rabbits.filter((r) => r.sexe === "male");
  const femelles = rabbits.filter((r) => r.sexe === "femelle");
  const lapereaux = rabbits.filter((r) => r.statut === "lapereau" || r.statut === "croissance");
  const reproducteurs = rabbits.filter((r) => r.statut === "reproducteur");

  // Lapereaux issus des mise-bas (non encore enregistrés comme lapins individuels)
  const portees = accouplements.filter((a) => a.statut === "mise_bas" || a.statut === "sevrage");
  const lapreauxMiseBas = portees.reduce((sum, a) => sum + (a.nombreVivants ?? 0), 0);
  const totalNes = portees.reduce((sum, a) => sum + (a.nombreNes ?? 0), 0);
  const totalMorts = totalNes - lapreauxMiseBas;
  const tauxMortalite = totalNes > 0 ? Math.round((totalMorts / totalNes) * 100) : 0;
  const totalLapereaux = lapereaux.length + lapreauxMiseBas;
  const totalAnimaux = rabbits.length + lapreauxMiseBas;

  const upcomingBirths = accouplements
    .filter((a) => a.statut === "en_cours" && a.dateMiseBas)
    .map((a) => ({
      ...a,
      daysRemaining: Math.ceil(
        (new Date(a.dateMiseBas!).getTime() - today.getTime()) / 86400000
      ),
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const gestationsEnCours = accouplements.filter((a) => a.statut === "en_cours").length;
  const sevrageAVenir = accouplements.filter((a) => {
    if (a.statut !== "mise_bas" || !a.dateMiseBas) return false;
    const j = Math.floor((today.getTime() - new Date(a.dateMiseBas).getTime()) / 86400000);
    return j >= 28;
  }).length;

  const healthAlerts = santeLogs
    .filter((l) => l.prochainRappel)
    .map((l) => ({
      ...l,
      daysUntil: Math.ceil(
        (new Date(l.prochainRappel!).getTime() - today.getTime()) / 86400000
      ),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const rappelsCeMois = healthAlerts.filter((h) => h.daysUntil <= 30).length;
  const recentRabbits = [...rabbits].slice(0, 5);

  // Délais d'attente actifs
  const delaisActifs = santeLogs.filter((l) => l.finDelaiAttente && new Date(l.finDelaiAttente) > today);

  // Marge alimentaire
  const depensesAlim = transactions.filter((t) => t.type === "depense" && t.categorie === "alimentation").reduce((s, t) => s + t.montant, 0);
  const recettesVente = transactions.filter((t) => t.type === "recette" && (t.categorie === "vente_lapin" || t.categorie === "vente_viande")).reduce((s, t) => s + t.montant, 0);
  const margeAlim = recettesVente - depensesAlim;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {today.toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser
          </button>
          <span className="inline-flex items-center gap-1.5 bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-forest-500 rounded-full animate-pulse" />
            Ferme active
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-forest-500" />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total lapins"
          value={totalAnimaux}
          subtitle="Effectif global"
          icon={Users}
          iconBg="bg-forest-100"
          iconColor="text-forest-600"
        />
        <StatCard
          title="Mâles"
          value={males.length}
          subtitle="dont reproducteurs"
          icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Femelles"
          value={femelles.length}
          subtitle="dont reproductrices"
          icon={Heart}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
        />
        <StatCard
          title="Lapereaux"
          value={totalLapereaux}
          subtitle={lapreauxMiseBas > 0 ? `dont ${lapreauxMiseBas} nés en portée` : "En croissance"}
          icon={Baby}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-sage-100 rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-sage-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Gestations</span>
          </div>
          <p className="text-2xl font-bold">{gestationsEnCours}</p>
          <p className="text-xs text-muted-foreground mt-0.5">En cours</p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Baby className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Sevrages</span>
          </div>
          <p className="text-2xl font-bold">{sevrageAVenir}</p>
          <p className="text-xs text-muted-foreground mt-0.5">À venir (28j)</p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Rappels santé</span>
          </div>
          <p className="text-2xl font-bold">{rappelsCeMois}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ce mois</p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-forest-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-forest-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Reproducteurs</span>
          </div>
          <p className="text-2xl font-bold">{reproducteurs.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Actifs</p>
        </div>
      </div>

      {/* Marge alimentaire GTE */}
      {transactions.length > 0 && (
        <div className={`rounded-xl border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          margeAlim >= 0 ? "bg-white border-earth-100" : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              margeAlim >= 0 ? "bg-forest-100" : "bg-red-100"
            }`}>
              <Wallet className={`h-5 w-5 ${margeAlim >= 0 ? "text-forest-600" : "text-red-600"}`} />
            </div>
            <div>
              <p className="text-sm font-semibold">Marge sur coût alimentaire (GTE)</p>
              <p className="text-xs text-muted-foreground">
                Recettes vente {recettesVente.toLocaleString("fr-FR")} F — Aliments {depensesAlim.toLocaleString("fr-FR")} F
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${margeAlim >= 0 ? "text-forest-700" : "text-red-600"}`}>
              {margeAlim >= 0 ? "+" : ""}{margeAlim.toLocaleString("fr-FR")} FCFA
            </p>
            <Link href="/rapports" className="text-xs text-forest-600 hover:underline flex items-center gap-1 justify-end">
              Détails GTE <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Alertes délais d'attente actifs */}
      {delaisActifs.length > 0 && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-bold text-red-800">⛔ {delaisActifs.length} lapin{delaisActifs.length > 1 ? "s" : ""} en délai d&apos;attente médicament</h3>
          </div>
          <div className="space-y-2">
            {delaisActifs.map((l) => {
              const fin = new Date(l.finDelaiAttente!);
              const joursRestants = Math.ceil((fin.getTime() - today.getTime()) / 86400000);
              return (
                <div key={l.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm border border-red-200">
                  <span className="font-semibold">{l.rabbit.name}</span>
                  <span className="text-xs text-red-700 font-medium">Interdit vente/abattage encore {joursRestants}j — jusqu&apos;au {fin.toLocaleDateString("fr-FR")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mortalité lapereaux */}
      {totalNes > 0 && (
        <div className={`rounded-xl border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          tauxMortalite >= 20 ? "bg-red-50 border-red-200" : tauxMortalite >= 10 ? "bg-amber-50 border-amber-200" : "bg-white border-earth-100"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              tauxMortalite >= 20 ? "bg-red-100" : tauxMortalite >= 10 ? "bg-amber-100" : "bg-earth-100"
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                tauxMortalite >= 20 ? "text-red-600" : tauxMortalite >= 10 ? "text-amber-600" : "text-earth-500"
              }`} />
            </div>
            <div>
              <p className="text-sm font-semibold">Mortalité lapereaux (portées)</p>
              <p className="text-xs text-muted-foreground">{totalNes} nés · {lapreauxMiseBas} vivants · {totalMorts} morts</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${
              tauxMortalite >= 20 ? "text-red-600" : tauxMortalite >= 10 ? "text-amber-600" : "text-forest-700"
            }`}>{tauxMortalite}%</p>
            <p className="text-xs text-muted-foreground">
              {tauxMortalite >= 20 ? "⚠️ Taux élevé" : tauxMortalite >= 10 ? "Attention" : "✅ Normal"}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Upcoming births */}
        <Card className="border-earth-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-forest-600" />
                Mises-bas à venir
              </CardTitle>
              <Link
                href="/cycle-de-vie"
                className="text-xs text-forest-600 hover:text-forest-700 font-medium flex items-center gap-1"
              >
                Voir tout
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBirths.length > 0 ? (
              upcomingBirths.map((birth) => (
                <div
                  key={birth.id}
                  className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg"
                >
                  <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Baby className="h-4 w-4 text-pink-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {birth.mere?.name}{" "}
                      <span className="text-muted-foreground font-normal">×</span>{" "}
                      {birth.pere?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Mise-bas prévue le {formatDate(birth.dateMiseBas!)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        birth.daysRemaining <= 3
                          ? "bg-red-100 text-red-700"
                          : birth.daysRemaining <= 7
                          ? "bg-amber-100 text-amber-700"
                          : "bg-forest-100 text-forest-700"
                      }`}
                    >
                      {birth.daysRemaining > 0
                        ? `J-${birth.daysRemaining}`
                        : "Aujourd'hui !"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 text-forest-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucune mise-bas à venir
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health alerts */}
        <Card className="border-earth-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Syringe className="h-4 w-4 text-sage-600" />
                Rappels santé
              </CardTitle>
              <Link
                href="/sante"
                className="text-xs text-forest-600 hover:text-forest-700 font-medium flex items-center gap-1"
              >
                Voir tout
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthAlerts.length > 0 ? (
              healthAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      alert.type === "vaccin"
                        ? "bg-forest-100"
                        : "bg-amber-100"
                    }`}
                  >
                    <Syringe
                      className={`h-4 w-4 ${
                        alert.type === "vaccin"
                          ? "text-forest-600"
                          : "text-amber-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {alert.rabbit.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {alert.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        alert.daysUntil < 0
                          ? "bg-red-100 text-red-700"
                          : alert.daysUntil <= 7
                          ? "bg-amber-100 text-amber-700"
                          : "bg-sage-100 text-sage-600"
                      }`}
                    >
                      {alert.daysUntil < 0
                        ? `En retard (${Math.abs(alert.daysUntil)}j)`
                        : formatRelativeDate(alert.prochainRappel!)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 text-forest-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucun rappel santé imminent
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent rabbits */}
      <Card className="border-earth-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Derniers lapins enregistrés
            </CardTitle>
            <Link
              href="/inventaire"
              className="text-xs text-forest-600 hover:text-forest-700 font-medium flex items-center gap-1"
            >
              Voir l&apos;inventaire complet
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-earth-100">
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Lapin
                  </th>
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                    Race
                  </th>
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Sexe
                  </th>
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Poids
                  </th>
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Statut
                  </th>
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    Cage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-50">
                {recentRabbits.map((rabbit) => (
                  <tr key={rabbit.id} className="hover:bg-cream-100 transition-colors">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🐇</span>
                        <div>
                          <p className="font-semibold text-foreground">{rabbit.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {rabbit.identifiant}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 hidden sm:table-cell">
                      <span className="text-muted-foreground">{rabbit.race}</span>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          rabbit.sexe === "male"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-pink-100 text-pink-700 border-pink-200"
                        }`}
                      >
                        {rabbit.sexe === "male" ? "♂ M" : "♀ F"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 hidden md:table-cell">
                      <span className="font-medium">{rabbit.poids} kg</span>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          rabbit.statut === "reproducteur"
                            ? "bg-sage-100 text-sage-600 border-sage-200"
                            : rabbit.statut === "actif"
                            ? "bg-forest-100 text-forest-700 border-forest-200"
                            : "bg-amber-100 text-amber-700 border-amber-200"
                        }`}
                      >
                        {rabbit.statut === "reproducteur"
                          ? "Reproducteur"
                          : rabbit.statut === "actif"
                          ? "Actif"
                          : rabbit.statut}
                      </span>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <span className="bg-earth-100 text-earth-600 text-xs font-mono px-2 py-0.5 rounded">
                        {rabbit.cageNumero}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reproduction performance */}
      {accouplements.length > 0 && (() => {
        const termines = accouplements.filter((a) => a.statut === "mise_bas" || a.statut === "sevrage");
        const tauxGestation = accouplements.length > 0
          ? Math.round((termines.length / accouplements.length) * 100) : 0;
        return (
          <Card className="border-earth-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-forest-600" />
                Statistiques de la ferme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total accouplements</span>
                    <span className="font-semibold text-forest-700">{accouplements.length}</span>
                  </div>
                  <Progress value={Math.min(accouplements.length * 10, 100)} className="h-2 bg-earth-100 [&>div]:bg-forest-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taux de gestation</span>
                    <span className="font-semibold text-sage-600">{tauxGestation}%</span>
                  </div>
                  <Progress value={tauxGestation} className="h-2 bg-earth-100 [&>div]:bg-sage-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reproducteurs actifs</span>
                    <span className="font-semibold text-amber-600">{reproducteurs.length}</span>
                  </div>
                  <Progress value={rabbits.length > 0 ? Math.round((reproducteurs.length / rabbits.length) * 100) : 0} className="h-2 bg-earth-100 [&>div]:bg-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
