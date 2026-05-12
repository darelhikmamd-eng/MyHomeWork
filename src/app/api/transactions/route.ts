import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, categorie, montant, date, description, notes } = body;

    if (!type || !categorie || !montant || !date || !description) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
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
