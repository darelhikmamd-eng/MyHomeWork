import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/session";

async function getOrCreate(userId: string) {
  const existing = await prisma.parametresElevage.findFirst({ where: { userId } });
  if (existing) return existing;
  return prisma.parametresElevage.create({ data: { userId } });
}

export async function GET() {
  const session = await getAuthSession();
  if (!session) return unauthorized();
  try {
    const params = await getOrCreate(session.user.id);
    return NextResponse.json(params);
  } catch {
    return NextResponse.json({ error: "Erreur récupération paramètres" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();
  try {
    const body = await req.json();
    const { rythmeReproduction, intervalleIntensif, intervalleExtensif } = body;

    const params = await getOrCreate(session.user.id);

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
