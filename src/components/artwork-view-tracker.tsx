"use client";

import { useEffect } from "react";

/**
 * Beacon lato client per il contatore "piu' visti": la pagina dettaglio e'
 * prerenderizzata/ISR, quindi il render server non gira a ogni visita (e
 * conterebbe bot e prefetch dei Link). Dedupe per sessione via sessionStorage,
 * impostato PRIMA della fetch cosi' lo StrictMode di sviluppo non conta doppio.
 */
export function ArtworkViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const storageKey = `viewed:${slug}`;

    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // sessionStorage non disponibile (es. privacy mode): meglio non contare.
      return;
    }

    void fetch("/api/views", {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);

  return null;
}
