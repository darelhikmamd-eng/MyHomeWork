"use client";

import { useState, useEffect, useCallback } from "react";
import { Syringe, Stethoscope, Eye, AlertTriangle, Calendar, Loader2, Trash2 } from "lucide-react";
import { AddSanteForm } from "@/components/forms/add-sante-form";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RabbitRef {
  id: string;
  name: string;
  identifiant: string;
  race: string;
}

interface SanteLog {
  id: string;
  rabbitId: string;
  type: "vaccin" | "traitement" | "observation" | "veterinaire";
  description: string;
  date: string;
  prochainRappel: string | null;
  veterinaire: string | null;
  cout: number | null;
  notes: string | null;
  rabbit: RabbitRef;
}

const typeConfig = {
  vaccin: {
    label: "Vaccin",
    icon: Syringe,
    color: "text-forest-600",
    bg: "bg-forest-100",
    badge: "bg-forest-100 text-forest-700 border-forest-200",
  },
  traitement: {
    label: "Traitement",
    icon: Stethoscope,
    color: "text-amber-600",
    bg: "bg-amber-100",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  observation: {
    label: "Observation",
    icon: Eye,
    color: "text-blue-600",
    bg: "bg-blue-100",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  veterinaire: {
    label: "Vétérinaire",
    icon: Stethoscope,
    color: "text-purple-600",
    bg: "bg-purple-100",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

const types = ["Tous", "vaccin", "traitement", "observation", "veterinaire"];

export default function SantePage() {
  const [selectedType, setSelectedType] = useState("Tous");
  const [logs, setLogs] = useState<SanteLog[]>([]);
  const [rabbits, setRabbits] = useState<RabbitRef[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  async function handleDelete(id: string) {
    await fetch(`/api/sante/${id}`, { method: "DELETE" });
    setConfirmDel(null);
    fetchData();
  }

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [santeRes, rabRes] = await Promise.all([
        fetch("/api/sante"),
        fetch("/api/rabbits"),
      ]);
      setLogs(await santeRes.json());
      setRabbits(await rabRes.json());
    } catch {
      setLogs([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = logs.filter(
    (l) => selectedType === "Tous" || l.type === selectedType
  );

  const upcomingAlerts = logs
    .filter((l) => l.prochainRappel)
    .map((l) => ({
      ...l,
      daysUntil: Math.ceil(
        (new Date(l.prochainRappel!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a: { daysUntil: number }, b: { daysUntil: number }) => a.daysUntil - b.daysUntil);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Santé</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Journal des soins et rappels de santé
          </p>
        </div>
        <AddSanteForm rabbits={rabbits} onSuccess={fetchData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Alerts */}
        <div className="lg:col-span-1">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Rappels à venir
          </h2>
          <div className="space-y-3">
            {upcomingAlerts.map((alert: SanteLog & { daysUntil: number }) => {
              const cfg = typeConfig[alert.type];
              return (
                <div
                  key={alert.id}
                  className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", cfg.bg)}>
                      <cfg.icon className={cn("h-4 w-4", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{alert.rabbit.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(alert.prochainRappel!)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full border",
                        alert.daysUntil < 0
                          ? "bg-red-100 text-red-700 border-red-200"
                          : alert.daysUntil <= 7
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-forest-100 text-forest-700 border-forest-200"
                      )}
                    >
                      {alert.daysUntil < 0
                        ? `En retard de ${Math.abs(alert.daysUntil)} jour(s)`
                        : formatRelativeDate(alert.prochainRappel!)}
                    </span>
                  </div>
                </div>
              );
            })}
            {upcomingAlerts.length === 0 && (
              <div className="bg-white rounded-xl border border-earth-100 p-6 text-center">
                <Syringe className="h-8 w-8 text-earth-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucun rappel à venir
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Log */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-forest-600" />
              Journal des soins
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {types.map((t) => {
              const cfg = t !== "Tous" ? typeConfig[t as keyof typeof typeConfig] : null;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium border transition-colors flex items-center gap-1.5",
                    selectedType === t
                      ? "bg-forest-600 text-white border-forest-600"
                      : "bg-white text-muted-foreground border-earth-200 hover:border-forest-400"
                  )}
                >
                  {cfg && <cfg.icon className="h-3 w-3" />}
                  {t === "Tous" ? "Tous les soins" : cfg?.label}
                </button>
              );
            })}
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {loadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-forest-500" />
              </div>
            ) : null}
            {!loadingData && filtered.map((log) => {
              const cfg = typeConfig[log.type];
              return (
                <div
                  key={log.id}
                  className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg)}>
                      <cfg.icon className={cn("h-5 w-5", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base">🐇</span>
                            <p className="font-semibold text-sm">{log.rabbit.name}</p>
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", cfg.badge)}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {log.rabbit.identifiant} — {log.rabbit.race}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <p className="text-xs font-medium text-muted-foreground">{formatDate(log.date)}</p>
                          {confirmDel === log.id ? (
                            <>
                              <button onClick={() => handleDelete(log.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg">Oui</button>
                              <button onClick={() => setConfirmDel(null)} className="text-xs px-2 py-1 border border-earth-200 rounded-lg">Non</button>
                            </>
                          ) : (
                            <button onClick={() => setConfirmDel(log.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors" title="Supprimer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-foreground mt-2">{log.description}</p>
                      {log.prochainRappel && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Calendar className="h-3.5 w-3.5 text-forest-500" />
                          <span className="text-xs text-forest-600 font-medium">
                            Rappel: {formatDate(log.prochainRappel)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!loadingData && filtered.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-earth-100">
                <Stethoscope className="h-10 w-10 text-earth-300 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  Aucun soin enregistré pour ce filtre
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
