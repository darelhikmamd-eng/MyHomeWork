import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  detectSaison,
  SAISONS,
  genererAlertes,
  type Climat,
  type FarmStats,
} from "@/lib/saisons";

// GET /api/saisons?climat=tropical|tempere
// Retourne la saison courante, les stats de la ferme et les recommandations adaptées.
export async function GET(req: NextRequest) {
  try {
    const climatParam = req.nextUrl.searchParams.get("climat");
    const climat: Climat = climatParam === "tempere" ? "tempere" : "tropical";

    // ── Stats réelles de la ferme ────────────────────────────────────────────
    const [rabbits, accouplements] = await Promise.all([
      prisma.rabbit.findMany({
        select: { id: true, statut: true, sexe: true },
      }),
      prisma.accouplement.findMany({
        select: { statut: true, nombreNes: true, nombreVivants: true },
      }),
    ]);

    const totalAnimaux = rabbits.length;
    const nbReproducteurs = rabbits.filter((r) => r.statut === "reproducteur").length;
    const nbLapereaux = rabbits.filter(
      (r) => r.statut === "lapereau" || r.statut === "croissance"
    ).length;
    const nbDecedes = rabbits.filter((r) => r.statut === "decede").length;

    // Mortalité des portées (nés vs vivants)
    const portees = accouplements.filter(
      (a) => a.statut === "mise_bas" || a.statut === "sevrage"
    );
    const totalNes = portees.reduce((s, a) => s + (a.nombreNes ?? 0), 0);
    const totalVivants = portees.reduce((s, a) => s + (a.nombreVivants ?? 0), 0);
    const mortsPortees = Math.max(0, totalNes - totalVivants);

    // Taux global : décès cheptel + mortalité portées sur total animaux + nés
    const baseTotal = totalAnimaux + totalNes;
    const totalMorts = nbDecedes + mortsPortees;
    const tauxMortalite =
      baseTotal > 0 ? Math.round((totalMorts / baseTotal) * 1000) / 10 : 0;

    const stats: FarmStats = {
      totalAnimaux,
      tauxMortalite,
      nbReproducteurs,
      nbLapereaux,
      nbDecedes,
    };

    // ── Saison courante ──────────────────────────────────────────────────────
    const saisonId = detectSaison(new Date(), climat);
    const saison = SAISONS[saisonId];

    // ── Alertes personnalisées selon stats ───────────────────────────────────
    const alertes = genererAlertes(saison, stats);

    return NextResponse.json({
      saison,
      stats,
      alertes,
      climat,
      date: new Date().toISOString(),
    });
  } catch (err) {
    console.error("GET /api/saisons", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement des recommandations saisonnières" },
      { status: 500 }
    );
  }
}
