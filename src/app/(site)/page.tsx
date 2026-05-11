"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, Quote } from "lucide-react";
import { Reveal } from "@/components/reveal";

const featuredArtworks = [
  { id: 1, slug: "in-viaggio", title: "In Viaggio", category: "Slice of Life", year: "2025", image_path: "Pagina-2.png" },
  { id: 2, slug: "non-vedo-l-ora", title: "Non Vedo l'Ora", category: "Seinen", year: "2025", image_path: "Pagina-13.png" },
  { id: 3, slug: "il-primo-incontro", title: "Il Primo Incontro", category: "Shonen", year: "2024", image_path: "Pagina-17.png" },
];

function getImageUrl(path: string) { return `/images/portfolio/${path}`; }

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.floor(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, end, duration]);

  return { count, ref };
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value, 2000);
  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-7xl md:text-[180px] font-bold text-accent leading-none">{count}{suffix}</p>
      <p className="mt-2 text-base md:text-lg text-pure-white/70">{label}</p>
    </div>
  );
}

/* Hero */
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 150); }, []);

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-pure-black">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 70% 30%, rgba(24,64,123,0.45) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(94,234,212,0.06) 0%, transparent 40%)` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-pure-black/40 via-transparent to-pure-black/80" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 md:px-10 pt-32 pb-20">
        {/* Linea decorativa animata */}
        <div className={`h-px bg-gradient-to-r from-transparent via-accent to-transparent transition-all duration-1000 ${loaded ? "w-full opacity-100" : "w-0 opacity-0"}`} />

        <h1 className="mt-8 font-display text-5xl md:text-8xl font-bold text-pure-white uppercase leading-[0.9]">
          {"DOVE IL DISEGNO".split(" ").map((word, i) => (
            <span key={i} className={`inline-block mr-[0.25em] transition-all duration-700 ${loaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`} style={{ transitionDelay: `${200 + i * 120}ms` }}>
              {word}
            </span>
          ))}
          <br />
          {"PRENDE FORMA".split(" ").map((word, i) => (
            <span key={i} className={`inline-block mr-[0.25em] transition-all duration-700 ${loaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`} style={{ transitionDelay: `${440 + i * 120}ms` }}>
              <span className="text-accent drop-shadow-[0_0_30px_rgba(94,234,212,0.35)]">{word}</span>
            </span>
          ))}
        </h1>

        <div className={`mt-8 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "800ms" }}>
          <p className="text-lg md:text-xl text-pure-white/70 max-w-lg leading-relaxed">
            Portfolio manga &amp; commissioni artistiche di Ethan.
          </p>
        </div>

        <div className={`mt-10 flex items-center gap-6 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "1000ms" }}>
          <Link href="/portfolio"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-accent px-8 py-4 text-base font-medium text-pure-black transition-all duration-500 hover:shadow-[0_0_30px_rgba(94,234,212,0.35)]">
            <span className="relative z-10">Vedi Opere</span>
            <ArrowUpRight size={18} className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span className="absolute inset-0 -translate-x-full bg-pure-white transition-transform duration-500 group-hover:translate-x-0" />
          </Link>
          <Link href="/contact"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-pure-white/60 transition-colors duration-300 hover:text-accent">
            Richiedi una commissione
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <a href="#featured" className={`absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "1200ms" }}>
        <span className="text-[10px] uppercase tracking-[0.2em] text-pure-white/40">Scroll</span>
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-pure-white/20 p-1">
          <span className="h-2 w-1 rounded-full bg-accent animate-bounce" />
        </span>
      </a>
    </section>
  );
}

/* Featured Works */
function FeaturedSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;
    const items = container.querySelectorAll(".grid-item");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-inview"); });
    }, { threshold: 0.1, rootMargin: "-50px 0px" });
    items.forEach((item, i) => { (item as HTMLElement).style.transitionDelay = `${i * 100}ms`; observer.observe(item); });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="featured" className="relative bg-deep-blue py-20 md:py-40 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal>
          <div className="neon-line mb-6" />
          <p className="text-xs uppercase tracking-[0.22em] text-accent mb-4">Opere in evidenza</p>
          <h2 className="font-display text-4xl md:text-7xl font-bold text-pure-white uppercase">Tavole</h2>
        </Reveal>
        <div ref={gridRef} className="mt-16 grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredArtworks.map((artwork, index) => (
            <div key={artwork.id} className={index === 0 ? "lg:mt-24" : index === 1 ? "lg:mt-48" : "lg:mt-12"}>
              <div data-pos={index % 2 === 0 ? "left" : "right"} className="group grid-item">
                <Link href={`/portfolio/${artwork.slug}`} className="block">
                  <article className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl bg-deep-blue/50">
                      <div className="aspect-[3/4] relative overflow-hidden">
                        <Image src={getImageUrl(artwork.image_path)} alt={artwork.title} fill priority={index === 0} sizes="38vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                        <div className="absolute inset-0 bg-pure-black/0 transition-all duration-500 group-hover:bg-pure-black/40 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center w-16 h-16 rounded-full border-2 border-accent text-accent">
                            <ArrowUpRight size={24} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-accent uppercase tracking-wider">{artwork.category}</p>
                      <h3 className="mt-1 font-display text-xl md:text-2xl font-bold text-pure-white leading-tight">{artwork.title}</h3>
                      <p className="mt-1 text-sm text-pure-white/50">{artwork.year}</p>
                    </div>
                  </article>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* About Teaser */
function AboutTeaserSection() {
  const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.querySelector(".clip-reveal")?.classList.add("is-inview"); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bg-pure-black py-20 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div ref={imgRef} className="relative overflow-hidden">
            <div className="clip-reveal">
              <Image src="/images/portfolio/Pagina-20.png" alt="Ethan al lavoro" width={800} height={1000} className="w-full aspect-[4/5] object-cover rounded-2xl" />
            </div>
          </div>
          <div className="lg:pl-10">
            <Reveal delay={0.2}><div className="neon-line mb-6" /><p className="text-xs uppercase tracking-[0.22em] text-accent mb-4">Chi sono</p></Reveal>
            <Reveal delay={0.3}><h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-pure-white uppercase leading-[0.95]">Uno studio<br />per manga<br />e illustrazioni</h2></Reveal>
            <Reveal delay={0.4}><p className="mt-8 text-lg text-pure-white/70 leading-relaxed max-w-lg">Mi chiamo Ethan e sono un artista italiano. Disegno tavole manga, character design e illustrazioni. La mia passione per la cultura giapponese si riflette in ogni tratto, in ogni tavola che creo.</p></Reveal>
            <Reveal delay={0.5}>
              <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-base font-medium text-pure-white hover:text-accent transition-colors group">
                <span className="border-b border-pure-white/30 group-hover:border-accent transition-colors">Scopri di piu&apos;</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Stats */
function StatsSection() {
  return (
    <section className="bg-deep-blue py-20 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal><div className="neon-line mb-6" /><h2 className="font-display text-4xl md:text-7xl font-bold text-pure-white uppercase mb-16 md:mb-24">Numeri che<br />parlano</h2></Reveal>
        <div className="grid gap-12 md:grid-cols-3">
          <Stat value={120} suffix="+" label="Tavole completate" />
          <Stat value={50} suffix="+" label="Clienti soddisfatti" />
          <Stat value={8} suffix="" label="Anni di esperienza" />
        </div>
      </div>
    </section>
  );
}

/* Testimonials */
const testimonials = [
  { text: "Ethan ha trasformato la mia idea in una tavola manga incredibile. La sua attenzione ai dettagli e la capacita' di catturare l'emozione nei personaggi e' straordinaria.", name: "Marco R.", role: "Cliente" },
  { text: "Ho commissionato un character design per il mio progetto indie. Ethan ha consegnato un lavoro oltre ogni aspettativa, con una cura maniacale per i dettagli.", name: "Laura B.", role: "Game Developer" },
  { text: "Le tavole di Ethan hanno un'anima. Si vede che dietro ogni tratto c'e' passione, studio e un profondo rispetto per l'arte del manga.", name: "Yuki T.", role: "Editor Manga" },
];

function TestimonialsSection() {
  return (
    <section className="bg-pure-white py-20 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal><div className="w-[60px] h-[1px] bg-deep-blue mb-6" /><h2 className="font-display text-4xl md:text-7xl font-bold text-deep-blue uppercase mb-16">Pareri</h2></Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="bg-deep-blue p-8 rounded-2xl h-full flex flex-col">
                <Quote size={24} className="text-accent mb-4" />
                <p className="text-base text-pure-white leading-relaxed flex-1">{t.text}</p>
                <div className="mt-6 pt-6 border-t border-pure-white/10">
                  <p className="text-base font-bold text-accent">{t.name}</p>
                  <p className="text-sm text-pure-white/60">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Blog */
const blogPosts = [
  { image: "/images/portfolio/Pagina-29.png", date: "15 Gen 2026", title: "Come nasce una tavola manga", excerpt: "Dal rough sketch all'inking finale: un viaggio nel processo creativo." },
  { image: "/images/portfolio/Pagina-20.png", date: "02 Gen 2026", title: "L'arte del sumi-e nell'illustrazione moderna", excerpt: "Le tecniche tradizionali giapponesi incontrano il manga contemporaneo." },
  { image: "/images/portfolio/Pagina-17.png", date: "18 Dic 2025", title: "Character design: creare personaggi memorabili", excerpt: "I segreti per dare personalita' e profondita' ai tuoi personaggi." },
];

function BlogTeaserSection() {
  return (
    <section className="bg-pure-black py-20 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal><div className="neon-line mb-6" /><h2 className="font-display text-4xl md:text-7xl font-bold text-pure-white uppercase mb-16">Aggiornamenti</h2></Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {blogPosts.map((post, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <article className="group cursor-pointer">
                <div className="overflow-hidden rounded-2xl mb-5">
                  <Image src={post.image} alt={post.title} width={600} height={340} className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <p className="text-sm text-accent mb-2">{post.date}</p>
                <h3 className="text-xl font-bold text-pure-white mb-2 group-hover:text-accent transition-colors">{post.title}</h3>
                <p className="text-base text-pure-white/60 leading-relaxed">{post.excerpt}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedSection />
      <AboutTeaserSection />
      <StatsSection />
      <TestimonialsSection />
      <BlogTeaserSection />
    </main>
  );
}
