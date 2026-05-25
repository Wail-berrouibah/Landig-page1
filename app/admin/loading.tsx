export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-muted">
      <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      Chargement…
    </div>
  );
}
