"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Milk,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  X,
} from "lucide-react";
import { AddAccouplementForm } from "@/components/forms/add-accouplement-form";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RabbitRef {
  id: string;
  name: string;
  identifiant: string;
  race: string;
  sexe: string;
}

interface Accouplement {
  id: string;
  dateAccouplement: string;
  pereId: string;
  mereId: string;
  dateMiseBas: string | null;
  statut: "en_cours" | "mise_bas" | "echec";
  nombreNes: number | null;
  nombreVivants: number | null;
  notes: string | null;
  pere: RabbitRef;
  mere: RabbitRef;
}

const steps = [
  { id: "accouplement", label: "Accouplement", icon: Heart, color: "text-pink-600", bg: "bg-pink-100" },
  { id: "gestation", label: "Gestation", icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
  { id: "mise_bas", label: "Mise-bas", icon: Heart, color: "text-forest-600", bg: "bg-forest-100" },
  { id: "sevrage", label: "Sevrage", icon: Milk, color: "text-sage-600", bg: "bg-sage-100" },
];

const statutConfig = {
  en_cours: { label: "En cours", color: "bg-amber-100 text-amber-700 border-amber-200" },
  mise_bas: { label: "Mise-bas effectuée", color: "bg-forest-100 text-forest-700 border-forest-200" },
  echec: { label: "Échec", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function CycleDeViePage() {
  const [activeStep, setActiveStep] = useState("accouplement");
  const [accouplements, setAccouplements] = useState<Accouplement[]>([]);
  const [rabbits, setRabbits] = useState<RabbitRef[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  async function handleEchec(id: string) {
    await fetch(`/api/accouplements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "echec" }),
    });
    fetchData();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/accouplements/${id}`, { method: "DELETE" });
    setConfirmDel(null);
    fetchData();
  }

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [accRes, rabRes] = await Promise.all([
        fetch("/api/accouplements"),
        fetch("/api/rabbits"),
      ]);
      const accs: Accouplement[] = await accRes.json();
      const now = new Date();
      for (const acc of accs) {
        // Auto-déclencher mise-bas quand la date prévue est atteinte
        if (acc.statut === "en_cours" && acc.dateMiseBas && new Date(acc.dateMiseBas) <= now) {
          await fetch(`/api/accouplements/${acc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statut: "mise_bas" }),
          });
          acc.statut = "mise_bas";
        }
        // Corriger si mise_bas enregistrée par erreur alors que la date est encore dans le futur
        if (acc.statut === "mise_bas" && acc.dateMiseBas && new Date(acc.dateMiseBas) > now) {
          await fetch(`/api/accouplements/${acc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statut: "en_cours" }),
          });
          acc.statut = "en_cours";
        }
      }
      setAccouplements(accs);
      setRabbits(await rabRes.json());
    } catch {
      setAccouplements([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const enrichedAccouplements = accouplements.map((a) => ({
    ...a,
    daysUntilBirth: a.dateMiseBas
      ? Math.ceil((new Date(a.dateMiseBas).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
    gestationProgress: Math.min(
      100,
      Math.max(
        0,
        Math.round(
          ((Date.now() - new Date(a.dateAccouplement).getTime()) /
            (31 * 24 * 60 * 60 * 1000)) *
            100
        )
      )
    ),
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cycle de Vie</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Suivi de la reproduction et de la croissance
          </p>
        </div>
        <AddAccouplementForm rabbits={rabbits} onSuccess={fetchData} />
      </div>

      {/* Step indicator */}
      <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto scrollbar-hide gap-1">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={cn(
                "flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all flex-1 min-w-[80px]",
                activeStep === step.id
                  ? "bg-forest-600 text-white"
                  : "hover:bg-cream-100 text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  activeStep === step.id ? "bg-white/20" : step.bg
                )}
              >
                <step.icon
                  className={cn(
                    "h-5 w-5",
                    activeStep === step.id ? "text-white" : step.color
                  )}
                />
              </div>
              <span className="text-xs font-semibold whitespace-nowrap">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* VUE GESTATION */}
      {activeStep === "gestation" && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Gestations en cours ({enrichedAccouplements.filter(a => a.statut === "en_cours").length})
          </h2>
          {/* Résumé */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "En gestation", value: enrichedAccouplements.filter(a => a.statut === "en_cours").length, color: "text-amber-700", bg: "bg-amber-50" },
              { label: "Mise-bas < 7j", value: enrichedAccouplements.filter(a => a.statut === "en_cours" && a.daysUntilBirth !== null && a.daysUntilBirth >= 0 && a.daysUntilBirth <= 7).length, color: "text-red-700", bg: "bg-red-50" },
              { label: "Progression moy.", value: enrichedAccouplements.filter(a => a.statut === "en_cours").length > 0 ? Math.round(enrichedAccouplements.filter(a => a.statut === "en_cours").reduce((s, a) => s + a.gestationProgress, 0) / enrichedAccouplements.filter(a => a.statut === "en_cours").length) + "%" : "—", color: "text-forest-700", bg: "bg-forest-50" },
              { label: "Mises-bas effectuées", value: enrichedAccouplements.filter(a => a.statut === "mise_bas").length, color: "text-sage-700", bg: "bg-sage-50" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-earth-100`}>
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          {/* Tableau des gestations */}
          {enrichedAccouplements.filter(a => a.statut === "en_cours").length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-earth-100">
              <Clock className="h-10 w-10 text-earth-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune gestation en cours</p>
            </div>
          ) : (
            enrichedAccouplements.filter(a => a.statut === "en_cours").map(acc => (
              <div key={acc.id} className="bg-white rounded-xl border border-earth-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-base">🐇 {acc.mere?.name} <span className="text-xs font-mono text-muted-foreground ml-1">({acc.mere?.identifiant})</span></p>
                    <p className="text-xs text-muted-foreground">Père : {acc.pere?.name} ({acc.pere?.identifiant}) · Race : {acc.mere?.race}</p>
                  </div>
                  {acc.daysUntilBirth !== null && acc.daysUntilBirth <= 7 && acc.daysUntilBirth >= 0 && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Imminente dans {acc.daysUntilBirth}j
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="bg-cream-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Date accouplement</p>
                    <p className="font-semibold">{formatDate(acc.dateAccouplement)}</p>
                  </div>
                  <div className="bg-cream-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Mise-bas prévue</p>
                    <p className="font-semibold text-amber-700">{acc.dateMiseBas ? formatDate(acc.dateMiseBas) : "—"}</p>
                  </div>
                  <div className="bg-cream-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Jours de gestation</p>
                    <p className="font-semibold">{Math.floor((Date.now() - new Date(acc.dateAccouplement).getTime()) / 86400000)} / 31 jours</p>
                  </div>
                  <div className="bg-cream-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Jours restants</p>
                    <p className={`font-semibold ${acc.daysUntilBirth !== null && acc.daysUntilBirth <= 3 ? "text-red-600" : "text-forest-700"}`}>
                      {acc.daysUntilBirth !== null ? `J-${Math.max(0, acc.daysUntilBirth)}` : "—"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progression gestation</span>
                    <span className="font-semibold text-forest-700">{acc.gestationProgress}%</span>
                  </div>
                  <div className="h-3 bg-earth-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-forest-500 rounded-full transition-all" style={{ width: `${acc.gestationProgress}%` }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VUE MISE-BAS */}
      {activeStep === "mise_bas" && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-forest-600" />
            Mises-bas effectuées ({enrichedAccouplements.filter(a => a.statut === "mise_bas").length})
          </h2>
          {enrichedAccouplements.filter(a => a.statut === "mise_bas").length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-earth-100">
              <Heart className="h-10 w-10 text-earth-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune mise-bas enregistrée</p>
            </div>
          ) : (
            enrichedAccouplements.filter(a => a.statut === "mise_bas").map(acc => {
              const joursSevrage = acc.dateMiseBas ? Math.max(0, Math.floor((Date.now() - new Date(acc.dateMiseBas).getTime()) / 86400000)) : 0;
              return (
                <div key={acc.id} className="bg-white rounded-xl border border-earth-100 shadow-sm p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-semibold">🐇 {acc.mere?.name} <span className="text-xs font-mono text-muted-foreground">({acc.mere?.identifiant})</span></p>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-forest-100 text-forest-700 border border-forest-200">Mise-bas effectuée</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-forest-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Date mise-bas</p>
                      <p className="font-semibold">{acc.dateMiseBas ? formatDate(acc.dateMiseBas) : "—"}</p>
                    </div>
                    <div className="bg-forest-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Nés vivants</p>
                      <p className="font-semibold text-forest-700">{acc.nombreVivants ?? "—"} / {acc.nombreNes ?? "—"}</p>
                    </div>
                    <div className="bg-forest-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Sevrage dans</p>
                      <p className={`font-semibold ${joursSevrage >= 28 ? "text-amber-600" : "text-forest-700"}`}>
                        {joursSevrage >= 28 ? "À faire !" : `J${joursSevrage}/28`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VUE SEVRAGE */}
      {activeStep === "sevrage" && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Milk className="h-4 w-4 text-sage-600" />
            Sevrages à effectuer ({enrichedAccouplements.filter(a => a.statut === "mise_bas" && a.dateMiseBas && Math.floor((Date.now() - new Date(a.dateMiseBas).getTime()) / 86400000) >= 28).length})
          </h2>
          {enrichedAccouplements.filter(a => a.statut === "mise_bas").length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-earth-100">
              <Milk className="h-10 w-10 text-earth-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun sevrage à venir pour l&apos;instant</p>
            </div>
          ) : (
            enrichedAccouplements.filter(a => a.statut === "mise_bas").map(acc => {
              const jours = acc.dateMiseBas ? Math.max(0, Math.floor((Date.now() - new Date(acc.dateMiseBas).getTime()) / 86400000)) : 0;
              const urgent = jours >= 28;
              return (
                <div key={acc.id} className={`rounded-xl border shadow-sm p-5 space-y-3 ${urgent ? "bg-amber-50 border-amber-200" : "bg-white border-earth-100"}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-semibold">🐇 {acc.mere?.name} <span className="text-xs font-mono text-muted-foreground">({acc.mere?.identifiant})</span></p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${urgent ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-sage-100 text-sage-700 border-sage-200"}`}>
                      {urgent ? "⚠️ Sevrage urgent" : `J${jours}/28`}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-white rounded-lg p-3 border border-earth-100">
                      <p className="text-xs text-muted-foreground mb-0.5">Date mise-bas</p>
                      <p className="font-semibold">{acc.dateMiseBas ? formatDate(acc.dateMiseBas) : "—"}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-earth-100">
                      <p className="text-xs text-muted-foreground mb-0.5">Lapereaux vivants</p>
                      <p className="font-semibold">{acc.nombreVivants ?? "—"}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-earth-100">
                      <p className="text-xs text-muted-foreground mb-0.5">Date sevrage prévue</p>
                      <p className="font-semibold">{acc.dateMiseBas ? formatDate(new Date(new Date(acc.dateMiseBas).getTime() + 28 * 86400000).toISOString()) : "—"}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progression sevrage</span>
                      <span className="font-semibold">{Math.min(100, Math.round((jours / 28) * 100))}%</span>
                    </div>
                    <div className="h-2 bg-earth-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${urgent ? "bg-amber-500" : "bg-sage-400"}`} style={{ width: `${Math.min(100, Math.round((jours / 28) * 100))}%` }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VUE ACCOUPLEMENT (défaut) */}
      {activeStep === "accouplement" && <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-forest-600" />
          Accouplements en cours ({enrichedAccouplements.length})
        </h2>

        {enrichedAccouplements.map((acc) => {
          const statut = statutConfig[acc.statut];
          return (
            <div
              key={acc.id}
              className="bg-white rounded-xl border border-earth-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <div className="flex items-center gap-4 p-4 border-b border-earth-50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🐇</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Père</p>
                      <p className="font-semibold text-sm truncate">{acc.pere?.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{acc.pere?.identifiant}</p>
                    </div>
                  </div>
                  <Heart className="h-4 w-4 text-pink-400 flex-shrink-0 mx-1" />
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🐇</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Mère</p>
                      <p className="font-semibold text-sm truncate">{acc.mere?.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{acc.mere?.identifiant}</p>
                    </div>
                  </div>
                </div>
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0", statut.color)}>
                  {statut.label}
                </span>
              </div>

              {/* Actions */}
              {acc.statut === "en_cours" && (
                <div className="px-4 py-2 bg-cream-50 border-b border-earth-50 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEchec(acc.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Marquer échec
                  </button>
                  {confirmDel === acc.id ? (
                    <>
                      <button onClick={() => handleDelete(acc.id)} className="text-xs font-medium px-3 py-1.5 bg-red-600 text-white rounded-lg">Confirmer suppression</button>
                      <button onClick={() => setConfirmDel(null)} className="text-xs font-medium px-3 py-1.5 border border-earth-200 rounded-lg">Annuler</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDel(acc.id)} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 text-muted-foreground hover:text-red-600 border border-earth-200 rounded-lg transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                  )}
                </div>
              )}

              {/* Card body */}
              <div className="p-4 space-y-4">
                {/* Dates */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-cream-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Accouplement</p>
                    <p className="text-sm font-semibold">{formatDate(acc.dateAccouplement)}</p>
                  </div>
                  <div className="bg-cream-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {acc.statut === "mise_bas" ? "Mise-bas effectuée le" : "Mise-bas prévue"}
                    </p>
                    <p className="text-sm font-semibold">{acc.dateMiseBas ? formatDate(acc.dateMiseBas) : "—"}</p>
                  </div>
                  {acc.statut === "mise_bas" && acc.nombreNes && (
                    <div className="bg-forest-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Nés vivants</p>
                      <p className="text-sm font-semibold text-forest-700">
                        {acc.nombreVivants} / {acc.nombreNes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Gestation progress */}
                {acc.statut === "en_cours" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground text-xs">Progression gestation</span>
                      <span className="font-semibold text-xs text-forest-700">
                        {acc.gestationProgress}%{acc.daysUntilBirth !== null ? ` — J-${Math.max(0, acc.daysUntilBirth)}` : ""}
                      </span>
                    </div>
                    <div className="h-2 bg-earth-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-forest-400 to-forest-600 rounded-full transition-all"
                        style={{ width: `${acc.gestationProgress}%` }}
                      />
                    </div>
                    {acc.daysUntilBirth !== null && acc.daysUntilBirth <= 3 && acc.daysUntilBirth >= 0 && (
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        Mise-bas imminente — Préparez la maternité !
                      </div>
                    )}
                  </div>
                )}

                {/* Step flow visualization */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                  {(() => {
                    const joursSevrage = acc.statut === "mise_bas" && acc.dateMiseBas
                      ? Math.max(0, Math.floor((Date.now() - new Date(acc.dateMiseBas).getTime()) / 86400000))
                      : null;
                    const sevrageAtteint = joursSevrage !== null && joursSevrage >= 28;
                    const sevrageLabel = joursSevrage !== null
                      ? sevrageAtteint
                        ? "Sevrage (à faire)"
                        : `Sevrage (J${joursSevrage}/28)`
                      : "Sevrage (28j)";
                    return [
                      { label: "Accouplement", done: true },
                      { label: "Gestation (31j)", done: acc.statut !== "en_cours" || acc.gestationProgress >= 100 },
                      { label: "Mise-bas", done: acc.statut === "mise_bas" },
                      { label: sevrageLabel, done: sevrageAtteint },
                    ];
                  })().map((step, i, arr) => (
                    <div key={step.label} className="flex items-center gap-1 flex-shrink-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            step.done
                              ? "bg-forest-500 text-white"
                              : "bg-earth-100 text-muted-foreground"
                          )}
                        >
                          {step.done ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <span className="text-xs font-bold">{i + 1}</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                          {step.label}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-earth-300 flex-shrink-0 mb-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {enrichedAccouplements.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-earth-100">
            <Heart className="h-12 w-12 text-earth-300 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              Aucun accouplement en cours
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Enregistrez un nouvel accouplement pour commencer le suivi
            </p>
          </div>
        )}
      </div>}

    </div>
  );
}
