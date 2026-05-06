import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Commissioni",
  description: "Richiedi una commissione o un progetto su tavola manga.",
};

export default function ContactPage() {
  return (
    <main className="px-5 pb-24 pt-36 md:px-10 md:pt-44">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-sage">
            Commissioni
          </p>
          <h1 className="mt-5 font-editorial text-7xl leading-none md:text-[10rem]">
            Una tavola, una storia.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-muted">
            Scrivi il soggetto, il formato desiderato e il mood. La risposta
            include disponibilita, tempi e una prima direzione visiva.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="rounded-[30px] bg-paper p-6 md:p-10">
          <ContactForm />
        </Reveal>
      </div>
    </main>
  );
}
