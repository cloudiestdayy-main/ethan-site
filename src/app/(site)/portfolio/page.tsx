import type { Metadata } from "next";
import { ArtworkCard } from "@/components/artwork-card";
import { EmptyGallery } from "@/components/empty-gallery";
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
      <section className="bg-pure-black py-32 md:py-44">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Reveal>
            <div className="neon-line mb-6" />
            <p className="text-xs uppercase tracking-[0.22em] text-accent mb-4">Archivio</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-8xl font-bold text-pure-white uppercase leading-[0.9] mb-8">Portfolio</h1>
            <p className="max-w-xl text-lg text-pure-white/70 leading-relaxed">
              Una selezione di tavole presentate con crop editoriali, ritmo irregolare e spazio sufficiente per lasciar respirare il segno.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-deep-blue py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          {artworks.length ? (
            <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {artworks.map((artwork, index) => (
                <div key={artwork.id} className={index % 3 === 0 ? "lg:mt-16" : index % 3 === 1 ? "lg:mt-32" : "lg:mt-8"}>
                  <ArtworkCard artwork={artwork} priority={index < 3} position={index % 2 === 0 ? "left" : "right"} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyGallery />
          )}
        </div>
      </section>
    </main>
  );
}
