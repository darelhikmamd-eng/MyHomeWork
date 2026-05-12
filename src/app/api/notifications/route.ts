import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface SmartNotification {
  id: string;
  type: "mise_bas" | "sevrage" | "saillie" | "rappel_sante" | "stock_bas" | "alimentation" | "gestation";
  priorite: "haute" | "normale" | "basse";
  titre: string;
  message: string;
  dateEcheance?: string;
  rabbitName?: string;
  rabbitId?: string;
  alimentNom?: string;
}

interface AccRow {
  id: string;
  statut: string;
  dateMiseBas: Date | null;
  dateAccouplement: Date;
  nombreNes: number | null;
  nombreVivants: number | null;
  pereId: string;
  mereId: string;
  mere: { id: string; name: string; identifiant: string };
}

export async function GET() {
  try {
    const notifications: SmartNotification[] = [];
    const now = new Date();

    // ── 1. MISE-BAS IMMINENTE (dans les 5 prochains jours) ────────────────
    const accsEnCours = (await prisma.accouplement.findMany({
      where: { statut: "en_cours" },
      include: { mere: { select: { id: true, name: true, identifiant: true } } },
    })) as unknown as AccRow[];

    for (const acc of accsEnCours) {
      if (!acc.dateMiseBas) continue;
      const jours = Math.ceil(
        (new Date(acc.dateMiseBas).getTime() - now.getTime()) / 86400000
      );
      if (jours >= 0 && jours <= 5) {
        notifications.push({
          id: `mise_bas_${acc.id}`,
          type: "mise_bas",
          priorite: jours <= 1 ? "haute" : jours <= 3 ? "normale" : "basse",
          titre: `🐣 Mise-bas imminente — ${acc.mere.name}`,
          message:
            jours === 0
              ? `${acc.mere.name} (${acc.mere.identifiant}) doit mettre bas aujourd'hui ! Vérifiez le nichoir, la litière et l'eau.`
              : `${acc.mere.name} (${acc.mere.identifiant}) mettra bas dans ${jours} jour${jours > 1 ? "s" : ""}. Préparez la cage de maternité et le nichoir.`,
          dateEcheance: new Date(acc.dateMiseBas).toISOString(),
          rabbitName: acc.mere.name,
          rabbitId: acc.mere.id,
        });
      }
    }

    // ── 2. GESTATION — J14 → J28 : augmenter les rations ─────────────────
    for (const acc of accsEnCours) {
      const joursGestation = Math.floor(
        (now.getTime() - new Date(acc.dateAccouplement).getTime()) / 86400000
      );
      if (joursGestation >= 14 && joursGestation <= 28) {
        notifications.push({
          id: `gestation_ration_${acc.id}`,
          type: "gestation",
          priorite: "normale",
          titre: `🤰 Augmenter les rations — ${acc.mere.name}`,
          message: `${acc.mere.name} est à J${joursGestation} de gestation. Augmentez progressivement les granulés reproduction (+10 % tous les 5 jours) et assurez l'eau à volonté.`,
          rabbitName: acc.mere.name,
          rabbitId: acc.mere.id,
        });
      }
      // Installer nichoir à J28
      if (joursGestation === 28) {
        notifications.push({
          id: `nichoir_${acc.id}`,
          type: "gestation",
          priorite: "haute",
          titre: `🪺 Installer le nichoir — ${acc.mere.name}`,
          message: `${acc.mere.name} est à J28 de gestation. Installez le nichoir avec de la litière douce maintenant.`,
          rabbitName: acc.mere.name,
          rabbitId: acc.mere.id,
        });
      }
    }

    // ── 3. SEVRAGE RECOMMANDÉ (mise-bas > 28 jours) ───────────────────────
    const accsMiseBas = (await prisma.accouplement.findMany({
      where: { statut: "mise_bas" },
      include: { mere: { select: { id: true, name: true, identifiant: true } } },
    })) as unknown as AccRow[];

    for (const acc of accsMiseBas) {
      if (!acc.dateMiseBas) continue;
      const joursNaissance = Math.floor(
        (now.getTime() - new Date(acc.dateMiseBas).getTime()) / 86400000
      );
      if (joursNaissance >= 28 && joursNaissance <= 50) {
        const enRetard = joursNaissance >= 35;
        notifications.push({
          id: `sevrage_${acc.id}`,
          type: "sevrage",
          priorite: enRetard ? "haute" : "normale",
          titre: `🍼 Sevrage ${enRetard ? "en retard" : "recommandé"} — ${acc.mere.name}`,
          message: enRetard
            ? `Les lapereaux de ${acc.mere.name} ont ${joursNaissance} jours (J35+ = sevrage urgent). Séparez les lapereaux de la mère maintenant.`
            : `Les lapereaux de ${acc.mere.name} ont ${joursNaissance} jours. Préparez le sevrage (recommandé entre J28 et J35).`,
          rabbitName: acc.mere.name,
          rabbitId: acc.mere.id,
        });
      }
    }

    // ── 4. SAILLIE RECOMMANDÉE ────────────────────────────────────────────
    const femelles = await prisma.rabbit.findMany({
      where: { sexe: "femelle", statut: "reproducteur" },
      include: {
        accouplementsFemelle: {
          orderBy: { dateAccouplement: "desc" },
          take: 1,
        },
      },
    });

    for (const femelle of femelles) {
      const dernierAcc = femelle.accouplementsFemelle[0];
      if (!dernierAcc) {
        notifications.push({
          id: `saillie_${femelle.id}`,
          type: "saillie",
          priorite: "basse",
          titre: `💕 Saillie à planifier — ${femelle.name}`,
          message: `${femelle.name} (${femelle.identifiant}) n'a jamais été accouplée. Planifiez une saillie pour optimiser la production.`,
          rabbitName: femelle.name,
          rabbitId: femelle.id,
        });
      } else if (dernierAcc.statut !== "en_cours") {
        const joursDepuis = Math.floor(
          (now.getTime() - new Date(dernierAcc.dateAccouplement).getTime()) / 86400000
        );
        if (joursDepuis >= 42) {
          notifications.push({
            id: `saillie_${femelle.id}`,
            type: "saillie",
            priorite: joursDepuis > 90 ? "haute" : joursDepuis > 60 ? "normale" : "basse",
            titre: `💕 Saillie recommandée — ${femelle.name}`,
            message: `${femelle.name} n'a pas été accouplée depuis ${joursDepuis} jours. L'intervalle optimal est 42-56 jours entre saillies.`,
            rabbitName: femelle.name,
            rabbitId: femelle.id,
          });
        }
      }
    }

    // ── 5. RAPPELS SANTÉ (dans les 7 jours) ──────────────────────────────
    const rappelsSante = await prisma.santeLog.findMany({
      where: {
        prochainRappel: {
          gte: new Date(now.getTime() - 86400000), // inclure hier (rappels dépassés)
          lte: new Date(now.getTime() + 7 * 86400000),
        },
      },
      include: { rabbit: { select: { id: true, name: true, identifiant: true } } },
    });

    for (const rappel of rappelsSante) {
      const joursRestants = Math.ceil(
        (new Date(rappel.prochainRappel!).getTime() - now.getTime()) / 86400000
      );
      const typeLabel = { vaccin: "Vaccin", traitement: "Traitement", observation: "Suivi", veterinaire: "Consultation vét." }[rappel.type] ?? rappel.type;
      notifications.push({
        id: `rappel_${rappel.id}`,
        type: "rappel_sante",
        priorite: joursRestants <= 0 ? "haute" : joursRestants <= 2 ? "haute" : "normale",
        titre: `💉 ${typeLabel} — ${rappel.rabbit.name}`,
        message:
          joursRestants <= 0
            ? `⚠️ Rappel en retard de ${Math.abs(joursRestants)} jour(s) : ${rappel.description} pour ${rappel.rabbit.name} (${rappel.rabbit.identifiant}).`
            : `${rappel.description} pour ${rappel.rabbit.name} dans ${joursRestants} jour${joursRestants > 1 ? "s" : ""}.`,
        dateEcheance: rappel.prochainRappel?.toISOString(),
        rabbitName: rappel.rabbit.name,
        rabbitId: rappel.rabbit.id,
      });
    }

    // ── 6. STOCKS BAS ─────────────────────────────────────────────────────
    const aliments = await prisma.aliment.findMany();
    for (const aliment of aliments) {
      if (aliment.stockActuel <= aliment.stockMin) {
        const vide = aliment.stockActuel <= 0;
        notifications.push({
          id: `stock_${aliment.id}`,
          type: "stock_bas",
          priorite: vide ? "haute" : "normale",
          titre: `📦 ${vide ? "Stock épuisé" : "Stock bas"} — ${aliment.nom}`,
          message: vide
            ? `${aliment.nom} est épuisé ! Réapprovisionnez d'urgence.`
            : `Il reste ${aliment.stockActuel} ${aliment.unite} de ${aliment.nom} (seuil : ${aliment.stockMin} ${aliment.unite}). Commandez bientôt.`,
          alimentNom: aliment.nom,
        });
      }
    }

    // ── 7. ALERTES ALIMENTATION PAR HEURE ────────────────────────────────
    const heure = now.getHours();
    if (heure >= 6 && heure <= 8) {
      notifications.push({
        id: "alim_matin",
        type: "alimentation",
        priorite: "normale",
        titre: "🌅 Repas du matin",
        message: "Distribuez les granulés et renouvelez l'eau fraîche. Vérifiez les lapines allaitantes (granulés à volonté + eau indispensable).",
      });
    } else if (heure >= 11 && heure <= 13) {
      notifications.push({
        id: "alim_midi",
        type: "alimentation",
        priorite: "basse",
        titre: "🥬 Distribution verdure de midi",
        message: "Distribuez les légumes frais (carotte, chou, persil). Adultes : ~50 g/lapin. Lapereaux sevrés : ~20 g/lapin.",
      });
    } else if (heure >= 17 && heure <= 19) {
      notifications.push({
        id: "alim_soir",
        type: "alimentation",
        priorite: "normale",
        titre: "🌙 Repas du soir — foin en abondance",
        message: "Les lapins sont actifs la nuit : distribuez les granulés du soir et mettez le foin en abondance. Ils consomment 70 % de leur alimentation entre 18h et 6h.",
      });
    }

    // ── Tri par priorité ──────────────────────────────────────────────────
    const ordre: Record<string, number> = { haute: 0, normale: 1, basse: 2 };
    notifications.sort((a, b) => ordre[a.priorite] - ordre[b.priorite]);

    return NextResponse.json({ notifications, count: notifications.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ notifications: [], count: 0 });
  }
}
