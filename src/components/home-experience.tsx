"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Send } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { Reveal } from "@/components/reveal";
import type { Artwork } from "@/lib/supabase/types";

const processSteps = [
  {
    step: "01",
    title: "Brief",
    text: "Raccogliamo atmosfera, riferimenti, formato e obiettivo della tavola.",
  },
  {
    step: "02",
    title: "Rough",
    text: "La composizione prende forma con una prima revisione prima della pulizia.",
  },
  {
    step: "03",
    title: "Finale",
    text: "Consegna dell'illustrazione rifinita, pronta per stampa o uso digitale.",
  },
];

function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 150);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-pure-black">
      <Image
        src="/images/portfolio/Pagina-29.png"
        alt="Immagine temporanea di apertura per Ethan&apos;s Drawings"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-pure-black/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-pure-black/30 via-transparent to-pure-black/70" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1440px] items-center justify-center px-5 pb-20 pt-28 text-center md:px-10">
        <div
          className={`max-w-4xl transition-all duration-1000 ease-out ${
            loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="mx-auto mb-6 text-[11px] font-medium uppercase tracking-[0.16em] text-pure-white/70">
            Tavole manga e illustrazioni originali
          </p>
          <h1 className="font-serif text-[clamp(3.5rem,8vw,9rem)] font-semibold leading-[0.9] text-pure-white">
            Ethan&apos;s
            <br />
            Drawings
          </h1>
          <p className="mx-auto mt-8 max-w-xl font-serif text-lg italic leading-relaxed text-pure-white/70 md:text-xl">
            Un archivio visivo di storie, personaggi e commissioni.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/about"
              className="inline-flex min-h-12 min-w-40 items-center justify-center rounded-full border border-pure-white/60 px-8 py-3.5 text-[15px] font-medium text-pure-white backdrop-blur-sm transition-all duration-300 hover:border-pure-white hover:bg-pure-white hover:text-pure-black"
            >
              Chi sono
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex min-h-12 min-w-40 items-center justify-center rounded-full border border-pure-white/60 px-8 py-3.5 text-[15px] font-medium text-pure-white backdrop-blur-sm transition-all duration-300 hover:border-pure-white hover:bg-pure-white hover:text-pure-black"
            >
              I miei lavori
            </Link>
          </div>
        </div>
      </div>

      <a
        href="#featured"
        className={`absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 transition-all duration-1000 md:flex ${
          loaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: "1200ms" }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-pure-white/30">
          Scroll
        </span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-pure-white/15 p-1">
          <span className="h-1.5 w-0.5 animate-bounce rounded-full bg-accent" />
        </span>
      </a>
    </section>
  );
}

