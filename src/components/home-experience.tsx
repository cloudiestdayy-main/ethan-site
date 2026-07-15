"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Send } from "lucide-react";
import { EmptyGallery } from "@/components/empty-gallery";
import { PortfolioScroller } from "@/components/portfolio-scroller";
import { Reveal } from "@/components/reveal";
import { KIND_LABELS } from "@/lib/artwork-kinds";
import { getArtworkImageUrl } from "@/lib/artworks-shared";
import type { Artwork, ArtworkKind } from "@/lib/supabase/types";

export type HomeHeroContent = {
  title: string;
  subtitle: string;
};

/** Testi e immagini della home modificabili dall'editor admin. */
export type HomeEditableContent = {
  mostViewedTitle: string;
  worksTitle: string;
  worksText: string;
  aboutQuote: string;
  aboutText: string;
  contactTitle: string;
  contactText: string;
  heroImage: string;
  portraitImage: string;
  contactImage: string;
};

export type KindPanelData = {
  count: number;
  cover: string | null;
};

export type HomeKindPanels = {
  tavola: KindPanelData;
  illustrazione: KindPanelData;
};

const KIND_FALLBACK_IMAGES: Record<ArtworkKind, string> = {
  tavola: "/images/portfolio/Pagina-2.png",
  illustrazione: "/images/portfolio/Pagina-17.png",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/* ----------------------------------------------------------------- Hero -- */

function HeroSection({
  title,
  subtitle,
  image,
}: HomeHeroContent & { image: string }) {
  const [loaded, setLoaded] = useState(false);
  const heroTitle = title.trim();
  const heroSubtitle = subtitle.trim();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-pure-white">
      <Image
        src={image}
        alt="Tavola manga di apertura dello studio di Ethan"
        fill
        priority
        sizes="100vw"
        data-setting-key="hero_image_path"
        data-setting-type="image"
        className={`object-cover object-center transition-transform duration-[2400ms] ease-out ${
          loaded ? "scale-100" : "scale-[1.1]"
        }`}
      />
      {/* Solo un gradiente scuro in basso: l'immagine resta pulita (stile
          victoriarosepark.com) e il testo bianco legge anche su carta chiara. */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-ink/60 via-ink/15 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-end px-5 pb-16 pt-32 text-center md:px-6 md:pb-20">
        <div
          className={`flex flex-col items-center transition-all duration-1000 ease-out ${
            loaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {heroTitle ? (
            <h1
              data-setting-key="hero_title"
              className="font-serif text-[clamp(1.5rem,3.2vw,2.75rem)] font-medium italic leading-snug text-pure-white [text-shadow:0_1px_18px_rgba(26,26,46,0.35)]"
            >
              {heroTitle}
            </h1>
          ) : (
            <h1 className="sr-only">Ethan&apos;s Drawings</h1>
          )}

          {heroSubtitle ? (
            <p
              data-setting-key="hero_subtitle"
              className="mt-4 max-w-xl text-sm leading-relaxed text-pure-white/85 md:text-base"
            >
              {heroSubtitle}
            </p>
          ) : null}

          <Link
            href="/portfolio"
            className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full border border-pure-white/80 bg-transparent px-8 py-3.5 text-[14px] font-medium text-pure-white backdrop-blur-[2px] transition-all duration-300 hover:bg-pure-white hover:text-ink"
          >
            Esplora le opere
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Most viewed -- */

function MostViewedSection({
  artworks,
  isFallback,
  title,
}: {
  artworks: Artwork[];
  isFallback: boolean;
  title: string;
}) {
  return (
    <section
      id="piu-visti"
      className="scroll-mt-24 border-t border-ink/5 bg-paper py-16 md:py-36"
    >
      <div className="mx-auto max-w-[1500px] px-5 md:px-16">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.14em] text-accent-ink">
                {isFallback ? "Una selezione dall'archivio" : "Le opere più amate"}
              </p>
              <h2
                data-setting-key="home_most_viewed_title"
                className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.01em] text-ink"
              >
                {title}
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="group hidden shrink-0 items-center gap-2 pb-2 text-sm font-medium text-ink/70 transition-colors hover:text-accent-ink md:inline-flex"
            >
              <span className="u-underline">Tutte le opere</span>
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 md:mt-16">
            <PortfolioScroller
              artworks={artworks}
              title={null}
              headerLink={null}
              showKindBadge
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Works teaser -- */

function WorksTeaserSection({
  panels,
  title,
  text,
}: {
  panels: HomeKindPanels;
  title: string;
  text: string;
}) {
  const entries: Array<{ kind: ArtworkKind } & KindPanelData> = [
    { kind: "tavola", ...panels.tavola },
    { kind: "illustrazione", ...panels.illustrazione },
  ];

  return (
    <section className="border-t border-ink/5 bg-pure-white py-16 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-16">
        <Reveal>
          <div className="grid gap-6 md:grid-cols-[0.5fr_0.5fr] md:items-end">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.14em] text-accent-ink">
                L&apos;archivio
              </p>
              <h2
                data-setting-key="home_works_title"
                className="font-serif text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[0.92] tracking-[-0.01em] text-ink"
              >
                {title}
              </h2>
            </div>
            <p
              data-setting-key="home_works_text"
              className="max-w-md text-base leading-[1.8] text-ink/70 md:justify-self-end"
            >
              {text}
            </p>
          </div>
        </Reveal>

        <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-4 md:grid md:grid-cols-2 md:overflow-visible md:pb-0">
          {entries.map((panel, index) => {
            const labels = KIND_LABELS[panel.kind];
            const cover =
              getArtworkImageUrl(panel.cover) ?? KIND_FALLBACK_IMAGES[panel.kind];
            const countLabel = `${panel.count} ${
              panel.count === 1
                ? labels.singular.toLowerCase()
                : labels.plural.toLowerCase()
            }`;

            return (
              <Reveal
                key={panel.kind}
                delay={index * 0.08}
                className="w-[85vw] max-w-[520px] shrink-0 snap-start md:w-auto md:max-w-none"
              >
                <Link
                  href={`/portfolio?tab=${labels.tabSlug}`}
                  className="group relative block overflow-hidden rounded-2xl border border-ink/12 transition-transform duration-500 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={cover}
                      alt={labels.plural}
                      fill
                      sizes="(min-width: 768px) 46vw, 85vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pure-white/90 via-pure-white/40 to-transparent" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                    <div>
                      <span className="editorial-index text-sm text-accent-ink">
                        Nº {pad(index + 1)}
                      </span>
                      <h3 className="mt-2 font-serif text-3xl font-medium leading-tight text-ink md:text-4xl">
                        {labels.plural}
                      </h3>
                    </div>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-ink/70">
                      {countLabel}
                    </span>
                  </div>

                  <span className="absolute right-5 top-5 rounded-full border border-ink/10 bg-pure-white/40 p-2.5 text-ink/70 backdrop-blur-sm transition-all duration-300 group-hover:border-accent-ink group-hover:bg-accent-ink group-hover:text-pure-white">
                    <ArrowUpRight size={16} strokeWidth={2} />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- About -- */

function AboutTeaserSection({
  quote,
  text,
  portraitImage,
}: {
  quote: string;
  text: string;
  portraitImage: string;
}) {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelector(".clip-reveal")?.classList.add("is-inview");
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="border-t border-ink/5 bg-paper py-16 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-16">
        <div className="grid gap-12 lg:grid-cols-[0.42fr_0.58fr] lg:items-center lg:gap-16">
          <div ref={imgRef} className="relative overflow-hidden">
            <div className="clip-reveal plate rounded-2xl p-3 md:p-4">
              <Image
                src={portraitImage}
                alt="Ethan, l'artista dietro Ethan's Drawings"
                width={800}
                height={1000}
                data-setting-key="portrait_image_path"
                data-setting-type="image"
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
            </div>
          </div>
          <div>
            <Reveal>
              <p className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-accent-ink">
                <span className="h-px w-8 bg-accent" />
                Chi sono
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <blockquote className="font-serif text-[clamp(1.75rem,3.4vw,3rem)] font-medium italic leading-[1.15] text-ink">
                &ldquo;
                <span data-setting-key="home_about_quote">{quote}</span>&rdquo;
              </blockquote>
            </Reveal>
            <Reveal delay={0.2}>
              <p
                data-setting-key="home_about_text"
                className="mt-8 max-w-lg text-base leading-[1.85] text-ink/70"
              >
                {text}
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <Link
                href="/about"
                className="group mt-9 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent-ink"
              >
                <span className="u-underline">La storia completa</span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Contact -- */

function ContactSection({
  title,
  text,
  image,
}: {
  title: string;
  text: string;
  image: string;
}) {
  return (
    <section className="relative overflow-hidden border-t border-ink/5 bg-pure-white py-16 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-16">
        <div className="grid gap-12 lg:grid-cols-[0.58fr_0.42fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-accent-ink">
              <span className="h-px w-8 bg-accent" />
              Contatti
            </p>
            <h2
              data-setting-key="home_contact_title"
              className="whitespace-pre-line font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.01em] text-ink"
            >
              {title}
            </h2>
            <p
              data-setting-key="home_contact_text"
              className="mt-8 max-w-xl text-base leading-[1.85] text-ink/70"
            >
              {text}
            </p>
            <Link
              href="/contact"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-medium text-pure-white transition-all duration-300 hover:bg-accent-ink"
            >
              <Send size={16} strokeWidth={1.5} />
              Scrivimi
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="plate rounded-2xl p-3 md:p-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src={image}
                  alt="Tavola manga in bianco e nero"
                  fill
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  data-setting-key="contact_image_path"
                  data-setting-type="image"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Page -- */

export function HomeExperience({
  hero,
  content,
  mostViewed,
  mostViewedIsFallback,
  kindPanels,
}: {
  hero: HomeHeroContent;
  content: HomeEditableContent;
  mostViewed: Artwork[];
  mostViewedIsFallback: boolean;
  kindPanels: HomeKindPanels;
}) {
  const totalWorks = kindPanels.tavola.count + kindPanels.illustrazione.count;

  return (
    <main>
      <HeroSection
        title={hero.title}
        subtitle={hero.subtitle}
        image={content.heroImage}
      />
      {mostViewed.length ? (
        <MostViewedSection
          artworks={mostViewed}
          isFallback={mostViewedIsFallback}
          title={content.mostViewedTitle}
        />
      ) : (
        <section
          id="piu-visti"
          className="scroll-mt-24 border-t border-ink/5 bg-paper py-16 md:py-36"
        >
          <div className="mx-auto max-w-[1500px] px-5 md:px-16">
            <EmptyGallery />
          </div>
        </section>
      )}
      {totalWorks ? (
        <WorksTeaserSection
          panels={kindPanels}
          title={content.worksTitle}
          text={content.worksText}
        />
      ) : null}
      <AboutTeaserSection
        quote={content.aboutQuote}
        text={content.aboutText}
        portraitImage={content.portraitImage}
      />
      <ContactSection
        title={content.contactTitle}
        text={content.contactText}
        image={content.contactImage}
      />
    </main>
  );
}
