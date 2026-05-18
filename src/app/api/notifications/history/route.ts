import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/notifications/history
// Retourne la liste des tickets de notification résolus (historique).
export async function GET() {
  try {
    const tickets = await prisma.notificationTicket.findMany({
      where: { status: "resolved" },
      orderBy: { resolvedAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ tickets, count: tickets.length });
  } catch (err) {
    console.error("GET /api/notifications/history", err);
    return NextResponse.json({ tickets: [], count: 0 });
  }
}
