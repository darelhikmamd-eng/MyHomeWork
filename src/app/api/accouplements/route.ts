import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/utils";
import { MAX_FEMELLES_PAR_MALE } from "@/lib/reproduction";

// Cast needed while Prisma IDE types are stale (dateMiseBas renamed from dateGestation)
type WithDateMiseBas<T> = Omit<T, "dateGestation"> & { dateMiseBas: Date | null };

export async function GET() {
  try {
    const accouplements = await prisma.accouplement.findMany({
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
  try {
    const body = await req.json();
    const { pereId, mereId, dateAccouplement, notes } = body;

    if (!pereId || !mereId || !dateAccouplement) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
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

    const accouplement = await prisma.accouplement.create({
      data: {
        pereId,
        mereId,
        dateAccouplement: dateAcc,
        dateMiseBas,
        statut: "en_cours",
        notes: notes || null,
      },
      include: {
        pere: { select: { id: true, name: true, identifiant: true, race: true } },
        mere: { select: { id: true, name: true, identifiant: true, race: true } },
      },
    });

    return NextResponse.json(accouplement, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
