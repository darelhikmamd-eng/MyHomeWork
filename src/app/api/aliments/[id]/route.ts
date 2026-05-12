import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { stockActuel, stockMin, prixUnitaire, fournisseur, notes, ajustement } = body;

    const current = await prisma.aliment.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: "Aliment introuvable" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (ajustement !== undefined) data.stockActuel = Math.max(0, current.stockActuel + parseFloat(ajustement));
    if (stockActuel !== undefined) data.stockActuel = parseFloat(stockActuel);
    if (stockMin !== undefined) data.stockMin = parseFloat(stockMin);
    if (prixUnitaire !== undefined) data.prixUnitaire = prixUnitaire ? parseFloat(prixUnitaire) : null;
    if (fournisseur !== undefined) data.fournisseur = fournisseur || null;
    if (notes !== undefined) data.notes = notes || null;

    const updated = await prisma.aliment.update({ where: { id: params.id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.aliment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
