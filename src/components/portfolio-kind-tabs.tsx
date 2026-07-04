"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PortfolioScroller } from "@/components/portfolio-scroller";
import { KIND_LABELS } from "@/lib/artwork-kinds";
import { getCollectionCopy, type Collection } from "@/lib/collections";
import type { ArtworkKind } from "@/lib/supabase/types";

export type KindTab = {
  kind: ArtworkKind;
  collections: Collection[];
};

/**
 * Due pannelli (Tavole | Illustrazioni) in un track a scroll-snap nativo:
 * lo swipe orizzontale cambia tab, i bottoni scrollano il track, e lo stato
 * attivo si sincronizza dallo scroll. I caroselli interni hanno
 * `overscroll-x-contain`, quindi arrivati al bordo non trascinano il track.
 */
export function PortfolioKindTabs({
  initialKind,
  tabs,
}: {
  initialKind: ArtworkKind;
  tabs: KindTab[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const initialIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.kind === initialKind),
  );
  const activeIndexRef = useRef(initialIndex);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Posiziona il pannello del deep-link (?tab=) prima del paint, senza smooth.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || activeIndexRef.current === 0) return;
    track.scrollLeft = activeIndexRef.current * track.clientWidth;
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const applyIndex = useCallback(
    (index: number) => {
      if (index === activeIndexRef.current) return;
      activeIndexRef.current = index;
      setActiveIndex(index);

      const tab = tabs[index];
      if (tab) {
        window.history.replaceState(
          null,
          "",
          `?tab=${KIND_LABELS[tab.kind].tabSlug}`,
        );
      }

      // Cambiando tab dal fondo di un pannello alto, il pannello nuovo puo'
      // essere molto piu' corto: riporta in vista la tab strip.
      const root = rootRef.current;
      if (root && root.getBoundingClientRect().top < -8) {
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [tabs],
  );

  const handleScroll = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const track = trackRef.current;
      if (!track || track.clientWidth === 0) return;
      const index = Math.min(
        tabs.length - 1,
        Math.max(0, Math.round(track.scrollLeft / track.clientWidth)),
      );
      applyIndex(index);
    });
  }, [applyIndex, tabs.length]);

  function goToTab(index: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  return (
    <div ref={rootRef} className="scroll-mt-28">
      <div
        role="tablist"
        aria-label="Tipo di opere"
        className="mb-8 inline-flex items-center gap-1 rounded-full border border-ink/10 bg-pure-white p-1.5 md:mb-12"
      >
        {tabs.map((tab, index) => {
          const labels = KIND_LABELS[tab.kind];
          const count = tab.collections.reduce(
            (total, collection) => total + collection.artworks.length,
            0,
          );
          const isActive = index === activeIndex;

          return (
            <button
              key={tab.kind}
              type="button"
              role="tab"
              id={`tab-${labels.tabSlug}`}
              aria-selected={isActive}
              aria-controls={`panel-${labels.tabSlug}`}
              onClick={() => goToTab(index)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-300 md:px-7 ${
                isActive
                  ? "bg-ink text-pure-white"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              {labels.plural}
              <span
                className={`text-[11px] ${
                  isActive ? "text-pure-white/60" : "text-ink/30"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-10 md:-mx-10"
      >
        {tabs.map((tab, index) => {
          const labels = KIND_LABELS[tab.kind];
          const isActive = index === activeIndex;

          return (
            <div
              key={tab.kind}
              role="tabpanel"
              id={`panel-${labels.tabSlug}`}
              aria-labelledby={`tab-${labels.tabSlug}`}
              inert={!isActive}
              className={`w-full shrink-0 snap-start px-4 md:px-10 ${
                isActive ? "" : "max-h-[100svh] overflow-hidden"
              }`}
            >
              {tab.collections.length ? (
                <div className="space-y-10 md:space-y-16">
                  {tab.collections.map((collection) => (
                    <PortfolioScroller
                      key={`${tab.kind}-${collection.slug}`}
                      id={`${labels.tabSlug}-${collection.slug}`}
                      title={collection.category}
                      description={getCollectionCopy(collection.slug).description}
                      artworks={collection.artworks}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-pure-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] md:p-12">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-accent">
                    {labels.plural}
                  </p>
                  <p className="mt-4 max-w-xl font-serif text-2xl font-medium leading-tight text-ink md:text-3xl">
                    {tab.kind === "tavola"
                      ? "Nessuna tavola pubblicata per ora."
                      : "Nessuna illustrazione pubblicata per ora."}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
