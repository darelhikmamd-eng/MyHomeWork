"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Baby,
  Heart,
  Syringe,
  Package,
  Wheat,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SmartNotification } from "@/app/api/notifications/route";

const typeConfig = {
  mise_bas:     { label: "Mise-bas",    icon: Baby,          bg: "bg-pink-100",   color: "text-pink-600",   badge: "bg-pink-100 text-pink-700 border-pink-200" },
  sevrage:      { label: "Sevrage",     icon: Baby,          bg: "bg-amber-100",  color: "text-amber-600",  badge: "bg-amber-100 text-amber-700 border-amber-200" },
  saillie:      { label: "Saillie",     icon: Heart,         bg: "bg-rose-100",   color: "text-rose-600",   badge: "bg-rose-100 text-rose-700 border-rose-200" },
  gestation:    { label: "Gestation",   icon: Heart,         bg: "bg-purple-100", color: "text-purple-600", badge: "bg-purple-100 text-purple-700 border-purple-200" },
  rappel_sante: { label: "Santé",       icon: Syringe,       bg: "bg-forest-100", color: "text-forest-600", badge: "bg-forest-100 text-forest-700 border-forest-200" },
  stock_bas:    { label: "Stock",       icon: Package,       bg: "bg-orange-100", color: "text-orange-600", badge: "bg-orange-100 text-orange-700 border-orange-200" },
  alimentation: { label: "Alimentation",icon: Wheat,         bg: "bg-yellow-100", color: "text-yellow-600", badge: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

const prioriteConfig = {
  haute:   { label: "Urgent",  color: "text-red-600",    bg: "bg-red-100",    dot: "bg-red-500" },
  normale: { label: "Normal",  color: "text-amber-600",  bg: "bg-amber-100",  dot: "bg-amber-500" },
  basse:   { label: "Info",    color: "text-forest-600", bg: "bg-forest-100", dot: "bg-forest-500" },
};

const FILTERS = [
  { key: "tous",        label: "Toutes" },
  { key: "mise_bas",    label: "Mise-bas" },
  { key: "sevrage",     label: "Sevrage" },
  { key: "saillie",     label: "Saillie" },
  { key: "gestation",   label: "Gestation" },
  { key: "rappel_sante",label: "Santé" },
  { key: "stock_bas",   label: "Stock" },
  { key: "alimentation",label: "Alimentation" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setLastUpdate(new Date());
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filter === "tous" ? notifications : notifications.filter((n) => n.type === filter);

  const urgentes = notifications.filter((n) => n.priorite === "haute").length;
  const byType: Record<string, number> = {};
  for (const n of notifications) byType[n.type] = (byType[n.type] || 0) + 1;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-forest-600" />
            Notifications intelligentes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Alertes calculées en temps réel depuis les données de la ferme
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Mis à jour : {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 bg-forest-100 hover:bg-forest-200 px-3 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={cn("rounded-xl border p-4 shadow-sm", urgentes > 0 ? "bg-red-50 border-red-200" : "bg-white border-earth-100")}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={cn("h-4 w-4", urgentes > 0 ? "text-red-500" : "text-earth-400")} />
            <span className="text-xs text-muted-foreground font-medium">Urgentes</span>
          </div>
          <p className={cn("text-2xl font-bold", urgentes > 0 ? "text-red-600" : "text-muted-foreground")}>{urgentes}</p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-forest-500" />
            <span className="text-xs text-muted-foreground font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold">{notifications.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Baby className="h-4 w-4 text-pink-500" />
            <span className="text-xs text-muted-foreground font-medium">Reproduction</span>
          </div>
          <p className="text-2xl font-bold">
            {(byType.mise_bas || 0) + (byType.sevrage || 0) + (byType.saillie || 0) + (byType.gestation || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-sage-500" />
            <span className="text-xs text-muted-foreground font-medium">Stock & Santé</span>
          </div>
          <p className="text-2xl font-bold">
            {(byType.stock_bas || 0) + (byType.rappel_sante || 0)}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full font-medium border transition-colors flex items-center gap-1.5",
              filter === f.key
                ? "bg-forest-600 text-white border-forest-600"
                : "bg-white text-muted-foreground border-earth-200 hover:border-forest-400"
            )}
          >
            {f.label}
            {f.key !== "tous" && (byType[f.key] || 0) > 0 && (
              <span className="bg-white/30 text-current px-1 rounded-full text-[10px] font-bold">
                {byType[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-forest-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-earth-100">
          <CheckCircle2 className="h-12 w-12 text-forest-300 mx-auto mb-3" />
          <p className="text-lg font-semibold text-muted-foreground">Aucune alerte</p>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === "tous" ? "Tout est en ordre sur votre ferme !" : "Aucune alerte dans cette catégorie."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => {
            const typeCfg = typeConfig[notif.type] ?? typeConfig.alimentation;
            const prioCfg = prioriteConfig[notif.priorite];
            const Icon = typeCfg.icon;
            return (
              <div
                key={notif.id}
                className={cn(
                  "bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow",
                  notif.priorite === "haute" ? "border-red-200" : "border-earth-100"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", typeCfg.bg)}>
                    <Icon className={cn("h-5 w-5", typeCfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{notif.titre}</p>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", typeCfg.badge)}>
                          {typeCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full flex-shrink-0", prioCfg.dot)} />
                        <span className={cn("text-xs font-medium", prioCfg.color)}>{prioCfg.label}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{notif.message}</p>
                    {notif.rabbitId && (
                      <Link
                        href={`/inventaire`}
                        className="inline-flex items-center gap-1 text-xs text-forest-600 hover:text-forest-800 mt-2 font-medium"
                      >
                        Voir le lapin
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                    {notif.type === "stock_bas" && (
                      <Link
                        href="/alimentation"
                        className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 mt-2 font-medium"
                      >
                        Gérer le stock
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
