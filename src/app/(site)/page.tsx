import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { EmptyGallery } from "@/components/empty-gallery";
import { Reveal } from "@/components/reveal";
import { getArtworkImageUrl, getPublicArtworks } from "@/lib/artworks";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, allArtworks] = await Promise.all([
    getPublicArtworks({ featured: true }),
    getPublicArtworks(),
  ]);
  const heroArtwork = featured[0] || allArtworks[0];
  const heroImage = heroArtwork ? getArtworkImageUrl(heroArtwork.image_path) : null;
  const shownFeatured = (featured.length ? featured : allArtworks).slice(0, 3);

  return (
    <main>
      <section className="relative min-h-screen overflow-hidden px-5 pb-12 pt-28 md:px-10 md:pt-32">
        <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <Reveal className="relative z-10">
            <p className="text-xs uppercase tracking-[0.24em] text-sage">
              Manga boards / Italian artist
            </p>
            <h1 className="mt-6 max-w-4xl font-editorial text-[clamp(4.5rem,13vw,12rem)] leading-[0.82] text-balance">
              Tavole in silenzio.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted">
              Un portfolio editoriale per tavole manga, studi di inchiostro e
              commissioni trattate come immagini da galleria.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/portfolio"
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-[0.16em] text-paper transition hover:bg-sage"
              >
                Vedi opere
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center gap-3 rounded-full border border-line px-6 py-3 text-sm uppercase tracking-[0.16em] transition hover:border-sage hover:text-sage"
              >
                Commissioni
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="relative">
            <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full border border-sage/30" />
            <div className="pen-mask relative min-h-[480px] overflow-hidden bg-paper shadow-[0_30px_100px_rgba(17,17,17,0.12)] md:min-h-[660px]">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={heroArtwork.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 54vw, 92vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[480px] items-center justify-center bg-[radial-gradient(circle_at_45%_25%,var(--mist),transparent_38%),linear-gradient(135deg,var(--paper),#ebe5da)] md:min-h-[660px]">
                  <div className="h-[76%] w-[54%] rounded-[48%_52%_42%_58%/58%_39%_61%_42%] border border-foreground/15" />
                </div>
              )}
            </div>
          </Reveal>
        </div>
        <a
          href="#featured"
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted md:inline-flex"
        >
          Scroll
          <ArrowDown size={15} strokeWidth={1.5} />
        </a>
      </section>

      <section id="featured" className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 grid gap-8 md:grid-cols-[0.7fr_1fr] md:items-end">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.22em] text-sage">
                Opere in evidenza
              </p>
              <h2 className="mt-5 font-editorial text-6xl leading-none md:text-8xl">
                Frammenti scelti.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-xl text-lg leading-8 text-muted">
                Le preview tagliano l&apos;immagine come una pagina pubblicitaria; il
                dettaglio restituisce invece la tavola intera, verticale e
                leggibile.
              </p>
            </Reveal>
          </div>

          {shownFeatured.length ? (
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
              {shownFeatured.map((artwork, index) => (
                <Reveal
                  key={artwork.id}
                  delay={index * 0.08}
                  className={
                    index === 0
                      ? "lg:col-span-5 lg:mt-24"
                      : index === 1
                        ? "lg:col-span-4"
                        : "lg:col-span-3 lg:mt-44"
                  }
                >
                  <ArtworkCard
                    artwork={artwork}
                    priority={index === 0}
                    variant={index === 1 ? "tall" : "standard"}
                  />
                </Reveal>
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
