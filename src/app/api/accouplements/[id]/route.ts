import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { statut, nombreNes, nombreVivants, dateMiseBas, notes } = body;

    const data: Record<string, unknown> = {};
    if (statut !== undefined) data.statut = statut;
    if (nombreNes !== undefined) data.nombreNes = nombreNes ? parseInt(nombreNes) : null;
    if (nombreVivants !== undefined) data.nombreVivants = nombreVivants ? parseInt(nombreVivants) : null;
    if (dateMiseBas !== undefined) data.dateMiseBas = dateMiseBas ? new Date(dateMiseBas) : null;
    if (notes !== undefined) data.notes = notes || null;

    const acc = await prisma.accouplement.update({ where: { id: params.id }, data });
    return NextResponse.json(acc);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.accouplement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
