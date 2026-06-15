import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/session";

// POST /api/notifications/[id]/reopen
// Rouvre un ticket précédemment fermé. La notification réapparaîtra dans la liste active.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return unauthorized();
  try {
    const { id: notificationId } = await params;

    const existing = await prisma.notificationTicket.findUnique({
      where: { notificationId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Ticket introuvable" },
        { status: 404 }
      );
    }

    // On supprime simplement le ticket : la notification redeviendra active
    // au prochain calcul, ce qui correspond au comportement attendu.
    await prisma.notificationTicket.delete({
      where: { notificationId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/notifications/[id]/reopen", err);
    return NextResponse.json(
      { error: "Erreur lors de la réouverture du ticket" },
      { status: 500 }
    );
  }
}
