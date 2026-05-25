export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h2 className="text-2xl font-bold tracking-tight">Page introuvable</h2>
      <p className="mt-2 text-sm text-muted">
        La page demandée n&apos;existe pas dans l&apos;interface d&apos;administration.
      </p>
      <a
        href="/admin"
        className="mt-6 inline-flex items-center rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light"
      >
        Tableau de bord
      </a>
    </div>
  );
}
