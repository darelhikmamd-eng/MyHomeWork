import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.santeLog.findMany({
      orderBy: { date: "desc" },
      include: {
        rabbit: { select: { id: true, name: true, identifiant: true, race: true } },
      },
    });
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rabbitId, type, description, date, prochainRappel, delaiAttenteJours, veterinaire, cout, notes } = body;

    if (!rabbitId || !type || !description || !date) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const dateObj = new Date(date);
    const delaiJours = delaiAttenteJours ? parseInt(delaiAttenteJours) : null;
    const finDelaiAttente = delaiJours && delaiJours > 0
      ? new Date(dateObj.getTime() + delaiJours * 86400000)
      : null;

    const santeLog = await prisma.santeLog.create({
      data: {
        rabbitId,
        type,
        description,
        date: dateObj,
        prochainRappel: prochainRappel ? new Date(prochainRappel) : null,
        delaiAttenteJours: delaiJours,
        finDelaiAttente,
        veterinaire: veterinaire || null,
        cout: cout ? parseFloat(cout) : null,
        notes: notes || null,
      },
      include: {
        rabbit: { select: { id: true, name: true, identifiant: true, race: true } },
      },
    });

    return NextResponse.json(santeLog, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
