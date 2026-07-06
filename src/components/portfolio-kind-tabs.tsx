"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { GalleryHorizontal, LayoutGrid } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { PortfolioScroller } from "@/components/portfolio-scroller";
import { KIND_LABELS } from "@/lib/artwork-kinds";
import { getCollectionCopy, type Collection } from "@/lib/collections";
import type { ArtworkKind } from "@/lib/supabase/types";

export type KindTab = {
  kind: ArtworkKind;
  collections: Collection[];
};

export type PortfolioView = "collezioni" | "griglia";

const VIEW_OPTIONS: Array<{
  value: PortfolioView;
  label: string;
  Icon: typeof GalleryHorizontal;
}> = [
  { value: "collezioni", label: "Vista a caroselli", Icon: GalleryHorizontal },
  { value: "griglia", label: "Vista a griglia", Icon: LayoutGrid },
];

/**
 * Due pannelli (Tavole | Illustrazioni) in un track a scroll-snap nativo:
 * lo swipe orizzontale cambia tab, i bottoni scrollano il track, e lo stato
 * attivo si sincronizza dallo scroll. I caroselli interni hanno
 * `overscroll-x-contain`, quindi arrivati al bordo non trascinano il track.
 *
 * Ogni pannello si sfoglia in due modi: caroselli per collezione (default)
 * oppure griglia verticale, per chi vuole scorrere tutto senza swipe.
 */
export function PortfolioKindTabs({
  initialKind,
  initialView = "collezioni",
  tabs,
}: {
  initialKind: ArtworkKind;
  initialView?: PortfolioView;
  tabs: KindTab[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const initialIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.kind === initialKind),
  );
  const activeIndexRef = useRef(initialIndex);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [view, setView] = useState<PortfolioView>(initialView);
  const viewRef = useRef(view);

  const syncUrl = useCallback(
    (index: number, nextView: PortfolioView) => {
      const tab = tabs[index];
      if (!tab) return;
      const params = new URLSearchParams();
      params.set("tab", KIND_LABELS[tab.kind].tabSlug);
      if (nextView !== "collezioni") params.set("view", nextView);
      window.history.replaceState(null, "", `?${params.toString()}`);
    },
    [tabs],
  );

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
      syncUrl(index, viewRef.current);

      // Cambiando tab dal fondo di un pannello alto, il pannello nuovo puo'
      // essere molto piu' corto: riporta in vista la tab strip.
      const root = rootRef.current;
      if (root && root.getBoundingClientRect().top < -8) {
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [syncUrl],
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

  // Pattern tab WAI-ARIA: frecce/Home/End spostano il focus e attivano il tab.
  function handleTablistKeyDown(event: React.KeyboardEvent) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (activeIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    goToTab(nextIndex);
  }

  function changeView(nextView: PortfolioView) {
    if (nextView === view) return;
    setView(nextView);
    viewRef.current = nextView;
    syncUrl(activeIndexRef.current, nextView);
  }

  return (
    <div ref={rootRef} className="scroll-mt-28">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 md:mb-12">
        <div
          role="tablist"
          aria-label="Tipo di opere"
          onKeyDown={handleTablistKeyDown}
          className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-pure-white p-1.5"
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
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`tab-${labels.tabSlug}`}
                aria-selected={isActive}
                aria-controls={`panel-${labels.tabSlug}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => goToTab(index)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-300 md:px-7 ${
                  isActive
                    ? "bg-ink text-pure-white"
                    : "text-ink/65 hover:text-ink"
                }`}
              >
                {labels.plural}
                <span
                  className={`text-[11px] ${
                    isActive ? "text-pure-white/75" : "text-ink/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="Modalità di visualizzazione"
          className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-pure-white p-1.5"
        >
          {VIEW_OPTIONS.map(({ value, label, Icon }) => {
            const isActive = view === value;
            return (
              <button
                key={value}
                type="button"
                aria-label={label}
                title={label}
                aria-pressed={isActive}
                onClick={() => changeView(value)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-ink text-pure-white"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                <Icon size={16} strokeWidth={1.8} />
              </button>
            );
          })}
        </div>
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
                view === "collezioni" ? (
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
                  <div className="space-y-14 md:space-y-20">
                    {tab.collections.map((collection) => (
                      <section key={`${tab.kind}-${collection.slug}-grid`}>
                        <div className="mb-8">
                          <h2 className="font-serif text-xl font-medium tracking-tight text-ink md:text-2xl">
                            {collection.category}
                          </h2>
                          {getCollectionCopy(collection.slug).description ? (
                            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink/65">
                              {getCollectionCopy(collection.slug).description}
                            </p>
                          ) : null}
                        </div>
                        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                          {collection.artworks.map((artwork, artworkIndex) => (
                            <ArtworkCard
                              key={artwork.id}
                              artwork={artwork}
                              priority={isActive && artworkIndex < 3}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )
              ) : (
                <div className="rounded-2xl bg-pure-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] md:p-12">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-accent-ink">
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
