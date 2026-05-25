import { NextResponse } from "next/server";
import { updateOrderStatus, deleteOrder } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const order = updateOrderStatus(id, body.status);
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const deleted = deleteOrder(id);
    if (!deleted) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
