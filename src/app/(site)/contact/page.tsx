import type { Metadata } from "next";
import { Camera, MessageCircle, Palette } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Commissioni",
  description: "Richiedi una commissione o un progetto su tavola manga.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-deep-blue py-32 md:py-44">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="neon-line mb-6" />
              <p className="text-xs uppercase tracking-[0.22em] text-accent mb-4">Commissioni</p>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-pure-white uppercase leading-[0.95]">Inizia un progetto</h1>
              <p className="mt-8 text-lg text-pure-white/70 leading-relaxed max-w-lg">
                Raccontami la tua idea, il soggetto, il formato desiderato e il mood. La risposta include disponibilita', tempi e una prima direzione visiva.
              </p>
              <div className="mt-10 space-y-4">
                <a href="mailto:cloudiestdayy@gmail.com" className="block text-lg font-medium text-accent hover:text-pure-white transition-colors">cloudiestdayy@gmail.com</a>
                <div className="flex gap-4 pt-4">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-pure-white hover:text-accent transition-colors" aria-label="Instagram"><Camera size={24} /></a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-pure-white hover:text-accent transition-colors" aria-label="Twitter"><MessageCircle size={24} /></a>
                  <a href="https://artstation.com" target="_blank" rel="noopener noreferrer" className="text-pure-white hover:text-accent transition-colors" aria-label="ArtStation"><Palette size={24} /></a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-[20px] bg-pure-black/30 p-6 md:p-10">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
