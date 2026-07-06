import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import {
  hasSocialLinks,
  SocialLinks,
} from "@/components/social-links";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contatti",
  description:
    "Scrivimi per commissioni, collaborazioni o per parlare di tavole e illustrazioni.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const email = settings.contact_email.trim();
  const socials = {
    instagramUrl: settings.instagram_url,
    twitterUrl: settings.twitter_url,
    artstationUrl: settings.artstation_url,
  };

  return (
    <main className="min-h-screen">
      <section className="border-b border-ink/5 bg-pure-white py-24 md:py-40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="line-accent mb-6" />
              <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent-ink">
                Contatti
              </p>
              <h1 className="max-w-2xl font-serif text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.95] text-ink">
                Mettiti in contatto
              </h1>
              <p className="mt-8 max-w-lg text-base leading-[1.8] text-ink/70">
                Che sia una commissione, una collaborazione o una semplice
                domanda sulle tavole: raccontami la tua idea. La risposta
                include disponibilita&apos;, tempi e una prima direzione visiva.
              </p>
              <div className="mt-10 space-y-5">
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="block text-lg font-medium text-accent-ink transition-colors hover:text-ink"
                  >
                    {email}
                  </a>
                ) : null}
                {hasSocialLinks(socials) ? (
                  <div className="flex gap-4 pt-2">
                    <SocialLinks
                      urls={socials}
                      linkClassName="text-ink/60 transition-colors hover:text-accent-ink"
                    />
                  </div>
                ) : null}
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
