import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/session";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return unauthorized();
  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  try {
    const distributions = await prisma.distributionAliment.findMany({
      where: isAdmin ? {} : { aliment: { userId } },
      orderBy: { date: "desc" },
      take: 100,
      include: {
        aliment: { select: { id: true, nom: true, type: true, unite: true } },
      },
    });
    return NextResponse.json(distributions);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();
  try {
    const body = await req.json();
    const { alimentId, quantite, date, cageNumero, notes } = body;

    if (!alimentId || !quantite) {
      return NextResponse.json({ error: "Aliment et quantité obligatoires" }, { status: 400 });
    }

    const qty = parseFloat(quantite);

    // Enregistrer la distribution
    const distribution = await prisma.distributionAliment.create({
      data: {
        alimentId,
        quantite: qty,
        date: date ? new Date(date) : new Date(),
        cageNumero: cageNumero || null,
        notes: notes || null,
      },
      include: {
        aliment: { select: { id: true, nom: true, type: true, unite: true } },
      },
    });

    // Déduire du stock
    await prisma.aliment.update({
      where: { id: alimentId },
      data: { stockActuel: { decrement: qty } },
    });

    return NextResponse.json(distribution, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
