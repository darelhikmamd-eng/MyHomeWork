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
  CheckCircle,
  X,
  History,
  RotateCcw,
  MessageSquare,
  Clock,
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

interface ResolvedTicket {
  id: string;
  notificationId: string;
  type: string;
  titre: string;
  message: string;
  priorite: string;
  resolutionNote: string | null;
  resolvedAt: string;
  rabbitId: string | null;
  rabbitName: string | null;
  alimentNom: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [history, setHistory] = useState<ResolvedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");
  const [view, setView] = useState<"active" | "history">("active");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [resolveModal, setResolveModal] = useState<SmartNotification | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolveLoading, setResolveLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resActive, resHistory] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/notifications/history"),
      ]);
      const dataActive = await resActive.json();
      const dataHistory = await resHistory.json();
      setNotifications(dataActive.notifications ?? []);
      setHistory(dataHistory.tickets ?? []);
      setLastUpdate(new Date());
    } catch {
      setNotifications([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResolve = async () => {
    if (!resolveModal) return;
    setResolveLoading(true);
    try {
      const res = await fetch(
        `/api/notifications/${encodeURIComponent(resolveModal.id)}/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: resolveModal.type,
            titre: resolveModal.titre,
            message: resolveModal.message,
            priorite: resolveModal.priorite,
            resolutionNote: resolutionNote.trim() || null,
            rabbitId: resolveModal.rabbitId,
            rabbitName: resolveModal.rabbitName,
            alimentNom: resolveModal.alimentNom,
          }),
        }
      );
      if (!res.ok) throw new Error("resolve failed");
      setResolveModal(null);
      setResolutionNote("");
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la fermeture du ticket");
    } finally {
      setResolveLoading(false);
    }
  };

  const handleReopen = async (notificationId: string) => {
    if (!confirm("Rouvrir ce ticket ? La notification réapparaîtra dans la liste active.")) return;
    try {
      const res = await fetch(
        `/api/notifications/${encodeURIComponent(notificationId)}/reopen`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("reopen failed");
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réouverture du ticket");
    }
  };

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
          <span className="text-xs text-muted-foreground hidden sm:inline">
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

      {/* Onglets Actifs / Historique */}
      <div className="flex gap-2 border-b border-earth-200">
        <button
          onClick={() => setView("active")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            view === "active"
              ? "border-forest-600 text-forest-700"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Bell className="h-4 w-4" />
          Tickets actifs
          {notifications.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setView("history")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            view === "history"
              ? "border-forest-600 text-forest-700"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="h-4 w-4" />
          Historique
          {history.length > 0 && (
            <span className="bg-earth-200 text-earth-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      {view === "active" && (
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
      )}

      {/* Filtres */}
      {view === "active" && (
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
      )}

      {/* Liste */}
      {view === "active" && (loading ? (
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

                    {/* Action : marquer comme effectué (fermer le ticket) */}
                    <div className="mt-3 pt-3 border-t border-earth-100 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                        Ticket #{notif.id.slice(0, 12)}
                      </span>
                      <button
                        onClick={() => { setResolveModal(notif); setResolutionNote(""); }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-700 bg-forest-100 hover:bg-forest-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Marquer comme effectué
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* VUE HISTORIQUE (tickets fermés) */}
      {view === "history" && !loading && (
        history.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-earth-100">
            <History className="h-12 w-12 text-earth-300 mx-auto mb-3" />
            <p className="text-lg font-semibold text-muted-foreground">Aucun ticket fermé</p>
            <p className="text-sm text-muted-foreground mt-1">
              Les tickets que vous marquez comme effectués apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((ticket) => {
              const typeCfg = typeConfig[ticket.type as keyof typeof typeConfig] ?? typeConfig.alimentation;
              const Icon = typeCfg.icon;
              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl border border-forest-100 shadow-sm p-4 opacity-90"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-forest-100">
                      <CheckCircle2 className="h-5 w-5 text-forest-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm line-through text-muted-foreground">{ticket.titre}</p>
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", typeCfg.badge)}>
                            <Icon className="inline h-3 w-3 mr-1" />
                            {typeCfg.label}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-forest-100 text-forest-700 border-forest-200">
                            ✓ FERMÉ
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.resolvedAt).toLocaleString("fr-FR", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{ticket.message}</p>

                      {ticket.resolutionNote && (
                        <div className="mt-2 bg-forest-50 border-l-2 border-forest-400 rounded-r-lg px-3 py-2 flex gap-2">
                          <MessageSquare className="h-4 w-4 text-forest-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] uppercase font-semibold text-forest-700">Note de résolution</p>
                            <p className="text-sm text-forest-800">{ticket.resolutionNote}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-earth-100 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                          Ticket #{ticket.notificationId.slice(0, 12)}
                        </span>
                        <button
                          onClick={() => handleReopen(ticket.notificationId)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Rouvrir le ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* MODAL : fermer un ticket */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-start justify-between p-5 border-b border-earth-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-forest-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Fermer le ticket</h3>
                  <p className="text-xs text-muted-foreground">Confirmer que la tâche a été effectuée</p>
                </div>
              </div>
              <button
                onClick={() => { setResolveModal(null); setResolutionNote(""); }}
                className="p-1.5 hover:bg-earth-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-earth-50 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                  Tâche concernée
                </p>
                <p className="font-semibold text-sm">{resolveModal.titre}</p>
                <p className="text-xs text-muted-foreground mt-1">{resolveModal.message}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Note de résolution <span className="text-muted-foreground font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Ex : Saillie effectuée avec succès le 15/05, accouplement enregistré."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setResolveModal(null); setResolutionNote(""); }}
                  disabled={resolveLoading}
                  className="flex-1 px-4 py-2 text-sm border border-earth-200 rounded-lg hover:bg-earth-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleResolve}
                  disabled={resolveLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-forest-600 hover:bg-forest-700 text-white rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {resolveLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {resolveLoading ? "Fermeture..." : "Confirmer la fermeture"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
