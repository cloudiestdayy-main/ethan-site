"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { getArtworkImageUrl } from "@/lib/artworks-shared";
import type { Artwork } from "@/lib/supabase/types";

function getScrollDistance(container: HTMLDivElement) {
  const firstCard = container.querySelector<HTMLElement>("[data-portfolio-card]");
  if (!firstCard) return container.clientWidth * 0.75;
  const gap = 32;
  return firstCard.offsetWidth + gap;
}

export function PortfolioScroller({
  artworks,
  title = "Tavole e illustrazioni",
  description,
  id,
}: {
  artworks: Artwork[];
  title?: string;
  description?: string;
  id?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const container = scrollerRef.current;
    if (!container) return;
    const max = container.scrollWidth - container.clientWidth;
    const current = container.scrollLeft;
    setProgress(max > 0 ? current / max : 0);
  }, []);

  function scrollGallery(direction: -1 | 1) {
    const container = scrollerRef.current;
    if (!container) return;
    container.scrollBy({
      left: getScrollDistance(container) * direction,
      behavior: "smooth",
    });
  }

  return (
    <div
      id={id}
      className="scroll-mt-28 rounded-2xl bg-pure-white p-5 text-ink shadow-[0_8px_40px_rgba(0,0,0,0.06)] md:p-8"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h2 className="font-serif text-xl font-medium tracking-tight text-ink md:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink/50">
              {description}
            </p>
          ) : null}
        </div>
        <Link
          href="/contact"
          className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-ink/40 transition-colors hover:text-ink"
        >
          Commissioni
          <ArrowUpRight size={14} strokeWidth={1.6} />
        </Link>
      </div>

      <div
        ref={scrollerRef}
        onScroll={updateProgress}
        className="portfolio-scrollbar -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-8 md:gap-8"
      >
        {artworks.map((artwork, index) => {
          const imageUrl = getArtworkImageUrl(artwork.image_path);

          return (
            <article
              key={artwork.id}
              data-portfolio-card
              className="w-[78vw] max-w-[420px] shrink-0 snap-start sm:w-[340px] lg:w-[380px]"
            >
              <Link href={`/portfolio/${artwork.slug}`} className="group block">
                <div className="rounded-xl bg-paper p-4 transition-colors duration-300 group-hover:bg-paper/80 md:p-6">
                  <div className="relative rounded-lg bg-pure-white p-3 shadow-sm md:p-4">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-paper">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={artwork.title}
                          fill
                          priority={index < 2}
                          sizes="(min-width: 1024px) 380px, (min-width: 640px) 340px, 78vw"
                          className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-full w-full bg-paper" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <h3 className="font-serif text-lg font-medium leading-tight text-ink">
                    {artwork.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink/40">
                    {artwork.category || "Manga"}
                    {artwork.year ? ` / ${artwork.year}` : ""}
                  </p>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-4">
        <div className="relative h-px flex-1 bg-border-subtle">
          <div
            className="absolute left-0 top-0 h-full bg-ink transition-all duration-150"
            style={{ width: `${Math.max(5, progress * 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollGallery(-1)}
            aria-label="Opera precedente"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 text-ink/40 transition-all duration-300 hover:border-ink hover:text-ink sm:h-9 sm:w-9"
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => scrollGallery(1)}
            aria-label="Opera successiva"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 text-ink/40 transition-all duration-300 hover:border-ink hover:text-ink sm:h-9 sm:w-9"
          >
            <ArrowRight size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
