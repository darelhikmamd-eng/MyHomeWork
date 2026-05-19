import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getOrCreate() {
  const existing = await prisma.parametresElevage.findFirst();
  if (existing) return existing;
  return prisma.parametresElevage.create({ data: {} });
}

export async function GET() {
  try {
    const params = await getOrCreate();
    return NextResponse.json(params);
  } catch {
    return NextResponse.json({ error: "Erreur récupération paramètres" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { rythmeReproduction, intervalleIntensif, intervalleExtensif } = body;

    const params = await getOrCreate();

    const updated = await prisma.parametresElevage.update({
      where: { id: params.id },
      data: {
        ...(rythmeReproduction !== undefined && { rythmeReproduction }),
        ...(intervalleIntensif !== undefined && { intervalleIntensif: parseInt(intervalleIntensif) }),
        ...(intervalleExtensif !== undefined && { intervalleExtensif: parseInt(intervalleExtensif) }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erreur mise à jour paramètres" }, { status: 500 });
  }
}
