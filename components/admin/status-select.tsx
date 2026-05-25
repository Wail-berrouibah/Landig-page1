"use client";

import { useState } from "react";
import type { Order } from "@/lib/data";

const STATUSES: { value: Order["status"]; label: string; bg: string; fg: string }[] = [
  { value: "en_attente", label: "En attente", bg: "#fef9c3", fg: "#854d0e" },
  { value: "confirme", label: "Confirmé", bg: "#dcfce7", fg: "#166534" },
  { value: "annule", label: "Annulé", bg: "#fee2e2", fg: "#991b1b" },
];

export default function StatusSelect({
  value,
  onChange,
}: {
  value: Order["status"];
  onChange: (v: Order["status"]) => void;
}) {
  const [open, setOpen] = useState(false);

  const s = STATUSES.find((o) => o.value === value);
  if (!s) return null;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-full border-0 px-3 py-1 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30"
        style={{ backgroundColor: s.bg, color: s.fg }}
      >
        {s.label}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
            <div className="border-b border-border px-4 py-3 text-xs font-semibold text-muted">
              Modifier le statut
            </div>
            <div className="py-1">
              {STATUSES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-bg/50"
                  style={{
                    color: opt.fg,
                    fontWeight: opt.value === value ? 600 : 400,
                  }}
                >
                  {opt.label}
                  {opt.value === value && (
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
