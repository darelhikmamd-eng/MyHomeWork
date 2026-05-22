import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statut = searchParams.get("statut"); // "a_faire" | "fait" | "ignore" | null = all
    const horizon = searchParams.get("horizon"); // nombre de jours à afficher (défaut 30)

    const where: Record<string, unknown> = {};
    if (statut) where.statut = statut;

    if (horizon) {
      const limit = new Date();
      limit.setDate(limit.getDate() + parseInt(horizon));
      where.dateEcheance = { lte: limit };
    }

    const taches = await prisma.tacheElevage.findMany({
      where,
      orderBy: { dateEcheance: "asc" },
      include: {
        accouplement: {
          include: {
            mere: { select: { id: true, name: true, identifiant: true, cageNumero: true } },
            pere: { select: { id: true, name: true, identifiant: true } },
          },
        },
      },
    });

    return NextResponse.json(taches);
  } catch {
    return NextResponse.json({ error: "Erreur récupération tâches" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, statut, notes } = body;

    if (!id || !statut) {
      return NextResponse.json({ error: "id et statut requis" }, { status: 400 });
    }

    if (statut === "fait") {
      const tache = await prisma.tacheElevage.findUnique({
        where: { id },
        select: { dateEcheance: true },
      });

      if (!tache) {
        return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(tache.dateEcheance);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate.getTime() > today.getTime()) {
        return NextResponse.json(
          { error: "Cette tâche ne peut être marquée comme faite qu'à partir de sa date prévue." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.tacheElevage.update({
      where: { id },
      data: {
        statut,
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erreur mise à jour tâche" }, { status: 500 });
  }
}
