import { NextRequest, NextResponse } from "next/server";

// ── Groq (free, no CC needed — console.groq.com) ─────────────────────────
async function callGroq(apiKey: string, parts: object[], textPrompt: string) {
  const content: object[] = [
    ...parts,
    { type: "text", text: textPrompt },
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "user", content }],
      max_tokens: 2048,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Erreur API Groq");
  }
  const data = await res.json();
  return data.choices[0]?.message?.content ?? null;
}

// ── Gemini fallback (v1beta, auto-pick model) ─────────────────────────────
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const NO_FREE_TIER = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.0"];
const GEMINI_PREFERRED = ["gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"];

async function pickGeminiModel(apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(`${GEMINI_BASE}/models?key=${apiKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    const available: string[] = (data.models ?? [])
      .filter((m: { supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes("generateContent")
      )
      .map((m: { name: string }) => m.name.replace("models/", ""))
      .filter((n: string) => !NO_FREE_TIER.some((s) => n.startsWith(s)));
    for (const pref of GEMINI_PREFERRED) {
      const match = available.find((a) => a === pref || a.startsWith(pref));
      if (match) return match;
    }
    return available[0] ?? null;
  } catch { return null; }
}

async function callGemini(apiKey: string, parts: object[], textPrompt: string) {
  const model = await pickGeminiModel(apiKey);
  if (!model) throw new Error("Aucun modèle Gemini disponible pour cette clé.");
  console.log("[Diagnostic] Gemini modèle :", model);
  const res = await fetch(`${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [...parts, { text: textPrompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Erreur API Gemini");
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

const SYSTEM_PROMPT = `Tu es un vétérinaire expert en cuniculture (élevage de lapins) avec 20 ans d'expérience. 
Analyse les symptômes décrits et/ou la photo du lapin présenté.

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "maladie": "Nom précis de la maladie ou problème suspecté",
  "confiance": "haute | moyenne | faible",
  "symptomes_identifies": ["symptôme 1", "symptôme 2"],
  "description": "Explication claire du diagnostic (2-3 phrases)",
  "traitements": [
    {
      "nom": "Nom du traitement",
      "description": "Comment l'administrer, dosage",
      "duree": "Durée recommandée",
      "disponibilite": "En pharmacie vétérinaire / Sans ordonnance / Sur prescription"
    }
  ],
  "urgence": "faible | moderee | haute | critique",
  "consulter_vet": true,
  "delai_consultation": "Immédiatement | Dans les 24h | Dans la semaine | Si pas d'amélioration",
  "conseils_prevention": ["conseil 1", "conseil 2"],
  "alimentation_maladie": "Régime alimentaire recommandé pendant la maladie",
  "isolation_requise": true,
  "pronostic": "Favorable | Réservé | Sévère"
}`;

export async function POST(req: NextRequest) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json(
        {
          error:
            "Aucune clé API configurée. Ajoutez GROQ_API_KEY (gratuit sur console.groq.com) ou GEMINI_API_KEY dans votre fichier .env",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { imageBase64, mimeType, description, rabbitInfo } = body;

    if (!imageBase64 && !description) {
      return NextResponse.json(
        { error: "Fournissez une photo ou une description des symptômes." },
        { status: 400 }
      );
    }

    const textPrompt = [
      SYSTEM_PROMPT,
      rabbitInfo ? `\nInformations sur le lapin : ${rabbitInfo}` : "",
      description ? `\nSymptômes décrits par l'éleveur : ${description}` : "",
      "\nFournis un diagnostic complet au format JSON demandé.",
    ]
      .filter(Boolean)
      .join("\n");

    let rawText: string | null = null;
    let lastError = "";

    // ── Groq en priorité (Llama 4 Scout Vision, gratuit) ─────────────────
    if (groqKey) {
      try {
        console.log("[Diagnostic] Utilisation de Groq (Llama 4 Scout)");
        const groqParts: object[] = [];
        if (imageBase64) {
          groqParts.push({
            type: "image_url",
            image_url: { url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}` },
          });
        }
        rawText = await callGroq(groqKey, groqParts, textPrompt);
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Erreur Groq";
        console.warn("[Diagnostic] Groq échoué :", lastError);
      }
    }

    // ── Gemini en fallback ────────────────────────────────────────────────
    if (!rawText && geminiKey) {
      try {
        console.log("[Diagnostic] Fallback sur Gemini");
        const geminiParts: object[] = [];
        if (imageBase64) {
          geminiParts.push({ inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } });
        }
        rawText = await callGemini(geminiKey, geminiParts, textPrompt);
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Erreur Gemini";
        console.warn("[Diagnostic] Gemini échoué :", lastError);
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { error: `Analyse échouée : ${lastError}` },
        { status: 502 }
      );
    }

    const diagnostic = JSON.parse(rawText);
    return NextResponse.json(diagnostic);
  } catch (err) {
    console.error("Diagnostic API error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse." },
      { status: 500 }
    );
  }
}
