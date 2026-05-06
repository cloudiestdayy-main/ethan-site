import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Artwork } from "@/lib/supabase/types";
import { getArtworkImageUrl } from "@/lib/artworks";

export function ArtworkCard({
  artwork,
  priority = false,
  variant = "standard",
}: {
  artwork: Artwork;
  priority?: boolean;
  variant?: "standard" | "tall" | "wide";
}) {
  const imageUrl = getArtworkImageUrl(artwork.image_path);
  const ratio =
    variant === "wide" ? "aspect-[1.35]" : variant === "tall" ? "aspect-[0.72]" : "aspect-[0.88]";

  return (
    <Link href={`/portfolio/${artwork.slug}`} className="group block">
      <article className="space-y-4">
        <div
          className={`${ratio} relative overflow-hidden rounded-[24px] bg-paper shadow-[0_24px_80px_rgba(17,17,17,0.08)]`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={artwork.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 38vw, 92vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,var(--paper),var(--mist))]" />
          )}
          <div className="absolute inset-0 bg-foreground/0 transition duration-500 group-hover:bg-foreground/[0.04]" />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-editorial text-3xl leading-none">
              {artwork.title}
            </h3>
            {artwork.year ? (
              <p className="mt-2 text-sm text-muted">{artwork.year}</p>
            ) : null}
          </div>
          <span className="mt-1 rounded-full border border-line p-2 text-foreground transition group-hover:border-sage group-hover:text-sage">
            <ArrowUpRight size={16} strokeWidth={1.5} />
          </span>
        </div>
      </article>
    </Link>
  );
}
