import { CONFIG } from "@/lib/config";

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
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/5 text-lg"
              aria-hidden="true"
            >
              {b.icon}
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
