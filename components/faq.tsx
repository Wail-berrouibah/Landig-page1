"use client";

import { useState } from "react";
import { CONFIG } from "@/lib/config";

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="mx-auto max-w-2xl scroll-mt-20 px-5 py-12 md:py-20"
    >
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        Questions fréquentes
      </h2>
      <div className="mt-6 space-y-2">
        {CONFIG.faq.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition-colors hover:text-accent md:text-base"
                aria-expanded={isOpen}
              >
                {item.q}
                <span
                  className={`ml-4 shrink-0 text-lg leading-none text-muted transition-transform ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
                  {item.r}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
