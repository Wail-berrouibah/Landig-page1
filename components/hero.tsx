"use client";

import { useState } from "react";
import { CONFIG, formatPrice } from "@/lib/config";

const IMAGES = ["/img/pc1.jpg", "/img/pc2.jpg", "/img/pc3.jpg"];

export default function Hero() {
  const p = CONFIG.product;
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((i) => (i === 0 ? IMAGES.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === IMAGES.length - 1 ? 0 : i + 1));

  return (
    <section className="mx-auto max-w-6xl px-5 pt-8 pb-12 md:pt-16 md:pb-20">
      <div className="grid items-center gap-10 md:grid-cols-5 md:gap-12">
        {/* Text block */}
        <div className="animate-fade-in md:col-span-3">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            {p.name}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted md:text-lg">
            {p.tagline}
          </p>

          <div className="mt-6">
            <span className="text-4xl font-bold text-gold md:text-5xl">
              {formatPrice(p.price)}
            </span>
            {p.showPayOnDelivery && (
              <p className="mt-1 text-sm text-muted">Paiement à la livraison disponible</p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#commander"
              className="inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-light focus-visible:outline-2 focus-visible:outline-accent"
            >
              Commander
            </a>
            <a
              href="https://wa.me/213XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition-all hover:border-text focus-visible:outline-2 focus-visible:outline-accent"
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>

          {/* Proof points inline */}
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
            {CONFIG.proofPoints.map((pp, i) => (
              <span key={i} className="flex items-center gap-2 text-sm text-muted">
                <span aria-hidden="true">{pp.icon}</span>
                {pp.text}
              </span>
            ))}
          </div>
        </div>

        {/* Image carousel */}
        <div className="animate-fade-in flex items-center justify-center md:col-span-2">
          <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 ring-1 ring-border">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${idx * 100}%)` }}
            >
              {IMAGES.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`TechPro 15 Pro – vue ${i + 1}`}
                  className="aspect-[4/3] w-full shrink-0 object-contain p-4"
                />
              ))}
            </div>

            <button
              onClick={prev}
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-accent shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
              aria-label="Image précédente"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-accent shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
              aria-label="Image suivante"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === idx ? "bg-accent" : "bg-accent/30"
                  }`}
                  aria-label={`Vue ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
