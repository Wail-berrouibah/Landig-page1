import { CONFIG } from "@/lib/config";

const BENEFIT_ICONS: Record<string, React.ReactNode> = {
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  screen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  laptop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M2 18h20" />
      <path d="M6 18v-2" />
      <path d="M18 18v-2" />
    </svg>
  ),
  plug: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 22s-8-4-8-10V5l8-3 8 3v7c0 6-8 10-8 10z" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
    </svg>
  ),
};

export default function WhyThisModel() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:py-20">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        Pourquoi ce modèle ?
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {CONFIG.benefits.map((b, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-sm"
          >
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/5"
              aria-hidden="true"
            >
              {BENEFIT_ICONS[b.icon]}
            </span>
            <p className="text-sm leading-relaxed text-muted md:text-base">
              {b.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
