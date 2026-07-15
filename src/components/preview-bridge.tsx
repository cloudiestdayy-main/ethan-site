"use client";

import { useEffect } from "react";
import {
  isSiteSettingKey,
  splitLines,
  splitParagraphs,
} from "@/lib/settings-shared";

export const PREVIEW_SET_MESSAGE = "ethan-preview:set";
export const PREVIEW_READY_MESSAGE = "ethan-preview:ready";

/**
 * Ponte per l'anteprima live dell'editor admin (/admin/content).
 *
 * Montato su tutto il sito ma inerte in condizioni normali: si attiva solo
 * quando la pagina e' dentro un iframe same-origin. Riceve via postMessage i
 * valori in bozza e aggiorna il DOM in locale (mai innerHTML, nessuna
 * persistenza): al refresh la pagina torna ai contenuti salvati.
 */
export function PreviewBridge() {
  useEffect(() => {
    if (window.self === window.top) return;

    const drafts = new Map<string, string>();
    // Template dei figli per i tipi paragraphs/list, catturati al primo patch.
    const childTemplates = new WeakMap<Element, Element>();
    let scrolledKey: string | null = null;
    let reapplyTimer: number | null = null;

    function applyKey(key: string, value: string): Element | null {
      const elements = document.querySelectorAll(`[data-setting-key="${key}"]`);

      elements.forEach((element) => {
        const type = element.getAttribute("data-setting-type") || "text";

        if (type === "image") {
          if (element instanceof HTMLImageElement) {
            element.src = value;
            // Senza rimuovere srcset il browser continuerebbe a usarlo.
            element.removeAttribute("srcset");
          }
          return;
        }

        if (type === "paragraphs" || type === "list") {
          let template = childTemplates.get(element);
          if (!template && element.firstElementChild) {
            template = element.firstElementChild.cloneNode(false) as Element;
            childTemplates.set(element, template);
          }
          if (!template) return;

          const parts =
            type === "paragraphs" ? splitParagraphs(value) : splitLines(value);
          element.replaceChildren(
            ...parts.map((part) => {
              const child = template.cloneNode(false) as Element;
              child.textContent = part;
              return child;
            }),
          );
          return;
        }

        element.textContent = value;
      });

      return elements[0] ?? null;
    }

    function applyAll() {
      drafts.forEach((value, key) => applyKey(key, value));
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; key?: string; value?: string };
      if (
        !data ||
        data.type !== PREVIEW_SET_MESSAGE ||
        typeof data.key !== "string" ||
        typeof data.value !== "string" ||
        !isSiteSettingKey(data.key)
      ) {
        return;
      }

      drafts.set(data.key, data.value);
      // Riapplica tutto: eventuali re-render React ripristinano i testi
      // originali e vanno sovrascritti di nuovo.
      applyAll();
      const target = applyKey(data.key, data.value);

      if (target && scrolledKey !== data.key) {
        scrolledKey = data.key;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      if (reapplyTimer) window.clearTimeout(reapplyTimer);
      reapplyTimer = window.setTimeout(applyAll, 600);
    }

    window.addEventListener("message", handleMessage);
    // Segnala all'editor che la pagina e' pronta: l'editor ripubblica la bozza.
    window.parent.postMessage(
      { type: PREVIEW_READY_MESSAGE },
      window.location.origin,
    );

    return () => {
      window.removeEventListener("message", handleMessage);
      if (reapplyTimer) window.clearTimeout(reapplyTimer);
    };
  }, []);

  return null;
}
