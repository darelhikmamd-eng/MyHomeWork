"use client";

import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Stethoscope,
  Pill,
  ShieldAlert,
  Leaf,
  Info,
  Camera,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Rabbit {
  id: string;
  name: string;
  identifiant: string;
  race: string;
  sexe: string;
  poids: number | null;
}

interface Traitement {
  nom: string;
  description: string;
  duree: string;
  disponibilite: string;
}

interface DiagnosticResult {
  maladie: string;
  confiance: "haute" | "moyenne" | "faible";
  symptomes_identifies: string[];
  description: string;
  traitements: Traitement[];
  urgence: "faible" | "moderee" | "haute" | "critique";
  consulter_vet: boolean;
  delai_consultation: string;
  conseils_prevention: string[];
  alimentation_maladie: string;
  isolation_requise: boolean;
  pronostic: string;
}

const urgenceConfig = {
  faible:   { label: "Faible",    color: "text-forest-600",  bg: "bg-forest-100",  border: "border-forest-200" },
  moderee:  { label: "Modérée",   color: "text-amber-600",   bg: "bg-amber-100",   border: "border-amber-200" },
  haute:    { label: "Haute",     color: "text-orange-600",  bg: "bg-orange-100",  border: "border-orange-200" },
  critique: { label: "Critique",  color: "text-red-600",     bg: "bg-red-100",     border: "border-red-200" },
};

const confianceConfig = {
  haute:   { label: "Confiance élevée",  color: "text-forest-600" },
  moyenne: { label: "Confiance moyenne", color: "text-amber-600" },
  faible:  { label: "Confiance faible",  color: "text-red-600" },
};

