import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Studio",
  description: "Profilo dello studio e della pratica artistica.",
};

export default function AboutPage() {
  return (
    <main className="px-5 pb-24 pt-36 md:px-10 md:pt-44">
      <div className="mx-auto max-w-7xl">
        <Reveal className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sage">
              Studio
            </p>
            <h1 className="mt-5 font-editorial text-7xl leading-none md:text-[10rem]">
              Segno, pausa, pagina.
            </h1>
          </div>
          <p className="max-w-2xl text-xl leading-9 text-muted">
            La pratica nasce dalla tavola manga, ma viene presentata con un
            passo piu vicino al magazine, alla stampa fine art e alla pubblicita
            giapponese silenziosa.
          </p>
        </Reveal>

        <section className="mt-24 grid gap-10 lg:grid-cols-[0.58fr_0.42fr]">
          <Reveal className="relative min-h-[520px] overflow-hidden rounded-[34px] bg-paper p-8 md:p-12">
            <div className="absolute left-[10%] top-[14%] h-[68%] w-[46%] rounded-[48%_52%_46%_54%/56%_38%_62%_44%] border border-foreground/15" />
            <div className="absolute right-[12%] top-[18%] h-[58%] w-px rotate-12 bg-foreground/20" />
            <div className="absolute bottom-12 left-12 max-w-xs">
              <p className="font-editorial text-5xl leading-none">
                Una tavola non va riempita. Va ascoltata.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="space-y-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sage">
                Metodo
              </p>
              <p className="mt-5 text-lg leading-8 text-muted">
                Ogni commissione parte da ritmo, atmosfera e formato. Il
                risultato deve funzionare come sequenza narrativa, ma anche come
                immagine autonoma da esporre.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sage">
                Direzione
              </p>
              <p className="mt-5 text-lg leading-8 text-muted">
                Bianco, nero, grigi, pochi accenti. Layout rarefatti. Tipografia
                editoriale. Nessun rumore da portfolio tecnico.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center gap-3 rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-[0.16em] text-paper transition hover:bg-sage"
            >
              Parliamo di una commissione
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </Link>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
