import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getArtworkBySlug, getArtworkImageUrl, getPublicArtworks } from "@/lib/artworks";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 60;

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

  const imageUrl = getArtworkImageUrl(artwork.image_path);
  const currentIndex = artworks.findIndex((item) => item.slug === artwork.slug);
  const previous = currentIndex > 0 ? artworks[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < artworks.length - 1
      ? artworks[currentIndex + 1]
      : null;

  return (
    <main className="min-h-screen">
      <section className="bg-pure-black pb-24 pt-32 md:pt-40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <article className="grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-pure-white/40 transition-colors hover:text-accent"
              >
                <ArrowLeft size={15} strokeWidth={1.5} /> Portfolio
              </Link>
              <p className="mt-8 text-[11px] uppercase tracking-[0.12em] text-accent">
                {artwork.category || "Manga"}
              </p>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-[0.95] text-pure-white md:text-5xl lg:text-6xl">
                {artwork.title}
              </h1>
              {artwork.year ? (
                <p className="mt-6 text-sm text-pure-white/40">{artwork.year}</p>
              ) : null}
              {artwork.description ? (
                <p className="mt-8 max-w-md text-base leading-[1.8] text-pure-white/60">
                  {artwork.description}
                </p>
              ) : null}
              <nav className="mt-12 flex flex-wrap gap-3">
                {previous ? (
                  <Link
                    href={`/portfolio/${previous.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-[11px] uppercase tracking-[0.12em] text-pure-white transition-all hover:border-accent hover:text-accent"
                  >
                    <ArrowLeft size={14} strokeWidth={1.5} /> Precedente
                  </Link>
                ) : null}
                {next ? (
                  <Link
                    href={`/portfolio/${next.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-[11px] uppercase tracking-[0.12em] text-pure-white transition-all hover:border-accent hover:text-accent"
                  >
                    Successiva <ArrowRight size={14} strokeWidth={1.5} />
                  </Link>
                ) : null}
              </nav>
            </aside>
            <div className="rounded-2xl border border-white/10 bg-elevated p-3 md:p-5">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={artwork.title}
                  width={artwork.image_width || 1200}
                  height={artwork.image_height || 1800}
                  sizes="(min-width: 1024px) 64vw, 92vw"
                  className="h-auto w-full rounded-xl object-contain"
                  priority
                />
              ) : (
                <div className="min-h-[70vh] rounded-xl bg-white/5" />
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
