"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Send } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { getArtworkImageUrl } from "@/lib/artworks-shared";
import { getCollectionCopy, type Collection } from "@/lib/collections";
import type { Artwork } from "@/lib/supabase/types";

const COLLECTION_FALLBACK_IMAGES = [
  "/images/portfolio/Pagina-2.png",
  "/images/portfolio/Pagina-13.png",
  "/images/portfolio/Pagina-17.png",
  "/images/portfolio/Pagina-20.png",
  "/images/portfolio/Pagina-29.png",
];

const processSteps = [
  {
    step: "01",
    title: "Schizzo",
    text: "La composizione nasce a matita: layout, pose e ritmo della tavola.",
    image: "/images/process/01-schizzo.png",
  },
  {
    step: "02",
    title: "China",
    text: "Il segno viene ripassato a china, definendo contrasti e profondità.",
    image: "/images/process/02-china.png",
  },
  {
    step: "03",
    title: "Finale",
    text: "Rifiniture, retini o colore: la tavola è pronta per stampa o digitale.",
    image: "/images/process/03-finale.png",
  },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function artworkSrc(artwork: Artwork, fallbackIndex = 0) {
  return (
    getArtworkImageUrl(artwork.image_path) ??
    COLLECTION_FALLBACK_IMAGES[fallbackIndex % COLLECTION_FALLBACK_IMAGES.length]
  );
}

/* ----------------------------------------------------------------- Hero -- */

function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-pure-white">
      <Image
        src="/images/portfolio/Pagina-29.png"
        alt="Tavola manga di apertura dello studio di Ethan"
        fill
        priority
        sizes="100vw"
        className={`object-cover object-center transition-transform duration-[2400ms] ease-out ${
          loaded ? "scale-100" : "scale-[1.1]"
        }`}
      />
      <div className="absolute inset-0 bg-pure-white/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-pure-white/60 via-transparent to-pure-white/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(250,249,247,0.70),transparent_75%)]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-5 pb-20 pt-32 text-center md:px-6 md:pb-32 md:pt-24">
        <div
          className={`flex flex-col items-center transition-all duration-1000 ease-out ${
            loaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="mb-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-text-secondary">
            <span className="h-px w-7 bg-text-secondary/40" />
            Tavole e illustrazioni originali
            <span className="h-px w-7 bg-text-secondary/40" />
          </p>

          <h1 className="font-serif text-[clamp(3rem,11vw,11rem)] font-medium leading-[0.85] tracking-[-0.01em] text-ink">
            Ethan&apos;s <span className="italic">Drawings</span>
          </h1>

          <p className="mt-6 max-w-xl font-serif text-lg italic leading-relaxed text-ink/60 md:mt-8 md:text-2xl">
            Un archivio visivo di storie, personaggi e commissioni.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/portfolio"
              className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-[14px] font-medium text-pure-white transition-all duration-300 hover:bg-accent sm:px-8"
            >
              Esplora le opere
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center rounded-full border border-ink/30 px-7 py-3.5 text-[14px] font-medium text-ink transition-all duration-300 hover:border-ink hover:bg-ink/5 sm:px-8"
            >
              Chi sono
            </Link>
          </div>
        </div>
      </div>

      <a
        href="#lavori"
        className={`absolute bottom-9 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 transition-all duration-1000 md:flex ${
          loaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: "1100ms" }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink/30">
          Scroll
        </span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-ink/10 p-1">
          <span className="h-1.5 w-0.5 animate-bounce rounded-full bg-accent" />
        </span>
      </a>
    </section>
  );
}

/* ------------------------------------------------------------ Selected -- */

