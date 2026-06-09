"use client";

import { useState, useCallback, useEffect } from "react";
import { formatPrice } from "@/lib/config";
import type { Order } from "@/lib/data";
import StatusSelect from "./status-select";

const STATUS_OPTIONS: { value: Order["status"]; label: string; color: string }[] = [
  { value: "pending", label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  { value: "en_attente", label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "Confirmé", color: "bg-blue-100 text-blue-800" },
  { value: "confirme", label: "Confirmé", color: "bg-blue-100 text-blue-800" },
  { value: "processing", label: "En traitement", color: "bg-purple-100 text-purple-800" },
  { value: "shipped", label: "Expédié", color: "bg-indigo-100 text-indigo-800" },
  { value: "delivered", label: "Livré", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Annulé", color: "bg-red-100 text-red-800" },
  { value: "annule", label: "Annulé", color: "bg-red-100 text-red-800" },
];

function StatusBadge({ status }: { status: Order["status"] }) {
  const s = STATUS_OPTIONS.find((o) => o.value === status);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s?.color || ""}`}>
      {s?.label || status}
    </span>
  );
}

const STATUS_MAP: Record<string, string> = {
  en_attente: "pending",
  confirme: "confirmed",
  annule: "cancelled",
};

function normalizeOrder(raw: Record<string, unknown>): Order {
  return {
    id: String(raw.id ?? raw.order_number ?? ""),
    order_number: String(raw.order_number ?? ""),
    name: String(raw.full_name ?? raw.name ?? ""),
    phone: String(raw.phone_number ?? raw.phone ?? ""),
    wilaya: String(raw.wilaya ?? ""),
    commune: String(raw.commune ?? ""),
    address: String(raw.delivery_address ?? raw.address ?? ""),
    notes: String(raw.notes ?? ""),
    quantity: Number(raw.quantity ?? 1),
    total: raw.price ? Number(raw.price) * Number(raw.quantity ?? 1) : Number(raw.total ?? 0),
    date: raw.created_at ? new Date(raw.created_at as string).toLocaleDateString("fr-DZ") : String(raw.date ?? ""),
    status: (raw.status as Order["status"]) || "pending",
    payment_status: String(raw.payment_status ?? "pending"),
  };
}

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders((data.orders || []).reverse().map(normalizeOrder));
      }
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleStatusChange = useCallback(async (orderId: string, newStatus: Order["status"]) => {
    setUpdating(orderId);
    try {
      const apiStatus = STATUS_MAP[newStatus] || newStatus;
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: apiStatus }),
      });
      if (res.ok) refresh();
    } catch {}
    setUpdating(null);
  }, [refresh]);

  const handleDelete = useCallback(async (orderId: string) => {
    if (!confirm("Supprimer cette commande définitivement ?")) return;
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) refresh();
    } catch {}
    setUpdating(null);
  }, [refresh]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Commandes</h1>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted transition-colors hover:bg-accent/5 hover:text-text"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
      </div>

      <p className="mt-1 text-sm text-muted">
        {orders.length} commande{orders.length !== 1 ? "s" : ""} enregistrée{orders.length !== 1 ? "s" : ""}.
      </p>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
          Aucune commande pour le moment.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-surface overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-bg/30"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-text truncate">{order.name}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-3 text-sm text-muted shrink-0">
                  <span className="hidden sm:inline">{formatPrice(order.total)}</span>
                  <span className="text-xs">{order.date}</span>
                  <svg className={`h-5 w-5 shrink-0 transition-transform ${expandedId === order.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedId === order.id && (
                <div className="border-t border-border px-5 py-4 space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      ["Nom", order.name],
                      ["Téléphone", order.phone],
                      ["Wilaya", order.wilaya],
                      ["Commune", order.commune],
                      ["Adresse", order.address, "col-span-2"],
                    ].map(([label, value, span]) => (
                      <div key={label as string} className={span as string || ""}>
                        <span className="block text-[10px] uppercase tracking-wider text-muted/60">{label as string}</span>
                        <span className="text-text">{value as string}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      ["Réf", order.id, "text-xs text-muted"],
                      ["Quantité", order.quantity.toString()],
                      ["Total", formatPrice(order.total), "font-medium text-text"],
                      ["Date", order.date],
                    ].map(([label, value, cls]) => (
                      <div key={label as string}>
                        <span className="block text-[10px] uppercase tracking-wider text-muted/60">{label as string}</span>
                        <span className={cls as string || "text-text"}>{value as string}</span>
                      </div>
                    ))}
                    {order.notes && (
                      <div className="col-span-2">
                        <span className="block text-[10px] uppercase tracking-wider text-muted/60">Notes</span>
                        <span className="text-text">{order.notes}</span>
                      </div>
                    )}
                    <div className="col-span-2 flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted/60">Statut</span>
                        {updating === order.id ? (
                          <span className="text-xs text-muted">Mise à jour…</span>
                        ) : (
                          <StatusSelect
                            value={order.status}
                            onChange={(v) => handleStatusChange(order.id, v)}
                          />
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-error transition-colors hover:bg-error/5"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
