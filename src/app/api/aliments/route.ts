import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const aliments = await prisma.aliment.findMany({
      orderBy: { nom: "asc" },
      include: {
        distributions: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
    });
    return NextResponse.json(aliments);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, type, unite, stockActuel, stockMin, prixUnitaire, fournisseur, notes } = body;

    if (!nom || !type) {
      return NextResponse.json({ error: "Nom et type obligatoires" }, { status: 400 });
    }

    const aliment = await prisma.aliment.create({
      data: {
        nom,
        type,
        unite: unite || "kg",
        stockActuel: parseFloat(stockActuel) || 0,
        stockMin: parseFloat(stockMin) || 5,
        prixUnitaire: prixUnitaire ? parseFloat(prixUnitaire) : null,
        fournisseur: fournisseur || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(aliment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
