"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h2 className="text-2xl font-bold tracking-tight">Une erreur est survenue</h2>
      <p className="mt-2 text-sm text-muted">
        {error.message || "Quelque chose s'est mal déroulé."}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light"
      >
        Réessayer
      </button>
    </div>
  );
}
