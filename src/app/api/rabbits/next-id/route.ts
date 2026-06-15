import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/session";

// GET /api/rabbits/next-id
// Retourne le prochain identifiant LAP-XXX disponible globalement
export async function GET() {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  try {
    const rabbits = await prisma.rabbit.findMany({
      select: { identifiant: true },
    });

    const numbers = rabbits
      .map((r: { identifiant: string }) => {
        const match = r.identifiant.match(/^LAP-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n: number) => n > 0);

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextId = `LAP-${String(maxNum + 1).padStart(3, "0")}`;

    return NextResponse.json({ identifiant: nextId });
  } catch {
    return NextResponse.json({ error: "Erreur génération ID" }, { status: 500 });
  }
}
