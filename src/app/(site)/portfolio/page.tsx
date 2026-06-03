import type { Metadata } from "next";
import { EmptyGallery } from "@/components/empty-gallery";
import { PortfolioScroller } from "@/components/portfolio-scroller";
import { Reveal } from "@/components/reveal";
import { getPublicArtworks } from "@/lib/artworks";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Archivio delle tavole manga di Ethan.",
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const artworks = await getPublicArtworks();

  return (
    <main>
      <section className="border-b border-white/5 bg-pure-black py-32 md:py-40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Reveal>
            <div className="line-accent mb-6" />
            <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent">
              Archivio
            </p>
            <h1 className="mb-8 font-serif text-[clamp(2.5rem,6vw,6rem)] font-semibold leading-[0.9] text-pure-white">
              Portfolio
            </h1>
            <p className="max-w-xl text-base leading-[1.8] text-pure-white/50">
              Una selezione di tavole presentate con crop editoriali, ritmo
              irregolare e spazio sufficiente per lasciar respirare il segno.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper-light py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          {artworks.length ? (
            <PortfolioScroller artworks={artworks} />
          ) : (
            <EmptyGallery />
          )}
        </div>
      </section>
    </main>
  );
}
