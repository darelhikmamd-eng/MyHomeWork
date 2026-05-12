import {
  Users,
  Heart,
  Baby,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Syringe,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockRabbits, mockAccouplements, mockSanteLogs, dashboardStats } from "@/lib/mock-data";
import { formatDate, formatRelativeDate, addDays } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const today = new Date();

  const upcomingBirths = mockAccouplements
    .filter((a) => a.statut === "en_cours")
    .map((a) => ({
      ...a,
      mere: mockRabbits.find((r) => r.id === a.mereId),
      pere: mockRabbits.find((r) => r.id === a.pereId),
      daysRemaining: Math.ceil(
        (new Date(a.dateMiseBas).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

  const healthAlerts = mockSanteLogs
    .filter((l) => l.prochainRappel)
    .map((l) => ({
      ...l,
      daysUntil: Math.ceil(
        (new Date(l.prochainRappel!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const recentRabbits = mockRabbits.slice(0, 5);

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
          <span className="inline-flex items-center gap-1.5 bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-forest-500 rounded-full animate-pulse" />
            Ferme active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total lapins"
          value={dashboardStats.totalRabbits}
          subtitle="Effectif global"
          icon={Users}
          iconBg="bg-forest-100"
          iconColor="text-forest-600"
          trend={{ value: 14, label: "ce mois", positive: true }}
        />
        <StatCard
          title="Mâles"
          value={dashboardStats.males}
          subtitle="Reproducteurs"
          icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Femelles"
          value={dashboardStats.femelles}
          subtitle="dont reproductrices"
          icon={Heart}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
        />
        <StatCard
          title="Lapereaux"
          value={dashboardStats.lapereaux}
          subtitle="En croissance"
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
          <p className="text-2xl font-bold">{dashboardStats.gestationsEnCours}</p>
          <p className="text-xs text-muted-foreground mt-0.5">En cours</p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Baby className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Sevrages</span>
          </div>
          <p className="text-2xl font-bold">{dashboardStats.sevrageAVenir}</p>
          <p className="text-xs text-muted-foreground mt-0.5">À venir (28j)</p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Rappels santé</span>
          </div>
          <p className="text-2xl font-bold">{dashboardStats.rappelsSante}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ce mois</p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-forest-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-forest-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Reproducteurs</span>
          </div>
          <p className="text-2xl font-bold">{dashboardStats.reproducteursActifs}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Actifs</p>
        </div>
      </div>

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
                      Mise-bas prévue le {formatDate(birth.dateMiseBas)}
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
                      {alert.rabbitName}
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
      <Card className="border-earth-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-forest-600" />
            Performance de la ferme (mois en cours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taux de survie lapereaux</span>
                <span className="font-semibold text-forest-700">87.5%</span>
              </div>
              <Progress value={87.5} className="h-2 bg-earth-100 [&>div]:bg-forest-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taux de gestation</span>
                <span className="font-semibold text-sage-600">75%</span>
              </div>
              <Progress value={75} className="h-2 bg-earth-100 [&>div]:bg-sage-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conformité sanitaire</span>
                <span className="font-semibold text-amber-600">92%</span>
              </div>
              <Progress value={92} className="h-2 bg-earth-100 [&>div]:bg-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
