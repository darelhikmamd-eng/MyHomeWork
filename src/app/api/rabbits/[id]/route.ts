import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, identifiant, race, sexe, dateNaissance, poids, couleur, statut, cageNumero, notes } = body;

    if (!name || !identifiant || !race || !sexe || !dateNaissance) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    // Vérifie que l'identifiant n'est pas déjà pris par un autre lapin
    const conflict = await prisma.rabbit.findFirst({
      where: { identifiant, NOT: { id: params.id } },
    });
    if (conflict) {
      return NextResponse.json({ error: "Cet identifiant est déjà utilisé par un autre lapin" }, { status: 409 });
    }

    const rabbit = await prisma.rabbit.update({
      where: { id: params.id },
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

    return NextResponse.json(rabbit);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.rabbit.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
