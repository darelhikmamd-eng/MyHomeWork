import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PoidsLog } from "@prisma/client";

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
    const [allRabbits, rawAccouplements, allPoidsLogs, allTransactions, allLapereaux, allDistributions] = await Promise.all([
      prisma.rabbit.findMany(),
      prisma.accouplement.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.poidsLog.findMany({ orderBy: { date: "asc" } }) as Promise<PoidsLog[]>,
      prisma.transaction.findMany(),
      prisma.lapereau.findMany({ select: { statut: true, accouplementId: true, causeDeces: true } }),
      prisma.distributionAliment.findMany({ select: { quantite: true, aliment: { select: { prixUnitaire: true } } } }),
    ]);
    const allAccouplements = rawAccouplements as unknown as AccouplementRow[];

    // Map rapide rabbitId -> dateNaissance pour la courbe réelle
    const rabbitBirthMap = new Map(allRabbits.map((r) => [r.id, new Date(r.dateNaissance).getTime()]));

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

    const decedes = allRabbits.filter((r) => r.statut === "decede").length;

    // ── KPIs ────────────────────────────────────────────────────────────────
    // Taux de mortalite = mortalite a la naissance (meme calcul que tableau de bord)
    const porteesKpi = allAccouplements.filter((a) => a.statut === "mise_bas");
    const totalNesKpi = porteesKpi.reduce((s, a) => s + (a.nombreNes ?? 0), 0);
    const totalVivantsKpi = porteesKpi.reduce((s, a) => s + (a.nombreVivants ?? 0), 0);
    const mortsNesKpi = totalNesKpi - totalVivantsKpi;
    const tauxMortalite = totalNesKpi > 0 ? ((mortsNesKpi / totalNesKpi) * 100).toFixed(1) : "0";

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

    // ── Mortalité segmentée (GTE) ────────────────────────────────────────────
    const toutesPortees = allAccouplements.filter((a) => a.statut === "mise_bas");
    const totalNesPortees = toutesPortees.reduce((s, a) => s + (a.nombreNes ?? 0), 0);
    const totalVivantsPortees = toutesPortees.reduce((s, a) => s + (a.nombreVivants ?? 0), 0);
    const mortsNes = toutesPortees.reduce(
      (s, a) => s + Math.max(0, (a.nombreNes ?? 0) - (a.nombreVivants ?? 0)),
      0
    );
    // Mortalité sous la mère = lapereaux morts / nés vivants × 100
    const lapereauxMorts = allLapereaux.filter((l) => l.statut === "mort").length;
    const tauxMortSousLaMere = totalVivantsPortees > 0
      ? ((lapereauxMorts / totalVivantsPortees) * 100).toFixed(1)
      : "0";
    // Taux de mortalité segmenté
    const tauxMortNes = totalNesPortees > 0 ? ((mortsNes / totalNesPortees) * 100).toFixed(1) : "0";
    const tauxMortAdultes = total > 0 ? ((decedes / total) * 100).toFixed(1) : "0";

    // ── GMQ moyen depuis les pesées ──────────────────────────────────────────
    // Regroupe les pesées par lapin et calcule la progression
    const poidsParLapin: Record<string, PoidsLog[]> = {};
    for (const p of allPoidsLogs) {
      if (!poidsParLapin[p.rabbitId]) poidsParLapin[p.rabbitId] = [];
      poidsParLapin[p.rabbitId].push(p);
    }
    const gmqValues: number[] = [];
    for (const logs of Object.values(poidsParLapin)) {
      if (logs.length < 2) continue;
      const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const jours = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000;
      if (jours > 0) {
        const gmq = ((last.poids - first.poids) * 1000) / jours; // en grammes/jour
        if (gmq > 0) gmqValues.push(gmq);
      }
    }
    const gmqMoyen =
      gmqValues.length > 0
        ? (gmqValues.reduce((s, v) => s + v, 0) / gmqValues.length).toFixed(0) + " g/j"
        : "—";

    // ── Taux de survie pré-sevrage (GTE) ────────────────────────────────────
    // Formule : Nombre de lapereaux sevrés / Nombre de lapereaux nés vivants × 100
    const lapereaux_sevres = allLapereaux.filter((l) => l.statut === "sevre").length;
    const totalNesVivantsPortees = portees.reduce((s, a) => s + (a.nombreVivants ?? 0), 0);
    const tauxSurviePresevrage =
      totalNesVivantsPortees > 0
        ? ((lapereaux_sevres / totalNesVivantsPortees) * 100).toFixed(1) + "%"
        : "—";

    // ── Indice de Consommation (IC) ──────────────────────────────────────────
    // Formule : Quantité totale aliment consommée (kg) / Gain de poids total (kg)
    // Référence industrielle : 3,38 – 3,48
    const totalAlimentKg = allDistributions.reduce((s, d) => s + d.quantite, 0);
    const totalGainPoids = gmqValues.reduce((s, gmq) => {
      // gmq est en g/j, on a la durée d'observation dans les logs
      // On recalcule depuis les logs directement
      return s + gmq;
    }, 0);
    // Calcul depuis les logs de poids : somme des gains en kg
    let gainPoidsTotal = 0;
    for (const logs of Object.values(poidsParLapin)) {
      if (logs.length < 2) continue;
      const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const gain = sorted[sorted.length - 1].poids - sorted[0].poids;
      if (gain > 0) gainPoidsTotal += gain;
    }
    const indiceConsommation =
      gainPoidsTotal > 0 && totalAlimentKg > 0
        ? (totalAlimentKg / gainPoidsTotal).toFixed(2)
        : "—";
    const icValeur = gainPoidsTotal > 0 && totalAlimentKg > 0 ? totalAlimentKg / gainPoidsTotal : null;
    const icConforme = icValeur !== null ? icValeur >= 3.38 && icValeur <= 3.48 : null;

    void totalGainPoids; // éviter warning lint

    // ── Courbe de croissance réelle (kg) ────────────────────────────────────
    const poidsParSemaine: Record<number, number[]> = {};
    for (const log of allPoidsLogs) {
      const birthTs = rabbitBirthMap.get(log.rabbitId) as number | undefined;
      if (!birthTs) continue;
      const ageJours = (new Date(log.date).getTime() - birthTs) / 86400000;
      const ageSemaines = Math.round(ageJours / 7);
      if (ageSemaines >= 0 && ageSemaines <= 20) {
        if (!poidsParSemaine[ageSemaines]) poidsParSemaine[ageSemaines] = [];
        poidsParSemaine[ageSemaines].push(log.poids);
      }
    }
    const croissanceReelle = Object.entries(poidsParSemaine)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([semaine, poids]) => ({
        semaine: `S${semaine}`,
        poidsMoyen: Math.round((poids.reduce((s: number, p: number) => s + p, 0) / poids.length) * 100) / 100,
        nbPesees: poids.length,
      }));

    // ── Marge sur coût alimentaire ────────────────────────────────────────────
    const depensesAlim = allTransactions
      .filter((t) => t.type === "depense" && t.categorie === "alimentation")
      .reduce((s, t) => s + t.montant, 0);
    const recettesVente = allTransactions
      .filter((t) => t.type === "recette" && (t.categorie === "vente_lapin" || t.categorie === "vente_viande"))
      .reduce((s, t) => s + t.montant, 0);
    const margeAlimentaire = recettesVente - depensesAlim;

    // ── Lapins actifs reproducteurs femelles pour marge/femelle/an ───────────
    const nbFemellesRepro = allRabbits.filter(
      (r) => r.sexe === "femelle" && r.statut === "reproducteur"
    ).length;
    const margeParFemelle =
      nbFemellesRepro > 0
        ? Math.round(margeAlimentaire / nbFemellesRepro).toLocaleString("fr-FR") + " FCFA"
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
      gte: {
        mortaliteSegmentee: {
          mortsNes: Number(tauxMortNes),
          sousLaMere: totalVivantsPortees > 0 ? Number(tauxMortSousLaMere) : 0,
          adultes: Number(tauxMortAdultes),
          totalMortsPortees: totalNesPortees - totalVivantsPortees,
          totalNes: totalNesPortees,
          normeProf: 5.0,
        },
        gmqMoyen,
        nbPesees: allPoidsLogs.length,
        tauxSurviePresevrage: {
          valeur: tauxSurviePresevrage,
          lapereaux_sevres,
          nés_vivants: totalNesVivantsPortees,
          cible: "≥ 85%",
          conforme: totalNesVivantsPortees > 0 ? (lapereaux_sevres / totalNesVivantsPortees) >= 0.85 : null,
        },
        indiceConsommation: {
          valeur: indiceConsommation,
          totalAlimentKg: Math.round(totalAlimentKg * 100) / 100,
          gainPoidsKg: Math.round(gainPoidsTotal * 100) / 100,
          cible: "3,38 – 3,48",
          conforme: icConforme,
        },
        margeAlimentaire: {
          valeur: Math.round(margeAlimentaire),
          recettesVente: Math.round(recettesVente),
          depensesAlim: Math.round(depensesAlim),
          parFemelle: margeParFemelle,
          nbFemellesRepro,
          positif: margeAlimentaire >= 0,
        },
      },
      croissanceReelle,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