export default function DiagnosticPage() {
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [selectedRabbit, setSelectedRabbit] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetch("/api/rabbits")
      .then((r) => r.json())
      .then(setRabbits)
      .catch(() => {});
  }, []);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 10 Mo.");
      return;
    }
    setImageFile(file);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 80);
    } catch {
      cameraInputRef.current?.click();
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        handleFile(file);
        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile && !description.trim()) {
      setError("Fournissez une photo ou une description des symptômes.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const rabbit = rabbits.find((r) => r.id === selectedRabbit);
      const rabbitInfo = rabbit
        ? `${rabbit.name} (${rabbit.identifiant}), Race: ${rabbit.race}, Sexe: ${rabbit.sexe}${rabbit.poids ? `, Poids: ${rabbit.poids} kg` : ""}`
        : null;

      let imageBase64: string | null = null;
      let mimeType: string | null = null;

      if (imageFile) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            // Extract base64 data only (without data:image/xxx;base64, prefix)
            resolve(dataUrl.split(",")[1]);
          };
          reader.readAsDataURL(imageFile);
        });
        imageBase64 = base64;
        mimeType = imageFile.type;
      }

      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType, description, rabbitInfo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'analyse.");
        return;
      }

      setResult(data);
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  const urgCfg = result ? urgenceConfig[result.urgence] ?? urgenceConfig.moderee : null;
  const confCfg = result ? confianceConfig[result.confiance] ?? confianceConfig.moyenne : null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Diagnostic IA — Détection de maladies
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Analysez la santé de vos lapins grâce à Gemini 1.5 Flash (IA vétérinaire)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection du lapin */}
          <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Informations sur le lapin</h2>

            <div className="space-y-1.5">
              <Label htmlFor="rabbit">Lapin concerné (optionnel)</Label>
              <Select
                id="rabbit"
                value={selectedRabbit}
                onChange={(e) => setSelectedRabbit(e.target.value)}
              >
                <option value="">— Sélectionner un lapin —</option>
                {rabbits.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.identifiant}) — {r.race}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Symptômes observés *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez les symptômes : comportement anormal, perte d'appétit, diarrhée, écoulements nasaux, position anormale, changement de poil, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Plus vous êtes précis, plus le diagnostic sera fiable.
              </p>
            </div>
          </div>

          {/* Upload photo */}
          <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Camera className="h-4 w-4 text-purple-600" />
              Photo du lapin (recommandée)
            </h2>

            {!imagePreview ? (
              <div className="space-y-2">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                    dragOver ? "border-purple-400 bg-purple-50" : "border-earth-200 hover:border-purple-300 hover:bg-purple-50/50"
                  )}
                >
                  <Upload className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Glissez une photo ou <span className="text-purple-600 underline">cliquez pour parcourir</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — max 10 Mo</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>

                <button
                  type="button"
                  onClick={openCamera}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 active:bg-purple-200 transition-colors text-sm font-semibold"
                >
                  <Camera className="h-4 w-4" />
                  Prendre une photo
                </button>

                {/* Fallback input pour mobile (capture="environment") */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-earth-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Photo du lapin" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-3 py-1.5">
                  {imageFile?.name}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!imageFile && !description.trim())}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyse en cours (Gemini IA)…
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                Lancer le diagnostic IA
              </>
            )}
          </button>

          {/* Info clé API */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
            <p className="text-xs text-purple-700 font-medium flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Configuration — choisissez une clé gratuite :
            </p>
            <div className="space-y-1.5 text-xs text-purple-600">
              <p>
                <span className="font-bold text-purple-800">✅ Recommandé :</span>{" "}
                <code className="bg-purple-100 px-1 rounded">GROQ_API_KEY=votre_clé</code>{" "}
                — Gratuit, sans CB, 30 req/min sur{" "}
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  console.groq.com
                </a>
              </p>
              <p>
                <span className="font-bold text-purple-800">ou :</span>{" "}
                <code className="bg-purple-100 px-1 rounded">GEMINI_API_KEY=votre_clé</code>{" "}
                — Gratuit sur{" "}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                  aistudio.google.com
                </a>
              </p>
            </div>
          </div>
        </form>

        {/* Résultats */}
        <div>
          {!result && !loading && (
            <div className="bg-white rounded-xl border border-earth-100 p-8 text-center shadow-sm h-full flex flex-col items-center justify-center">
              <Brain className="h-14 w-14 text-purple-200 mx-auto mb-4" />
              <p className="text-base font-semibold text-muted-foreground">Résultats du diagnostic</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Soumettez une photo ou décrivez les symptômes pour obtenir une analyse vétérinaire par l&apos;IA.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-xl border border-purple-200 p-8 text-center shadow-sm h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <p className="font-semibold text-purple-700">Analyse en cours…</p>
              <p className="text-sm text-muted-foreground mt-1">Gemini 1.5 Flash analyse votre cas</p>
            </div>
          )}

          {result && urgCfg && confCfg && (
            <div className="space-y-4">
              {/* Diagnostic principal */}
              <div className={cn("bg-white rounded-xl border p-5 shadow-sm", urgCfg.border)}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Diagnostic</p>
                    <h2 className="text-xl font-bold text-foreground">{result.maladie}</h2>
                  </div>
                  <div className={cn("px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5", urgCfg.bg, urgCfg.color)}>
                    <AlertTriangle className="h-4 w-4" />
                    {urgCfg.label}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-earth-100">
                  <span className={cn("text-xs font-semibold", confCfg.color)}>● {confCfg.label}</span>
                  <span className="text-xs text-muted-foreground">Pronostic : <strong>{result.pronostic}</strong></span>
                  {result.isolation_requise && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">⚠️ Isolation requise</span>
                  )}
                </div>
              </div>

              {/* Symptômes identifiés */}
              {result.symptomes_identifies?.length > 0 && (
                <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-purple-600" />
                    Symptômes identifiés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.symptomes_identifies.map((s, i) => (
                      <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Traitements */}
              {result.traitements?.length > 0 && (
                <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Pill className="h-4 w-4 text-forest-600" />
                    Traitements recommandés
                  </h3>
                  <div className="space-y-3">
                    {result.traitements.map((t, i) => (
                      <div key={i} className="bg-forest-50 border border-forest-100 rounded-lg p-3">
                        <p className="text-sm font-semibold text-forest-800">{t.nom}</p>
                        <p className="text-xs text-forest-700 mt-0.5">{t.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>⏱ {t.duree}</span>
                          <span className="text-forest-600 font-medium">{t.disponibilite}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consultation vétérinaire */}
              {result.consulter_vet && (
                <div className={cn("rounded-xl border p-4", urgCfg.bg, urgCfg.border)}>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className={cn("h-4 w-4", urgCfg.color)} />
                    <p className={cn("text-sm font-semibold", urgCfg.color)}>Consultation vétérinaire recommandée</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.delai_consultation}</p>
                </div>
              )}

              {/* Alimentation & Prévention */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.alimentation_maladie && (
                  <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Leaf className="h-3.5 w-3.5 text-forest-600" />
                      Alimentation adaptée
                    </h3>
                    <p className="text-xs text-foreground leading-relaxed">{result.alimentation_maladie}</p>
                  </div>
                )}
                {result.conseils_prevention?.length > 0 && (
                  <div className="bg-white rounded-xl border border-earth-100 p-4 shadow-sm">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-sage-600" />
                      Prévention
                    </h3>
                    <ul className="space-y-1">
                      {result.conseils_prevention.map((c, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                          <span className="text-sage-500 mt-0.5">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                ⚠️ Ce diagnostic IA est indicatif. Consultez toujours un vétérinaire pour un diagnostic définitif.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Caméra ──────────────────────────────────────────────── */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-earth-100">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Camera className="h-4 w-4 text-purple-600" />
                Prendre une photo
              </h3>
              <button
                type="button"
                onClick={closeCamera}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-earth-100 transition-colors text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Flux vidéo */}
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Viseur */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white/60 rounded-xl" />
              </div>
            </div>

            {/* Bouton capture */}
            <div className="p-4 flex gap-3">
              <button
                type="button"
                onClick={closeCamera}
                className="flex-1 py-2.5 rounded-xl border border-earth-200 text-muted-foreground hover:bg-earth-50 transition-colors text-sm font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-[2] py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Camera className="h-4 w-4" />
                Capturer la photo
              </button>
            </div>
          </div>

          {/* Canvas caché pour la capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}
