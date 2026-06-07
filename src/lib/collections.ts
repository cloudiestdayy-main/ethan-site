import { slugify } from "@/lib/slug";
import type { Artwork } from "@/lib/supabase/types";

export const FALLBACK_COLLECTION = "Altre opere";

export type Collection = {
  /** Nome leggibile della serie (dal campo `category`, con fallback). */
  category: string;
  /** Slug stabile usato per gli anchor `/portfolio#<slug>`. */
  slug: string;
  artworks: Artwork[];
};

/**
 * Raggruppa le opere per `category` preservando l'ordine di arrivo
 * (che a monte è già sort_order + created_at). Le opere senza categoria
 * finiscono in un'unica serie di fallback.
 */
export function groupArtworksByCollection(artworks: Artwork[]): Collection[] {
  const groups = new Map<string, Artwork[]>();

  for (const artwork of artworks) {
    const key = artwork.category?.trim() || FALLBACK_COLLECTION;
    const existing = groups.get(key);
    if (existing) {
      existing.push(artwork);
    } else {
      groups.set(key, [artwork]);
    }
  }

  return Array.from(groups, ([category, items]) => ({
    category,
    slug: slugify(category),
    artworks: items,
  }));
}

type CollectionCopy = {
  tagline: string;
  description: string;
};

/**
 * Narrazione opzionale per-serie, indicizzata per slug.
 * Riempire man mano che il cliente fornisce le descrizioni delle collezioni.
 * Esempio: "personaggi": { tagline: "...", description: "..." }
 */
export const COLLECTION_COPY: Record<string, CollectionCopy> = {};

const DEFAULT_COPY: CollectionCopy = {
  tagline: "Una serie di tavole",
  description:
    "Una raccolta di tavole legate da soggetto, atmosfera e ritmo del segno.",
};

export function getCollectionCopy(slug: string): CollectionCopy {
  return COLLECTION_COPY[slug] ?? DEFAULT_COPY;
}