function FeaturedSection({
  artworks,
  label,
}: {
  artworks: Artwork[];
  label: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    const items = container.querySelectorAll(".grid-item");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-inview");
        });
      },
      { threshold: 0.1, rootMargin: "-50px 0px" }
    );

    items.forEach((item, index) => {
      (item as HTMLElement).style.transitionDelay = `${index * 100}ms`;
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, [artworks]);

  return (
    <section
      id="featured"
      className="relative overflow-hidden bg-pure-black py-20 md:py-32"
    >
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal>
          <div className="line-accent mb-6" />
          <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent">
            {label}
          </p>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[0.95] text-pure-white">
            Tavole
          </h2>
        </Reveal>

        {artworks.length ? (
          <div
            ref={gridRef}
            className="mt-16 grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3"
          >
            {artworks.map((artwork, index) => (
              <div
                key={artwork.id}
                className={
                  index === 0
                    ? "lg:mt-24"
                    : index === 1
                      ? "lg:mt-48"
                      : "lg:mt-12"
                }
              >
                <ArtworkCard
                  artwork={artwork}
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <FeaturedEmptyState />
        )}
      </div>
    </section>
  );
}

function FeaturedEmptyState() {
  return (
    <div className="mt-16 grid gap-6 lg:grid-cols-[0.64fr_0.36fr] lg:items-stretch">
      <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-white/10 md:min-h-[560px]">
        <Image
          src="/images/portfolio/Pagina-2.png"
          alt="Anteprima di una tavola manga"
          fill
          sizes="(min-width: 1024px) 58vw, 92vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pure-black/70 via-pure-black/10 to-transparent" />
      </div>
      <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-elevated p-6 md:p-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-accent">
            Archivio in preparazione
          </p>
          <h3 className="mt-5 font-serif text-3xl font-semibold leading-tight text-pure-white md:text-4xl">
            La selezione pubblica delle tavole comparira&apos; qui.
          </h3>
          <p className="mt-6 text-base leading-relaxed text-pure-white/50">
            Una piccola anteprima del tono visivo dello studio, in attesa del
            primo archivio completo di tavole e illustrazioni.
          </p>
        </div>
        <Link
          href="/contact"
          className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-pure-white/70 transition-colors hover:text-accent"
        >
          Richiedi una commissione
          <ArrowUpRight size={15} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}

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
    <section className="border-t border-white/5 bg-pure-black py-20 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div ref={imgRef} className="relative overflow-hidden">
            <div className="clip-reveal">
              <Image
                src="/images/portfolio/Pagina-20.png"
                alt="Dettaglio di una tavola manga"
                width={800}
                height={1000}
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
            </div>
          </div>
          <div className="lg:pl-10">
            <Reveal delay={0.2}>
              <div className="line-accent mb-6" />
              <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent">
                Chi sono
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[0.95] text-pure-white">
                Uno studio
                <br />
                per manga
                <br />
                e illustrazioni
              </h2>
            </Reveal>
            <Reveal delay={0.4}>
              <p className="mt-8 max-w-lg text-base leading-[1.8] text-pure-white/60">
                Ethan lavora su tavole manga, character design e illustrazioni
                con un taglio narrativo: composizione, ritmo della pagina e cura
                del segno sono il centro del portfolio.
              </p>
            </Reveal>
            <Reveal delay={0.5}>
              <Link
                href="/about"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-pure-white transition-colors hover:text-accent"
              >
                <span className="border-b border-white/20 transition-colors group-hover:border-accent">
                  Scopri di piu&apos;
                </span>
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

function ProcessSection() {
  return (
    <section className="border-t border-white/5 bg-pure-black py-20 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal>
          <div className="line-accent mb-6" />
          <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent">
            Metodo
          </p>
          <h2 className="max-w-4xl font-serif text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[0.95] text-pure-white">
            Dal brief alla tavola finale
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {processSteps.map((item, index) => (
            <Reveal key={item.step} delay={index * 0.1}>
              <article className="flex h-full flex-col rounded-xl border border-white/10 bg-elevated p-6 md:p-8">
                <div className="mb-10 flex items-center justify-between gap-4">
                  <span className="font-mono text-sm text-white/30">
                    {item.step}
                  </span>
                  <CheckCircle2
                    size={18}
                    strokeWidth={1.5}
                    className="text-white/20"
                  />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-pure-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.8] text-pure-white/50">
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

function CommissionSection() {
  return (
    <section className="border-t border-white/5 bg-pure-black py-20 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:px-10 lg:grid-cols-[0.55fr_0.45fr] lg:items-center">
        <Reveal>
          <div className="line-accent mb-6" />
          <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent">
            Commissioni
          </p>
          <h2 className="max-w-4xl font-serif text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[0.95] text-pure-white">
            Hai una scena da trasformare in tavola?
          </h2>
          <p className="mt-8 max-w-xl text-base leading-[1.8] text-pure-white/50">
            Racconta formato, soggetto e atmosfera del progetto: il form
            raccoglie la richiesta e salva il brief per la risposta.
          </p>
          <Link
            href="/contact"
            className="mt-9 inline-flex items-center gap-3 rounded-full border border-accent bg-accent px-7 py-4 text-sm font-medium text-pure-black transition-all duration-300 hover:bg-pure-white hover:text-pure-black"
          >
            <Send size={16} strokeWidth={1.5} />
            Inizia un progetto
          </Link>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-white/10">
            <Image
              src="/images/portfolio/Pagina-29.png"
              alt="Tavola manga in bianco e nero"
              fill
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pure-black/60 via-transparent to-pure-black/20" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HomeExperience({
  featuredArtworks,
  featuredLabel,
}: {
  featuredArtworks: Artwork[];
  featuredLabel: string;
}) {
  return (
    <main>
      <HeroSection />
      <FeaturedSection artworks={featuredArtworks} label={featuredLabel} />
      <AboutTeaserSection />
      <ProcessSection />
      <CommissionSection />
    </main>
  );
}
