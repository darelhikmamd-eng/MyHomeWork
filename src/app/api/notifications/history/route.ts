import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/session";

// GET /api/notifications/history
export async function GET() {
  const session = await getAuthSession();
  if (!session) return unauthorized();
  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  try {
    const tickets = await prisma.notificationTicket.findMany({
      where: isAdmin ? { status: "resolved" } : { status: "resolved", userId },
      orderBy: { resolvedAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ tickets, count: tickets.length });
  } catch (err) {
    console.error("GET /api/notifications/history", err);
    return NextResponse.json({ tickets: [], count: 0 });
  }
}
