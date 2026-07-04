import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Chi sono",
  description:
    "La storia di Ethan, perche' disegna, il metodo di lavoro e gli strumenti.",
};

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

// Elenco placeholder: da confermare con il cliente.
const tools = [
  "Matite e portamine",
  "China e pennini",
  "Pennelli",
  "Retini",
  "Tavoletta grafica",
];

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
                <p className="text-base leading-[1.8] text-ink/50">
                  Oggi il mio lavoro fonde la precisione del tratto manga con la
                  ricchezza espressiva della tradizione artistica giapponese.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/5 bg-paper py-16 md:py-32">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.4fr_0.6fr] lg:gap-16">
            <Reveal>
              <div className="line-accent mb-6" />
              <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent">
                Perché disegno
              </p>
              <h2 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1] text-ink">
                Le storie chiedono spazio
              </h2>
            </Reveal>
            <div className="lg:pt-2">
              <Reveal delay={0.15}>
                <p className="mb-6 text-base leading-[1.8] text-ink/50">
                  Disegno da quando ho memoria: prima ancora di essere un
                  mestiere, e&apos; il modo piu&apos; naturale che ho per capire
                  quello che vedo e quello che provo. Una tavola mi permette di
                  fermare un momento, dargli un ritmo e restituirlo a chi
                  guarda.
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <p className="text-base leading-[1.8] text-ink/50">
                  Il bianco e nero, il segno a china e la pagina che respira
                  sono la mia lingua. Ogni storia che disegno e&apos; un modo
                  per condividere la meraviglia che da bambino trovavo nei
                  manga.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/5 bg-pure-white py-16 md:py-32">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Reveal>
            <div className="line-accent mb-6" />
            <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent">
              Il metodo
            </p>
            <h2 className="max-w-3xl font-serif text-[clamp(2rem,4vw,4rem)] font-medium leading-[0.95] text-ink">
              Metodo di lavoro e strumenti
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
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

          <Reveal delay={0.1}>
            <div className="mt-16 border-t border-ink/8 pt-10">
              <p className="text-[11px] uppercase tracking-[0.12em] text-accent">
                Strumenti
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-ink/10 bg-paper px-5 py-2.5 text-sm text-ink/60"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-ink/5 bg-paper py-16 md:py-28">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Reveal>
            <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
              <h2 className="max-w-2xl font-serif text-[clamp(1.75rem,3.4vw,3rem)] font-medium leading-[1.05] text-ink">
                Ti va di lavorare insieme o hai una domanda?
              </h2>
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center gap-3 rounded-full border border-accent bg-accent px-8 py-4 text-sm font-medium text-pure-white transition-all duration-300 hover:bg-ink"
              >
                Contattami
                <ArrowUpRight size={18} strokeWidth={1.5} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
