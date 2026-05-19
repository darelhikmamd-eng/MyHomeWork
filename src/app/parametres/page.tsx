"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, CheckCircle2 } from "lucide-react";

interface Parametres {
  id: string;
  rythmeReproduction: string;
  intervalleIntensif: number;
  intervalleExtensif: number;
}

export default function ParametresPage() {
  const [params, setParams] = useState<Parametres | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    rythmeReproduction: "extensif",
    intervalleIntensif: 42,
    intervalleExtensif: 21,
  });

  useEffect(() => {
    fetch("/api/parametres")
      .then((r) => r.json())
      .then((data) => {
        setParams(data);
        setForm({
          rythmeReproduction: data.rythmeReproduction,
          intervalleIntensif: data.intervalleIntensif,
          intervalleExtensif: data.intervalleExtensif,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-forest-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
          <Settings className="h-5 w-5 text-forest-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Paramètres d&apos;élevage</h1>
          <p className="text-sm text-muted-foreground">Configuration globale de la ferme</p>
        </div>
      </div>

      {/* Section : Rythme de reproduction */}
      <div className="rounded-xl border border-earth-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-earth-100 bg-earth-50">
          <h2 className="font-semibold text-sm">Rythme de reproduction</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Détermine l&apos;intervalle entre la mise-bas et la prochaine saillie
          </p>
        </div>
        <div className="p-5 space-y-4">
          {/* Choix rythme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                value: "extensif",
                label: "Extensif",
                desc: "18 à 25 jours après mise-bas — moins de stress, meilleure santé",
                emoji: "🌿",
              },
              {
                value: "intensif",
                label: "Intensif",
                desc: "42 jours après mise-bas — maximise le nombre de portées/an",
                emoji: "⚡",
              },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, rythmeReproduction: opt.value }))}
                className={`text-left rounded-xl border-2 p-4 transition-colors ${
                  form.rythmeReproduction === opt.value
                    ? "border-forest-500 bg-forest-50"
                    : "border-earth-200 bg-white hover:bg-earth-50"
                }`}
              >
                <p className="text-xl mb-1">{opt.emoji}</p>
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Intervalles personnalisés */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Intervalle extensif (jours)
              </label>
              <input
                type="number"
                min={14}
                max={30}
                value={form.intervalleExtensif}
                onChange={(e) =>
                  setForm((f) => ({ ...f, intervalleExtensif: parseInt(e.target.value) || 21 }))
                }
                className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">Recommandé : 18–25j</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Intervalle intensif (jours)
              </label>
              <input
                type="number"
                min={35}
                max={60}
                value={form.intervalleIntensif}
                onChange={(e) =>
                  setForm((f) => ({ ...f, intervalleIntensif: parseInt(e.target.value) || 42 }))
                }
                className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">Recommandé : 42j</p>
            </div>
          </div>
        </div>
      </div>

      {/* Récap tâches générées */}
      <div className="rounded-xl border border-earth-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-earth-100 bg-earth-50">
          <h2 className="font-semibold text-sm">Tâches générées automatiquement</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            À chaque nouvelle saillie, ces tâches seront créées dans le calendrier
          </p>
        </div>
        <ul className="divide-y divide-earth-50">
          {[
            { icon: "🔍", label: "Palpation", detail: "J+12 (médiane 10–14j)" },
            { icon: "📦", label: "Pose boîte à nid", detail: "J+28 (évite contamination)" },
            { icon: "🐣", label: "Mise-bas prévue", detail: "J+31" },
            { icon: "🌱", label: "Sevrage", detail: "J+66 (mise-bas + 35j)" },
            {
              icon: "💞",
              label: "Retour à la saillie",
              detail: `J+${31 + (form.rythmeReproduction === "intensif" ? form.intervalleIntensif : form.intervalleExtensif)} (mise-bas + ${form.rythmeReproduction === "intensif" ? form.intervalleIntensif : form.intervalleExtensif}j — ${form.rythmeReproduction})`,
            },
          ].map((t) => (
            <li key={t.label} className="flex items-center gap-3 px-5 py-3 text-sm">
              <span className="text-lg">{t.icon}</span>
              <span className="font-medium flex-1">{t.label}</span>
              <span className="text-xs text-muted-foreground">{t.detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bouton sauvegarder */}
      <div className="flex items-center justify-between">
        {saved && (
          <span className="flex items-center gap-2 text-sm text-forest-700 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Paramètres sauvegardés
          </span>
        )}
        <div className="ml-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {params && (
        <p className="text-xs text-muted-foreground text-center">
          Dernière mise à jour : {new Date(params.id ? Date.now() : Date.now()).toLocaleDateString("fr-FR")}
        </p>
      )}
    </div>
  );
}
