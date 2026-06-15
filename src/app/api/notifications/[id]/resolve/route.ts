import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/session";

// POST /api/notifications/[id]/resolve
// Marque une notification comme effectuée (ticket fermé) avec une note de résolution.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  try {
    const { id: notificationId } = await params;
    const body = await req.json();

    const {
      type,
      titre,
      message,
      priorite,
      resolutionNote,
      rabbitId,
      rabbitName,
      alimentNom,
    } = body as {
      type: string;
      titre: string;
      message: string;
      priorite: string;
      resolutionNote?: string;
      rabbitId?: string;
      rabbitName?: string;
      alimentNom?: string;
    };

    if (!notificationId || !type || !titre) {
      return NextResponse.json(
        { error: "notificationId, type et titre sont requis" },
        { status: 400 }
      );
    }

    // Upsert : si déjà existant (réouvert puis re-fermé), on met à jour
    const ticket = await prisma.notificationTicket.upsert({
      where: { notificationId },
      create: {
        userId: session.user.id,
        notificationId,
        type,
        titre,
        message: message ?? "",
        priorite: priorite ?? "normale",
        status: "resolved",
        resolutionNote: resolutionNote ?? null,
        rabbitId: rabbitId ?? null,
        rabbitName: rabbitName ?? null,
        alimentNom: alimentNom ?? null,
        resolvedAt: new Date(),
      },
      update: {
        status: "resolved",
        resolutionNote: resolutionNote ?? null,
        resolvedAt: new Date(),
        reopenedAt: null,
      },
    });

    return NextResponse.json({ ticket });
  } catch (err) {
    console.error("POST /api/notifications/[id]/resolve", err);
    return NextResponse.json(
      { error: "Erreur lors de la fermeture du ticket" },
      { status: 500 }
    );
  }
}
