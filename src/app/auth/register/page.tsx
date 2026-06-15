"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Rabbit, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "", inviteCode: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username,
        email: form.email || undefined,
        password: form.password,
        inviteCode: form.inviteCode || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur lors de l'inscription.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full">
          <CheckCircle2 className="h-14 w-14 text-forest-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-forest-900 mb-2">Compte créé !</h2>
          <p className="text-sm text-muted-foreground">Redirection vers la connexion…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-400 rounded-2xl shadow-lg mb-4">
            <Rabbit className="h-8 w-8 text-forest-800" />
          </div>
          <h1 className="text-3xl font-bold text-cream-50">CuniGestion</h1>
          <p className="text-sage-300 mt-1 text-sm">Créez votre compte éleveur</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-forest-900 mb-1">Inscription</h2>
          <p className="text-sm text-muted-foreground mb-6">Rejoignez la plateforme</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-800 mb-1.5">
                Nom d&apos;utilisateur <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                required
                minLength={3}
                maxLength={30}
                placeholder="votre_nom_eleveur"
                className="w-full px-4 py-3 rounded-xl border border-earth-200 bg-cream-50 text-forest-900 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1">Entre 3 et 30 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-800 mb-1.5">
                Email <span className="text-muted-foreground text-xs">(optionnel)</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full px-4 py-3 rounded-xl border border-earth-200 bg-cream-50 text-forest-900 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-800 mb-1.5">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={6}
                  placeholder="Au moins 6 caractères"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-earth-200 bg-cream-50 text-forest-900 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-forest-700 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-800 mb-1.5">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                required
                placeholder="Répétez votre mot de passe"
                className="w-full px-4 py-3 rounded-xl border border-earth-200 bg-cream-50 text-forest-900 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Code admin optionnel */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-forest-700 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {showInvite ? "Masquer le code administrateur" : "Vous avez un code administrateur ?"}
              </button>
              {showInvite && (
                <input
                  type="password"
                  value={form.inviteCode}
                  onChange={(e) => update("inviteCode", e.target.value)}
                  placeholder="Code administrateur"
                  className="mt-2 w-full px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-forest-900 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-sm"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création du compte…
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà inscrit ?{" "}
            <Link href="/auth/login" className="text-forest-600 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-sage-400 mt-6">
          © {new Date().getFullYear()} CuniGestion — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
