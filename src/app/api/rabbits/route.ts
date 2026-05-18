import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_FEMELLES_PAR_MALE } from "@/lib/reproduction";

export async function GET() {
  try {
    const rabbits = await prisma.rabbit.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        accouplementsMale: {
          select: { mereId: true, statut: true },
        },
      },
    });

    const enriched = rabbits.map((r) => {
      if (r.sexe !== "male") {
        // On retire la relation pour ne pas alourdir la réponse
        const { accouplementsMale: _ignore, ...rest } = r;
        void _ignore;
        return {
          ...rest,
          reproduction: null,
        };
      }
      const accs = r.accouplementsMale ?? [];
      const femelles = Array.from(new Set(accs.map((a) => a.mereId)));
      const nbPortees = accs.filter(
        (a) => a.statut === "mise_bas" || a.statut === "sevrage"
      ).length;
      const nbFemelles = femelles.length;
      const quotaAtteint = nbFemelles >= MAX_FEMELLES_PAR_MALE;
      const { accouplementsMale: _omit, ...rest } = r;
      void _omit;
      return {
        ...rest,
        reproduction: {
          maxFemelles: MAX_FEMELLES_PAR_MALE,
          nbFemellesDistinctes: nbFemelles,
          nbAccouplements: accs.length,
          nbPortees,
          quotaAtteint,
          placesRestantes: Math.max(0, MAX_FEMELLES_PAR_MALE - nbFemelles),
        },
      };
    });

    return NextResponse.json(enriched);
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
