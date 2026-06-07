"use client";

import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group inline-flex items-center gap-2 rounded-full border border-ink/10 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink/50 transition-all duration-300 hover:border-accent hover:text-accent"
      aria-label="Torna su"
    >
      Torna su
      <ArrowUp
        size={14}
        strokeWidth={1.8}
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  );
}
