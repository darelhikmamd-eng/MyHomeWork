import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/session";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return unauthorized();
  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  try {
    const logs = await prisma.santeLog.findMany({
      where: isAdmin ? {} : { rabbit: { userId } },
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
  const session = await getAuthSession();
  if (!session) return unauthorized();

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
