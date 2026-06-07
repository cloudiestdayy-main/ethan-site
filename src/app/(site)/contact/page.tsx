import type { Metadata } from "next";
import { InstagramIcon, XIcon, ArtStationIcon } from "@/components/social-icons";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Commissioni",
  description: "Richiedi una commissione o un progetto su tavola manga.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-ink/5 bg-pure-white py-24 md:py-40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="line-accent mb-6" />
              <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent">
                Commissioni
              </p>
              <h1 className="max-w-2xl font-serif text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.95] text-ink">
                Inizia un progetto
              </h1>
              <p className="mt-8 max-w-lg text-base leading-[1.8] text-ink/50">
                Raccontami la tua idea, il soggetto, il formato desiderato e il
                mood. La risposta include disponibilita&apos;, tempi e una prima
                direzione visiva.
              </p>
              <div className="mt-10 space-y-5">
                <a
                  href="mailto:cloudiestdayy@gmail.com"
                  className="block text-lg font-medium text-accent transition-colors hover:text-ink"
                >
                  cloudiestdayy@gmail.com
                </a>
                <div className="flex gap-4 pt-2">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink/25 transition-colors hover:text-accent"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="h-5 w-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink/25 transition-colors hover:text-accent"
                    aria-label="X"
                  >
                    <XIcon className="h-5 w-5" />
                  </a>
                  <a
                    href="https://artstation.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink/25 transition-colors hover:text-accent"
                    aria-label="ArtStation"
                  >
                    <ArtStationIcon className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-ink/8 bg-paper p-5 md:p-10">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
