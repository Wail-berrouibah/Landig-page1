"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Commandes", icon: "📦" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-bg">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-surface transition-transform md:relative md:w-60 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5 md:py-4">
          <span className="text-lg font-semibold tracking-tight text-accent">
            TechPro Admin
          </span>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-accent/5 hover:text-text md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-colors md:text-sm md:py-2.5 ${
                  active
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-muted hover:bg-accent/5 hover:text-text"
                }`}
              >
                <span aria-hidden="true" className="text-xl md:text-base">{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base text-muted transition-colors hover:bg-error/5 hover:text-error md:text-sm md:py-2.5"
          >
            <span aria-hidden="true" className="text-xl md:text-base">🚪</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1">
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-accent/5 hover:text-text"
            aria-label="Ouvrir le menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-accent">TechPro Admin</span>
          <div className="w-10" />
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
