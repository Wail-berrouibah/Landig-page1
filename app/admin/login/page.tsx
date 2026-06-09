"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [adminExists, setAdminExists] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/admin/register")
      .then((r) => r.json())
      .then((d) => setAdminExists(d.adminExists))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!adminExists) setTab("register");
  }, [adminExists]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-accent">
          Admin TechPro
        </h1>
        <p className="mt-1 text-sm text-muted">
          {tab === "login"
            ? "Connectez-vous pour accéder au tableau de bord."
            : "Créez votre compte administrateur."}
        </p>

        <div className="mt-6 flex gap-1 rounded-lg border border-border bg-bg p-1">
          <button
            onClick={() => setTab("login")}
            disabled={!adminExists}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "login"
                ? "bg-surface text-text shadow-sm"
                : "text-muted hover:text-text"
            } ${!adminExists ? "cursor-not-allowed opacity-40" : ""}`}
          >
            Se connecter
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "register"
                ? "bg-surface text-text shadow-sm"
                : "text-muted hover:text-text"
            }`}
          >
            Créer un compte
          </button>
        </div>

        {tab === "login" ? (
          <LoginTab router={router} searchParams={searchParams} />
        ) : (
          <RegisterTab router={router} />
        )}
      </div>
    </div>
  );
}

function LoginTab({
  router,
  searchParams,
}: {
  router: ReturnType<typeof useRouter>;
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur de connexion");
        return;
      }
      const redirect = searchParams.get("redirect") || "/admin";
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-text">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          autoFocus
          className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text transition-colors placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-text">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Entrez le mot de passe"
          className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text transition-colors placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

function RegisterTab({ router }: { router: ReturnType<typeof useRouter> }) {
  const [step, setStep] = useState<"form" | "code">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "send-code", email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
        return;
      }
      setStep("code");
      setResendTimer(60);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "verify", email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendTimer(60);
    setError("");
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "send-code", email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Erreur");
    } catch {
      setError("Erreur réseau.");
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={handleVerify} className="mt-6 space-y-4">
        <p className="text-sm text-muted">
          Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.
        </p>
        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium text-text">
            Code de vérification
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            autoFocus
            className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-center text-text text-2xl tracking-[8px] transition-colors placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Vérification…" : "Vérifier"}
        </button>
        <p className="text-center text-xs text-muted">
          {resendTimer > 0 ? (
            `Renvoyer dans ${resendTimer}s`
          ) : (
            <button type="button" onClick={handleResend} className="underline hover:text-text">
              Renvoyer le code
            </button>
          )}
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="mt-6 space-y-4">
      <div>
        <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-text">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          autoFocus
          className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text transition-colors placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <div>
        <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-text">
          Mot de passe
        </label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Au moins 6 caractères"
          className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text transition-colors placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <div>
        <label htmlFor="reg-confirm" className="mb-1 block text-sm font-medium text-text">
          Confirmer le mot de passe
        </label>
        <input
          id="reg-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Répétez le mot de passe"
          className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text transition-colors placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={loading || !email || !password || !confirmPassword}
        className="w-full rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Envoi…" : "Envoyer le code"}
      </button>
    </form>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-bg px-5">
        <div className="text-sm text-muted">Chargement…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
