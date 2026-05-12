import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rabbits = await prisma.rabbit.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(rabbits);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération des lapins" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, identifiant, race, sexe, dateNaissance, poids, couleur, statut, cageNumero, notes } = body;

    if (!name || !identifiant || !race || !sexe || !dateNaissance) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const existing = await prisma.rabbit.findUnique({ where: { identifiant } });
    if (existing) {
      return NextResponse.json({ error: "Cet identifiant est déjà utilisé" }, { status: 409 });
    }

    const rabbit = await prisma.rabbit.create({
      data: {
        name,
        identifiant,
        race,
        sexe,
        dateNaissance: new Date(dateNaissance),
        poids: poids ? parseFloat(poids) : null,
        couleur: couleur || null,
        statut: statut || "actif",
        cageNumero: cageNumero || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(rabbit, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
