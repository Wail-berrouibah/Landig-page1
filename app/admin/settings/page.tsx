"use client";

import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setEmail(data.email);
          setOriginalEmail(data.email);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email !== originalEmail ? email : undefined,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erreur" });
        return;
      }

      setOriginalEmail(data.email);
      setEmail(data.email);
      setCurrentPassword("");
      setNewPassword("");
      setMessage({ type: "success", text: "Paramètres mis à jour avec succès." });
    } catch {
      setMessage({ type: "error", text: "Erreur réseau." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Paramètres</h1>
      <p className="mt-1 text-sm text-muted">Modifiez votre email et mot de passe.</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-5">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-text">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text transition-colors placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-text">
            Mot de passe actuel <span className="text-error">*</span>
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Requis pour confirmer les changements"
            className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text transition-colors placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-text">
            Nouveau mot de passe
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Laisser vide pour ne pas changer"
            className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text transition-colors placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-success" : "text-error"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !currentPassword}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
