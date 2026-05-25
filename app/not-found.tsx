export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h2 className="text-2xl font-bold tracking-tight">Page introuvable</h2>
      <p className="mt-2 text-sm text-muted">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light"
      >
        Retour à l&apos;accueil
      </a>
    </div>
  );
}
