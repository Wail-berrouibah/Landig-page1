"use client";

import { useState, useCallback, useEffect } from "react";
import { formatPrice } from "@/lib/config";
import type { Order } from "@/lib/data";
import StatusSelect from "./status-select";

const STATUS_OPTIONS: { value: Order["status"]; label: string; color: string }[] = [
  { value: "en_attente", label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirme", label: "Confirmé", color: "bg-green-100 text-green-800" },
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

function computeStats(orders: Order[]) {
  return {
    totalOrders: orders.length,
    enAttente: orders.filter((o) => o.status === "en_attente").length,
    confirme: orders.filter((o) => o.status === "confirme").length,
    annule: orders.filter((o) => o.status === "annule").length,
    totalRevenue: orders.filter((o) => o.status === "confirme").reduce((sum, o) => sum + o.total, 0),
    recentOrders: orders.slice(-5).reverse(),
  };
}

export default function DashboardClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);

  const stats = computeStats(orders);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleStatusChange = useCallback(async (orderId: string, newStatus: Order["status"]) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
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

  const cards = [
    { label: "Commandes totales", value: stats.totalOrders.toString(), icon: "📦" },
    { label: "En attente", value: stats.enAttente.toString(), icon: "⏳" },
    { label: "Confirmées", value: stats.confirme.toString(), icon: "✅" },
    { label: "Annulées", value: stats.annule.toString(), icon: "❌" },
    { label: "Revenu (confirmé)", value: formatPrice(stats.totalRevenue), icon: "💰" },
    { label: "Produit", value: "TechPro 15 Pro", icon: "💻" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted">Bienvenue sur l&apos;interface d&apos;administration TechPro.</p>
        </div>
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{card.icon}</span>
              <div>
                <p className="text-xs text-muted">{card.label}</p>
                <p className="text-lg font-semibold text-text">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Dernières commandes</h2>
        {stats.recentOrders.length === 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
            Aucune commande pour le moment.
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3 md:hidden">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text">{order.name}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
                    <div><span className="block text-[10px] uppercase tracking-wider text-muted/60">Téléphone</span>{order.phone}</div>
                    <div><span className="block text-[10px] uppercase tracking-wider text-muted/60">Wilaya</span>{order.wilaya}</div>
                    <div><span className="block text-[10px] uppercase tracking-wider text-muted/60">Commune</span>{order.commune}</div>
                    <div><span className="block text-[10px] uppercase tracking-wider text-muted/60">Qté</span>{order.quantity}</div>
                    <div><span className="block text-[10px] uppercase tracking-wider text-muted/60">Total</span><span className="font-medium text-text">{formatPrice(order.total)}</span></div>
                    <div><span className="block text-[10px] uppercase tracking-wider text-muted/60">Date</span>{order.date}</div>
                  </div>
                    {updating === order.id ? (
                      <div className="mt-3 border-t border-border pt-3 text-xs text-muted">Mise à jour…</div>
                    ) : (
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">Statut :</span>
                          <StatusSelect
                            value={order.status}
                            onChange={(v) => handleStatusChange(order.id, v)}
                          />
                        </div>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/5"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>

            <div className="mt-4 hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">Client</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">Téléphone</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">Wilaya</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">Commune</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">Adresse</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">Qté</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">Total</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">Date</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">Statut</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 text-text">{order.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{order.phone}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{order.wilaya}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{order.commune}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted max-w-[160px] truncate" title={order.address}>{order.address}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{order.quantity}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{order.date}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {updating === order.id ? (
                          <span className="text-xs text-muted">…</span>
                        ) : (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                            className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                              STATUS_OPTIONS.find((s) => s.value === order.status)?.color
                            }`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium text-error transition-colors hover:bg-error/5"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
