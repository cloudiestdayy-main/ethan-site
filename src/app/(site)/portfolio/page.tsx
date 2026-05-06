import type { Metadata } from "next";
import { ArtworkCard } from "@/components/artwork-card";
import { EmptyGallery } from "@/components/empty-gallery";
import { Reveal } from "@/components/reveal";
import { getPublicArtworks } from "@/lib/artworks";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Archivio delle tavole manga pubblicate dallo studio.",
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const artworks = await getPublicArtworks();

  return (
    <main className="px-5 pb-24 pt-36 md:px-10 md:pt-44">
      <div className="mx-auto max-w-7xl">
        <Reveal className="grid gap-8 border-b border-line pb-16 md:grid-cols-[0.75fr_1fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sage">
              Archivio
            </p>
            <h1 className="mt-5 font-editorial text-7xl leading-none md:text-9xl">
              Portfolio.
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-muted">
            Una selezione di tavole presentate con crop editoriali, ritmo
            irregolare e spazio sufficiente per lasciar respirare il segno.
          </p>
        </Reveal>

        <section className="pt-16">
          {artworks.length ? (
            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-12">
              {artworks.map((artwork, index) => {
                const pattern = index % 5;
                const className =
                  pattern === 0
                    ? "lg:col-span-5 lg:mt-20"
                    : pattern === 1
                      ? "lg:col-span-4"
                      : pattern === 2
                        ? "lg:col-span-3 lg:mt-36"
                        : pattern === 3
                          ? "lg:col-span-7"
                          : "lg:col-span-5 lg:mt-16";
                const variant =
                  pattern === 2 ? "tall" : pattern === 3 ? "wide" : "standard";

                return (
                  <Reveal key={artwork.id} className={className}>
                    <ArtworkCard
                      artwork={artwork}
                      variant={variant}
                      priority={index < 2}
                    />
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <EmptyGallery />
          )}
        </section>
      </div>
    </main>
  );
}
