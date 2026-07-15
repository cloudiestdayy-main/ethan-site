import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArtworkLightbox } from "@/components/artwork-lightbox";
import { ArtworkViewTracker } from "@/components/artwork-view-tracker";
import { KIND_LABELS } from "@/lib/artwork-kinds";
import {
  getArtworkBySlug,
  getArtworkImages,
  getArtworkImageUrl,
  getPublicArtworks,
  getPublicArtworksStatic,
} from "@/lib/artworks";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const artworks = await getPublicArtworksStatic();
  return artworks.map((artwork) => ({ slug: artwork.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) return { title: "Opera" };
  const imageUrl = getArtworkImageUrl(artwork.image_path);
  return {
    title: artwork.title,
    description: artwork.description || "Tavola manga di Ethan.",
    openGraph: imageUrl ? { images: [{ url: imageUrl }] } : undefined,
  };
}

export default async function ArtworkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [artwork, artworks] = await Promise.all([
    getArtworkBySlug(slug),
    getPublicArtworks(),
  ]);
  if (!artwork) notFound();

  const extraImages = await getArtworkImages(artwork.id);
  const imageUrl = getArtworkImageUrl(artwork.image_path);
  const pageCount = 1 + extraImages.length;
  const kindLabels = KIND_LABELS[artwork.kind];
  // Prev/next restano dentro lo stesso tipo: tavole e illustrazioni
  // sono archivi separati anche nella navigazione di dettaglio.
  const sameKind = artworks.filter((item) => item.kind === artwork.kind);
  const currentIndex = sameKind.findIndex((item) => item.slug === artwork.slug);
  const previous = currentIndex > 0 ? sameKind[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < sameKind.length - 1
      ? sameKind[currentIndex + 1]
      : null;

  return (
    <main className="min-h-screen">
      <ArtworkViewTracker slug={artwork.slug} />
      <section className="bg-pure-white pb-16 pt-28 md:pb-24 md:pt-40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Link
            href={`/portfolio?tab=${kindLabels.tabSlug}`}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink/60 transition-colors hover:text-accent-ink"
          >
            <ArrowLeft size={15} strokeWidth={1.5} /> I miei lavori
          </Link>
          {/* Su mobile prima l'opera, poi il testo: chi arriva da un link
              deve vedere subito l'immagine. */}
          <article className="mt-8 grid gap-10 lg:grid-cols-[0.34fr_0.66fr] lg:gap-12">
            <aside className="order-2 lg:order-1 lg:sticky lg:top-32 lg:self-start">
              <p className="text-[11px] uppercase tracking-[0.12em] text-accent-ink">
                {kindLabels.singular}
                {artwork.category ? ` · ${artwork.category}` : ""}
              </p>
              <h1 className="mt-4 font-serif text-4xl font-medium leading-[0.95] text-ink md:text-5xl lg:text-6xl">
                {artwork.title}
              </h1>
              {artwork.year || pageCount > 1 ? (
                <p className="mt-6 text-sm text-ink/60">
                  {[
                    artwork.year,
                    pageCount > 1 ? `${pageCount} tavole` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {artwork.description ? (
                <p className="mt-8 max-w-md text-base leading-[1.8] text-ink/70">
                  {artwork.description}
                </p>
              ) : null}
              <nav
                aria-label="Altre opere"
                className="mt-10 flex flex-col gap-3 md:mt-12"
              >
                {previous ? (
                  <Link
                    href={`/portfolio/${previous.slug}`}
                    className="group rounded-2xl border border-ink/8 px-5 py-4 transition-all hover:border-accent-ink"
                  >
                    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink/60">
                      <ArrowLeft size={13} strokeWidth={1.5} /> Precedente
                    </span>
                    <span className="mt-1 block truncate font-serif text-lg font-medium text-ink transition-colors group-hover:text-accent-ink">
                      {previous.title}
                    </span>
                  </Link>
                ) : null}
                {next ? (
                  <Link
                    href={`/portfolio/${next.slug}`}
                    className="group rounded-2xl border border-ink/8 px-5 py-4 text-right transition-all hover:border-accent-ink"
                  >
                    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink/60">
                      Successiva <ArrowRight size={13} strokeWidth={1.5} />
                    </span>
                    <span className="mt-1 block truncate font-serif text-lg font-medium text-ink transition-colors group-hover:text-accent-ink">
                      {next.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            </aside>
            <div className="order-1 grid gap-4 lg:order-2 md:gap-6">
              <div className="rounded-2xl border border-ink/8 bg-paper p-2 md:p-5">
                {imageUrl ? (
                  <ArtworkLightbox
                    src={imageUrl}
                    alt={
                      pageCount > 1
                        ? `${artwork.title} — tavola 1 di ${pageCount}`
                        : artwork.title
                    }
                    width={artwork.image_width || 1200}
                    height={artwork.image_height || 1800}
                  />
                ) : (
                  <div className="min-h-[70vh] rounded-xl bg-ink/5" />
                )}
              </div>
              {extraImages.map((image, index) => {
                const pageUrl = getArtworkImageUrl(image.image_path);
                if (!pageUrl) return null;
                return (
                  <div
                    key={image.id}
                    className="rounded-2xl border border-ink/8 bg-paper p-2 md:p-5"
                  >
                    <ArtworkLightbox
                      src={pageUrl}
                      alt={`${artwork.title} — tavola ${index + 2} di ${pageCount}`}
                      width={image.image_width || 1200}
                      height={image.image_height || 1800}
                      priority={false}
                    />
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
