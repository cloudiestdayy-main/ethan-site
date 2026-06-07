"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Artwork } from "@/lib/supabase/types";
import { getArtworkImageUrl } from "@/lib/artworks-shared";

export function ArtworkCard({
  artwork,
  priority = false,
}: {
  artwork: Artwork;
  priority?: boolean;
}) {
  const imageUrl = getArtworkImageUrl(artwork.image_path);

  return (
    <div className="group grid-item">
      <Link href={`/portfolio/${artwork.slug}`} className="block">
        <article className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl border border-ink/8 bg-elevated">
            <div className="relative aspect-[3/4] overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={artwork.title}
                  fill
                  priority={priority}
                  sizes="(min-width: 1024px) 38vw, 92vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="h-full w-full bg-paper" />
              )}
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-accent">
                {artwork.category || "Manga"}
              </p>
              <h3 className="mt-1 font-serif text-xl font-medium leading-tight text-ink md:text-2xl">
                {artwork.title}
              </h3>
              {artwork.year ? (
                <p className="mt-1 text-sm text-ink/35">{artwork.year}</p>
              ) : null}
            </div>
            <span className="mt-1 rounded-full border border-ink/8 p-2 text-ink/35 transition-all duration-300 group-hover:border-accent group-hover:text-accent">
              <ArrowUpRight size={16} strokeWidth={2} />
            </span>
          </div>
        </article>
      </Link>
    </div>
  );
}
