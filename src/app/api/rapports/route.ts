import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Transitional type: Prisma IDE cache may still show "dateGestation"
// but the actual DB column is "dateMiseBas" after schema migration.
interface AccouplementRow {
  id: string;
  statut: string;
  dateMiseBas: Date | null;
  nombreNes: number | null;
  nombreVivants: number | null;
  dateAccouplement: Date;
  pereId: string;
  mereId: string;
  notes: string | null;
}

const COLORS = [
  "#3d7a3d", "#8b6d42", "#5a9e5a", "#a8ae9b",
  "#c9a85c", "#6b8e6b", "#b8860b", "#708090",
];

export async function GET() {
  try {
    const [allRabbits, rawAccouplements] = await Promise.all([
      prisma.rabbit.findMany(),
      prisma.accouplement.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
    const allAccouplements = rawAccouplements as unknown as AccouplementRow[];

    const total = allRabbits.length;

    // ── Répartition par statut ──────────────────────────────────────────────
    const statutMap: Record<string, number> = {};
    for (const r of allRabbits) {
      statutMap[r.statut] = (statutMap[r.statut] || 0) + 1;
    }
    const statutLabels: Record<string, string> = {
      actif: "Actifs",
      reproducteur: "Reproducteurs",
      vendu: "Vendus",
      decede: "Décédés",
    };
    const statutDistribution = Object.entries(statutMap)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        name: statutLabels[key] ?? key,
        value,
        color: key === "reproducteur" ? "#5a9e5a"
          : key === "actif" ? "#3d7a3d"
          : key === "vendu" ? "#f59e0b"
          : "#ef4444",
      }));

    // ── Répartition par race ────────────────────────────────────────────────
    const raceMap: Record<string, number> = {};
    for (const r of allRabbits) {
      raceMap[r.race] = (raceMap[r.race] || 0) + 1;
    }
    const sortedRaces = Object.entries(raceMap).sort((a, b) => b[1] - a[1]);
    const top3 = sortedRaces.slice(0, 3);
    const autresCount = sortedRaces.slice(3).reduce((sum, [, v]) => sum + v, 0);
    const raceDistribution = [
      ...top3.map(([name, value], i) => ({
        name,
        value,
        color: COLORS[i],
      })),
      ...(autresCount > 0
        ? [{ name: "Autres", value: autresCount, color: COLORS[3] }]
        : []),
    ];

    // ── KPIs ────────────────────────────────────────────────────────────────
    const decedes = allRabbits.filter((r) => r.statut === "decede").length;
    const tauxMortalite = total > 0 ? ((decedes / total) * 100).toFixed(1) : "0";

    const adultes = allRabbits.filter(
      (r) => r.poids && r.poids > 2.5 && r.statut !== "decede"
    );
    const poidsMoyenAdulte =
      adultes.length > 0
        ? (adultes.reduce((s, r) => s + (r.poids ?? 0), 0) / adultes.length).toFixed(1)
        : "—";

    const portees = allAccouplements.filter(
      (a) => a.statut === "mise_bas" && a.nombreVivants !== null
    );
    const productivite =
      portees.length > 0
        ? (
            portees.reduce((s, a) => s + (a.nombreVivants ?? 0), 0) /
            portees.length
          ).toFixed(1)
        : "—";

    const tauxGestation =
      allAccouplements.length > 0
        ? (
            (portees.length / allAccouplements.length) * 100
          ).toFixed(0) + "%"
        : "—";

    const tauxSurvie =
      portees.length > 0
        ? (() => {
            const totalNes = portees.reduce((s, a) => s + (a.nombreNes ?? 0), 0);
            const totalVivants = portees.reduce((s, a) => s + (a.nombreVivants ?? 0), 0);
            return totalNes > 0
              ? ((totalVivants / totalNes) * 100).toFixed(1) + "%"
              : "—";
          })()
        : "—";

    // ── Reproduction mensuelle (12 derniers mois) ───────────────────────────
    const now = new Date();
    const monthlyMap: Record<string, { portees: number; lapereaux: number }> = {};

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      monthlyMap[key] = { portees: 0, lapereaux: 0 };
    }

    for (const acc of allAccouplements) {
      if (acc.statut !== "mise_bas" || !acc.dateMiseBas) continue;
      const d = new Date(acc.dateMiseBas);
      const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key].portees += 1;
        monthlyMap[key].lapereaux += acc.nombreVivants ?? 0;
      }
    }

    const reproductionData = Object.entries(monthlyMap).map(([mois, v]) => ({
      mois,
      ...v,
    }));

    return NextResponse.json({
      total,
      statutDistribution,
      raceDistribution,
      kpis: {
        tauxMortalite: `${tauxMortalite}%`,
        productivite: productivite !== "—" ? `${productivite} /portée` : "—",
        poidsMoyenAdulte: poidsMoyenAdulte !== "—" ? `${poidsMoyenAdulte} kg` : "—",
        tauxGestation,
        tauxSurvie,
        nbPortees: portees.length,
        totalAccouplements: allAccouplements.length,
      },
      reproductionData,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