function FeaturedSection({
  artworks,
  label,
}: {
  artworks: Artwork[];
  label: string;
}) {
  if (!artworks.length) {
    return <FeaturedEmptyState label={label} />;
  }

  const [lead, ...rest] = artworks;

  return (
    <section
      id="lavori"
      className="relative overflow-hidden border-t border-ink/5 bg-paper py-16 md:py-36"
    >
      <div className="mx-auto max-w-[1500px] px-5 md:px-16">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.14em] text-accent">
                {label}
              </p>
              <h2 className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.01em] text-ink">
                Lavori scelti
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="group hidden shrink-0 items-center gap-2 pb-2 text-sm font-medium text-ink/60 transition-colors hover:text-accent md:inline-flex"
            >
              <span className="u-underline">Tutte le opere</span>
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* lead piece */}
          <Reveal className="lg:col-span-7">
            <Link href={`/portfolio/${lead.slug}`} className="group block">
              <div className="plate group overflow-hidden rounded-2xl p-3 transition-transform duration-500 hover:-translate-y-1 md:p-4">
                <div className="relative aspect-[5/4] overflow-hidden rounded-xl">
                  <Image
                    src={artworkSrc(lead, 0)}
                    alt={lead.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 56vw, 92vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-start justify-between gap-6 border-t border-ink/12 pt-5">
                <div className="flex gap-5">
                  <span className="editorial-index text-2xl text-ink/25">
                    {pad(1)}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl font-medium leading-tight text-ink md:text-3xl">
                      {lead.title}
                    </h3>
                    <p className="mt-2 text-[12px] uppercase tracking-[0.12em] text-ink/45">
                      {lead.category || "Manga"}
                      {lead.year ? ` · ${lead.year}` : ""}
                    </p>
                  </div>
                </div>
                <span className="mt-1 shrink-0 rounded-full border border-ink/12 p-2.5 text-ink/50 transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-pure-white">
                  <ArrowUpRight size={16} strokeWidth={2} />
                </span>
              </div>
            </Link>
          </Reveal>

          {/* index of remaining works */}
          <Reveal delay={0.15} className="lg:col-span-5 lg:pt-6">
            <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-ink/40">
              Indice
            </p>
            <ul>
              {rest.map((artwork, index) => (
                <li key={artwork.id}>
                  <Link
                    href={`/portfolio/${artwork.slug}`}
                    className="group grid grid-cols-[auto_64px_1fr_auto] items-center gap-5 border-t border-ink/12 py-5"
                  >
                    <span className="editorial-index text-xl text-ink/25 transition-colors group-hover:text-accent">
                      {pad(index + 2)}
                    </span>
                    <div className="relative aspect-square overflow-hidden rounded-md border border-ink/12">
                      <Image
                        src={artworkSrc(artwork, index + 1)}
                        alt={artwork.title}
                        fill
                        sizes="64px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-serif text-lg font-medium leading-tight text-ink transition-colors group-hover:text-accent md:text-xl">
                        {artwork.title}
                      </h3>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ink/45">
                        {artwork.category || "Manga"}
                        {artwork.year ? ` · ${artwork.year}` : ""}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-ink/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
                    />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/portfolio"
                  className="group flex items-center justify-between border-t border-ink/12 py-5 text-sm font-medium text-ink/60 transition-colors hover:text-accent"
                >
                  <span className="u-underline">Esplora l&apos;archivio completo</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FeaturedEmptyState({ label }: { label: string }) {
  return (
    <section
      id="lavori"
      className="relative overflow-hidden border-t border-ink/5 bg-paper py-16 md:py-36"
    >
      <div className="mx-auto max-w-[1500px] px-5 md:px-16">
        <Reveal>
          <p className="mb-4 text-[11px] uppercase tracking-[0.14em] text-accent">
            {label}
          </p>
          <h2 className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[0.9] text-ink">
            Lavori scelti
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-8 lg:grid-cols-[0.62fr_0.38fr]">
          <div className="plate relative min-h-[440px] overflow-hidden rounded-2xl p-3 md:min-h-[560px] md:p-4">
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              <Image
                src="/images/portfolio/Pagina-2.png"
                alt="Anteprima di una tavola manga"
                fill
                sizes="(min-width: 1024px) 58vw, 92vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-ink/12 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-accent">
                Archivio in preparazione
              </p>
              <h3 className="mt-5 font-serif text-3xl font-medium leading-tight text-ink md:text-4xl">
                La selezione pubblica delle tavole comparirà qui.
              </h3>
              <p className="mt-6 text-base leading-relaxed text-ink/60">
                Una piccola anteprima del tono visivo dello studio, in attesa del
                primo archivio completo di tavole e illustrazioni.
              </p>
            </div>
            <Link
              href="/contact"
              className="group mt-10 inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-accent"
            >
              <span className="u-underline">Richiedi una commissione</span>
              <ArrowUpRight size={15} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Collections -- */

function CollectionsSection({ collections }: { collections: Collection[] }) {
  return (
    <section className="border-t border-ink/5 bg-pure-white py-16 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-16">
        <Reveal>
          <div className="grid gap-6 md:grid-cols-[0.5fr_0.5fr] md:items-end">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.14em] text-accent">
                Collezioni
              </p>
              <h2 className="font-serif text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[0.92] tracking-[-0.01em] text-ink">
                Ogni serie
                <br />
                racconta una storia
              </h2>
            </div>
            <p className="max-w-md text-base leading-[1.8] text-ink/60 md:justify-self-end">
              Esplora le tavole raggruppate per serie: soggetti, atmosfere e
              progetti che condividono lo stesso filo narrativo.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => {
            const cover =
              getArtworkImageUrl(collection.artworks[0]?.image_path) ??
              COLLECTION_FALLBACK_IMAGES[index % COLLECTION_FALLBACK_IMAGES.length];
            const { tagline } = getCollectionCopy(collection.slug);
            const count = collection.artworks.length;
            const wide = index === 0;

            return (
              <Reveal
                key={collection.slug}
                delay={index * 0.07}
                className={wide ? "sm:col-span-2 lg:col-span-2" : ""}
              >
                <Link
                  href={`/portfolio#${collection.slug}`}
                  className="group relative block overflow-hidden rounded-2xl border border-ink/12 transition-transform duration-500 hover:-translate-y-1"
                >
                  <div
                    className={`relative overflow-hidden ${
                      wide ? "aspect-[16/9]" : "aspect-[4/5]"
                    }`}
                  >
                    <Image
                      src={cover}
                      alt={collection.category}
                      fill
                      sizes={
                        wide
                          ? "(min-width: 1024px) 62vw, 92vw"
                          : "(min-width: 1024px) 31vw, (min-width: 640px) 45vw, 92vw"
                      }
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pure-white/90 via-pure-white/50 to-transparent" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                    <div>
                      <span className="editorial-index text-sm text-accent">
                        Nº {pad(index + 1)}
                      </span>
                      <h3 className="mt-2 font-serif text-2xl font-medium leading-tight text-ink md:text-3xl">
                        {collection.category}
                      </h3>
                      <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink/60">
                        {tagline}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-ink/60">
                      {count} {count === 1 ? "tavola" : "tavole"}
                    </span>
                  </div>

                  <span className="absolute right-5 top-5 rounded-full border border-ink/10 bg-pure-white/40 p-2.5 text-ink/60 backdrop-blur-sm transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-pure-white">
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

function AboutTeaserSection() {
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
                src="/images/artist/ethan-portrait.png"
                alt="Ethan, l'artista dietro Ethan's Drawings"
                width={800}
                height={1000}
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
            </div>
          </div>
          <div>
            <Reveal>
              <p className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-accent">
                <span className="h-px w-8 bg-accent" />
                Chi sono
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <blockquote className="font-serif text-[clamp(1.75rem,3.4vw,3rem)] font-medium italic leading-[1.15] text-ink">
                &ldquo;Compongo storie una tavola alla volta: ritmo della pagina,
                pause e cura del segno.&rdquo;
              </blockquote>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-lg text-base leading-[1.85] text-ink/60">
                Ethan lavora su tavole manga, character design e illustrazioni con
                un taglio narrativo. Ogni progetto parte dalla composizione e dal
                ritmo, fino alla rifinitura del tratto.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <Link
                href="/about"
                className="group mt-9 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
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

/* ----------------------------------------------------------- Process -- */

function ProcessSection() {
  return (
    <section className="border-t border-ink/5 bg-pure-white py-16 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-16">
        <Reveal>
          <p className="mb-4 text-[11px] uppercase tracking-[0.14em] text-accent">
            Il metodo
          </p>
          <h2 className="max-w-4xl font-serif text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[0.92] tracking-[-0.01em] text-ink">
            Dal brief alla tavola finale
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-6">
          {processSteps.map((item, index) => (
            <Reveal key={item.step} delay={index * 0.1}>
              <article className="group transition-transform duration-500 hover:-translate-y-1">
                <div className="mb-5 flex items-center gap-4">
                  <span className="editorial-index text-4xl text-accent">
                    {item.step}
                  </span>
                  <span className="h-px flex-1 bg-ink/12" />
                </div>
                <div className="plate overflow-hidden rounded-2xl p-2.5">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={item.image}
                      alt={`Fase ${item.step} — ${item.title}`}
                      fill
                      sizes="(min-width: 768px) 30vw, 92vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                </div>
                <h3 className="mt-5 font-serif text-2xl font-medium text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-[1.8] text-ink/60">
                  {item.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Commission -- */

function CommissionSection() {
  return (
    <section className="relative overflow-hidden border-t border-ink/5 bg-paper py-16 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-16">
        <div className="grid gap-12 lg:grid-cols-[0.58fr_0.42fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-accent">
              <span className="h-px w-8 bg-accent" />
              Commissioni
            </p>
            <h2 className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.01em] text-ink">
              Hai una scena
              <br />
              da trasformare
              <br />
              in tavola?
            </h2>
            <p className="mt-8 max-w-xl text-base leading-[1.85] text-ink/60">
              Racconta formato, soggetto e atmosfera del progetto: il form
              raccoglie la richiesta e salva il brief per la risposta.
            </p>
            <Link
              href="/contact"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-medium text-pure-white transition-all duration-300 hover:bg-accent"
            >
              <Send size={16} strokeWidth={1.5} />
              Inizia un progetto
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
                  src="/images/portfolio/Pagina-29.png"
                  alt="Tavola manga in bianco e nero"
                  fill
                  sizes="(min-width: 1024px) 40vw, 92vw"
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
  featuredArtworks,
  featuredLabel,
  collections,
}: {
  featuredArtworks: Artwork[];
  featuredLabel: string;
  collections: Collection[];
}) {
  return (
    <main>
      <HeroSection />
      <FeaturedSection artworks={featuredArtworks} label={featuredLabel} />
      {collections.length ? (
        <CollectionsSection collections={collections} />
      ) : null}
      <AboutTeaserSection />
      <ProcessSection />
      <CommissionSection />
    </main>
  );
}
