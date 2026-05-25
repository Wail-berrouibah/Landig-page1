import { NextResponse } from "next/server";
import { createOrder } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      name: body.name,
      phone: body.phone,
      wilaya: body.wilaya,
      commune: body.commune,
      address: body.address,
      notes: body.notes || "",
      quantity: body.quantity,
      total: body.total,
      date: new Date().toLocaleDateString("fr-DZ"),
      status: "en_attente" as const,
    };
    createOrder(order);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}
