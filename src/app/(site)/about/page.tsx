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
      <section className="relative min-h-[80vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <Image src="/images/portfolio/Pagina-29.png" alt="Studio" fill className="object-cover" />
          <div className="absolute inset-0 bg-pure-black/70" />
        </div>
        <div className="relative z-10 text-center px-5">
          <h1 className="font-display text-6xl md:text-9xl font-bold text-pure-white uppercase">CHI SONO</h1>
          <p className="mt-6 text-lg text-pure-white/80">Artista italiano, cuore giapponese</p>
        </div>
      </section>

      <section className="bg-deep-blue py-20 md:py-40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.58fr_0.42fr] lg:items-start">
            <div className="relative overflow-hidden">
              <div className="clip-reveal">
                <Image src="/images/portfolio/Pagina-20.png" alt="Tavola esempio" width={800} height={1067} className="w-full aspect-[3/4] object-cover rounded-2xl" />
              </div>
            </div>
            <div className="lg:pl-10">
              <Reveal delay={0.2}><div className="neon-line mb-6" /><p className="text-xs uppercase tracking-[0.22em] text-accent mb-4">La mia storia</p></Reveal>
              <Reveal delay={0.3}><h2 className="font-display text-3xl md:text-5xl font-bold text-pure-white uppercase leading-[0.95] mb-8">Segno, pausa, pagina</h2></Reveal>
              <Reveal delay={0.4}><p className="text-lg text-pure-white/80 leading-relaxed mb-6">Mi chiamo Ethan e sono un artista italiano con una passione viscerale per la cultura giapponese. Fin da bambino, i manga hanno rappresentato per me non solo una forma di intrattenimento, ma un vero e proprio linguaggio visivo attraverso cui esprimere emozioni e narrare storie.</p></Reveal>
              <Reveal delay={0.5}><p className="text-lg text-pure-white/80 leading-relaxed mb-6">Il mio viaggio artistico e' iniziato con i primi scarabocchi ispirati a Dragon Ball ed e' proseguito attraverso anni di studio approfondito delle tecniche tradizionali giapponesi. Ho avuto la fortuna di viaggiare in Giappone, dove ho potuto immergermi nella cultura dell&apos;inking e del sumi-e, affinando il mio stile personale.</p></Reveal>
              <Reveal delay={0.6}><p className="text-lg text-pure-white/80 leading-relaxed mb-10">Oggi il mio lavoro fonde la precisione del tratto manga con la ricchezza espressiva della tradizione artistica giapponese.</p></Reveal>
              <Reveal delay={0.7}>
                <Link href="/contact" className="inline-flex items-center gap-3 bg-accent text-pure-black px-8 py-4 text-base font-medium hover:bg-pure-white transition-colors duration-300">
                  Parliamo di una commissione <ArrowUpRight size={18} />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
