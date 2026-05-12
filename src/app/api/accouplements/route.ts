import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/utils";

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
