import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getArtworkBySlug,
  getArtworkImageUrl,
  getPublicArtworks,
} from "@/lib/artworks";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    return {
      title: "Opera",
    };
  }

  const imageUrl = getArtworkImageUrl(artwork.image_path);

  return {
    title: artwork.title,
    description: artwork.description || "Tavola manga dallo studio.",
    openGraph: imageUrl
      ? {
          images: [{ url: imageUrl }],
        }
      : undefined,
  };
}

export default async function ArtworkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [artwork, artworks] = await Promise.all([
    getArtworkBySlug(slug),
    getPublicArtworks(),
  ]);

  if (!artwork) {
    notFound();
  }

  const imageUrl = getArtworkImageUrl(artwork.image_path);
  const currentIndex = artworks.findIndex((item) => item.slug === artwork.slug);
  const previous = currentIndex > 0 ? artworks[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < artworks.length - 1
      ? artworks[currentIndex + 1]
      : null;

  return (
    <main className="px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <article className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.34fr_0.66fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted transition hover:text-sage"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            Portfolio
          </Link>
          <h1 className="mt-10 font-editorial text-6xl leading-none md:text-8xl">
            {artwork.title}
          </h1>
          {artwork.year ? (
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-sage">
              {artwork.year}
            </p>
          ) : null}
          {artwork.description ? (
            <p className="mt-8 max-w-md text-lg leading-8 text-muted">
              {artwork.description}
            </p>
          ) : null}
          <nav className="mt-12 flex flex-wrap gap-3">
            {previous ? (
              <Link
                href={`/portfolio/${previous.slug}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.16em] transition hover:border-sage hover:text-sage"
              >
                <ArrowLeft size={14} strokeWidth={1.5} />
                Prima
              </Link>
            ) : null}
            {next ? (
              <Link
                href={`/portfolio/${next.slug}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.16em] transition hover:border-sage hover:text-sage"
              >
                Dopo
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            ) : null}
          </nav>
        </aside>

        <div className="rounded-[28px] bg-paper p-3 shadow-[0_24px_80px_rgba(17,17,17,0.08)] md:p-5">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={artwork.title}
              width={artwork.image_width || 1200}
              height={artwork.image_height || 1800}
              sizes="(min-width: 1024px) 64vw, 92vw"
              className="h-auto w-full rounded-[18px] object-contain"
              priority
            />
          ) : (
            <div className="min-h-[70vh] rounded-[18px] bg-mist" />
          )}
        </div>
      </article>
    </main>
  );
}
