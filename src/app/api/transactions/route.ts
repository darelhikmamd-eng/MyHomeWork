import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/session";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return unauthorized();
  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  try {
    const transactions = await prisma.transaction.findMany({
      where: isAdmin ? {} : { userId },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const { type, categorie, montant, date, description, notes } = body;

    if (!type || !categorie || !montant || !date || !description) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type,
        categorie,
        montant: parseFloat(montant),
        date: new Date(date),
        description,
        notes: notes || null,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
