import type { Metadata } from "next";
import { EmptyGallery } from "@/components/empty-gallery";
import { PortfolioScroller } from "@/components/portfolio-scroller";
import { Reveal } from "@/components/reveal";
import { getPublicArtworks } from "@/lib/artworks";
import { getCollectionCopy, groupArtworksByCollection } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Archivio delle tavole manga di Ethan.",
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const artworks = await getPublicArtworks();
  const collections = groupArtworksByCollection(artworks);

  return (
    <main>
      <section className="border-b border-ink/5 bg-pure-white py-24 md:py-40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Reveal>
            <div className="line-accent mb-6" />
            <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent">
              Archivio
            </p>
            <h1 className="mb-8 font-serif text-[clamp(2.5rem,6vw,6rem)] font-medium leading-[0.9] text-ink">
              Portfolio
            </h1>
            <p className="max-w-xl text-base leading-[1.8] text-ink/50">
              Una selezione di tavole presentate con crop editoriali, ritmo
              irregolare e spazio sufficiente per lasciar respirare il segno.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 md:px-10">
          {collections.length ? (
            <div className="space-y-10 md:space-y-16">
              {collections.map((collection) => (
                <PortfolioScroller
                  key={collection.slug}
                  id={collection.slug}
                  title={collection.category}
                  description={getCollectionCopy(collection.slug).description}
                  artworks={collection.artworks}
                />
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
