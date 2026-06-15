import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/utils";
import { MAX_FEMELLES_PAR_MALE } from "@/lib/reproduction";
import { genererTachesAccouplement } from "@/lib/taches";
import { getAuthSession, unauthorized } from "@/lib/session";

// Cast needed while Prisma IDE types are stale (dateMiseBas renamed from dateGestation)
type WithDateMiseBas<T> = Omit<T, "dateGestation"> & { dateMiseBas: Date | null };

export async function GET() {
  const session = await getAuthSession();
  if (!session) return unauthorized();
  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  try {
    const accouplements = await prisma.accouplement.findMany({
      where: isAdmin ? {} : { userId },
      orderBy: { createdAt: "desc" },
      include: {
        pere: { select: { id: true, name: true, identifiant: true, race: true } },
        mere: { select: { id: true, name: true, identifiant: true, race: true } },
      },
    });
    return NextResponse.json(accouplements);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const { pereId, mereId, dateAccouplement, couleurVulve, notes } = body;

    if (!pereId || !mereId || !dateAccouplement) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    // Avertissement métier : vulve blanche = faibles chances de réussite
    if (couleurVulve === "blanche") {
      // On autorise mais on le note dans la réponse
    }

    // Contrôle métier : un mâle ne peut pas être accouplé à plus de
    // MAX_FEMELLES_PAR_MALE femelles distinctes.
    const accouplementsDuPere = await prisma.accouplement.findMany({
      where: { pereId },
      select: { mereId: true },
    });
    const femellesDistinctes = new Set(accouplementsDuPere.map((a) => a.mereId));
    if (!femellesDistinctes.has(mereId) && femellesDistinctes.size >= MAX_FEMELLES_PAR_MALE) {
      return NextResponse.json(
        {
          error: `Quota atteint : ce mâle est déjà accouplé à ${femellesDistinctes.size} femelles distinctes (maximum autorisé : ${MAX_FEMELLES_PAR_MALE}).`,
          code: "QUOTA_FEMELLES_ATTEINT",
        },
        { status: 409 }
      );
    }

    const dateAcc = new Date(dateAccouplement);
    const dateMiseBas = addDays(dateAcc, 31);

    // Récupérer les paramètres d'élevage (ou créer les défauts)
    let params = await prisma.parametresElevage.findFirst();
    if (!params) {
      params = await prisma.parametresElevage.create({ data: {} });
    }

    const accouplement = await prisma.accouplement.create({
      data: {
        userId: session.user.id,
        pereId,
        mereId,
        dateAccouplement: dateAcc,
        dateMiseBas,
        statut: "en_cours",
        couleurVulve: couleurVulve || null,
        notes: notes || null,
      },
      include: {
        pere: { select: { id: true, name: true, identifiant: true, race: true } },
        mere: { select: { id: true, name: true, identifiant: true, race: true } },
      },
    });

    // Générer automatiquement les 5 tâches calendrier
    const tachesData = genererTachesAccouplement(accouplement.id, dateAcc, {
      rythmeReproduction: params.rythmeReproduction as "intensif" | "extensif",
      intervalleIntensif: params.intervalleIntensif,
      intervalleExtensif: params.intervalleExtensif,
    });

    await prisma.tacheElevage.createMany({ data: tachesData });

    return NextResponse.json(
      { ...accouplement, warning: couleurVulve === "blanche" ? "Vulve blanche : faibles chances de fécondation." : undefined },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
