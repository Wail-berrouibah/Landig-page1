"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center bg-bg px-5 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Erreur critique</h1>
        <p className="mt-2 text-sm text-muted">
          {error.message || "Une erreur inattendue s'est produite."}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light"
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
