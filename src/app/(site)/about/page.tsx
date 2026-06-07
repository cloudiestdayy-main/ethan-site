import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Studio",
  description: "Chi sono e la mia pratica artistica.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="relative flex min-h-[60vh] items-end overflow-hidden pb-12 pt-28 md:min-h-[80vh] md:pb-24 md:pt-40">
        <div className="absolute inset-0">
          <Image
            src="/images/portfolio/Pagina-29.png"
            alt="Studio"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-pure-white/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-pure-white via-pure-white/20 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 md:px-10">
          <Reveal>
            <h1 className="max-w-3xl font-serif text-[clamp(3rem,7vw,7rem)] font-medium leading-[0.9] text-ink">
              Chi sono
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-ink/5 bg-pure-white py-16 md:py-32">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.55fr_0.45fr] lg:items-start">
            <div className="relative overflow-hidden">
              <div className="clip-reveal">
                <Image
                  src="/images/artist/ethan-portrait.png"
                  alt="Ritratto di Ethan"
                  width={800}
                  height={1067}
                  className="aspect-[3/4] w-full rounded-2xl object-cover"
                />
              </div>
            </div>
            <div className="lg:pl-10">
              <Reveal delay={0.2}>
                <div className="line-accent mb-6" />
                <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent">
                  La mia storia
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <h2 className="mb-8 font-serif text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1] text-ink">
                  Segno, pausa, pagina
                </h2>
              </Reveal>
              <Reveal delay={0.4}>
                <p className="mb-6 text-base leading-[1.8] text-ink/50">
                  Mi chiamo Ethan e sono un artista italiano con una passione
                  viscerale per la cultura giapponese. Fin da bambino, i manga
                  hanno rappresentato per me non solo una forma di
                  intrattenimento, ma un vero e proprio linguaggio visivo
                  attraverso cui esprimere emozioni e narrare storie.
                </p>
              </Reveal>
              <Reveal delay={0.5}>
                <p className="mb-6 text-base leading-[1.8] text-ink/50">
                  Il mio viaggio artistico e&apos; iniziato con i primi
                  scarabocchi ispirati a Dragon Ball ed e&apos; proseguito
                  attraverso anni di studio approfondito delle tecniche
                  tradizionali giapponesi. Ho avuto la fortuna di viaggiare in
                  Giappone, dove ho potuto immergermi nella cultura
                  dell&apos;inking e del sumi-e, affinando il mio stile
                  personale.
                </p>
              </Reveal>
              <Reveal delay={0.6}>
                <p className="mb-10 text-base leading-[1.8] text-ink/50">
                  Oggi il mio lavoro fonde la precisione del tratto manga con la
                  ricchezza espressiva della tradizione artistica giapponese.
                </p>
              </Reveal>
              <Reveal delay={0.7}>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-full border border-accent bg-accent px-8 py-4 text-sm font-medium text-pure-white transition-all duration-300 hover:bg-ink"
                >
                  Parliamo di una commissione
                  <ArrowUpRight size={18} strokeWidth={1.5} />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
