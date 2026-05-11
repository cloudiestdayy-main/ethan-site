"use client";

import { useState, useRef, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Eye } from "lucide-react";
import type { Artwork } from "@/lib/supabase/types";
import { getArtworkImageUrl } from "@/lib/artworks-shared";

export function ArtworkCard({
  artwork,
  priority = false,
  variant = "standard",
  position = "center",
}: {
  artwork: Artwork;
  priority?: boolean;
  variant?: "standard" | "tall" | "wide";
  position?: "left" | "right" | "center";
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const imageUrl = getArtworkImageUrl(artwork.image_path);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  return (
    <div ref={cardRef} data-pos={position} className="group grid-item">
      <Link href={`/portfolio/${artwork.slug}`} className="block">
        <article className="space-y-4">
          <div
            className="relative overflow-hidden rounded-2xl bg-deep-blue/50"
            style={{
              transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: "transform 0.3s ease-out",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={artwork.title}
                  fill
                  priority={priority}
                  sizes="(min-width: 1024px) 38vw, 92vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
              ) : (
                <div className="h-full w-full bg-deep-blue/30" />
              )}
              <div className="absolute inset-0 bg-pure-black/0 transition-all duration-500 group-hover:bg-pure-black/40 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center w-16 h-16 rounded-full border-2 border-accent text-accent">
                  <Eye size={24} />
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-accent uppercase tracking-wider">
                {artwork.category || "Manga"}
              </p>
              <h3 className="mt-1 font-display text-xl md:text-2xl font-bold text-pure-white leading-tight">
                {artwork.title}
              </h3>
              {artwork.year ? (
                <p className="mt-1 text-sm text-pure-white/50">{artwork.year}</p>
              ) : null}
            </div>
            <span className="mt-1 rounded-full border border-pure-white/20 p-2 text-pure-white transition-all group-hover:border-accent group-hover:text-accent group-hover:scale-110">
              <ArrowUpRight size={16} strokeWidth={2} />
            </span>
          </div>
        </article>
      </Link>
    </div>
  );
}
