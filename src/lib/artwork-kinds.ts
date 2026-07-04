import type { Artwork, ArtworkKind } from "@/lib/supabase/types";

export const ARTWORK_KINDS = ["tavola", "illustrazione"] as const;

export const KIND_LABELS: Record<
  ArtworkKind,
  { singular: string; plural: string; tabSlug: string }
> = {
  tavola: { singular: "Tavola", plural: "Tavole", tabSlug: "tavole" },
  illustrazione: {
    singular: "Illustrazione",
    plural: "Illustrazioni",
    tabSlug: "illustrazioni",
  },
};

/** Righe pre-migrazione o valori inattesi ricadono su "tavola". */
export function normalizeKind(value: unknown): ArtworkKind {
  return value === "illustrazione" ? "illustrazione" : "tavola";
}

/**
 * Le righe lette da Supabase possono precedere la migrazione (kind/view_count
 * assenti): normalizza i due campi cosi' il tipo `Artwork` resta affidabile.
 */
export function normalizeArtwork(row: Artwork): Artwork {
  return {
    ...row,
    kind: normalizeKind(row.kind),
    view_count: typeof row.view_count === "number" ? row.view_count : 0,
  };
}

export function normalizeArtworks(rows: Artwork[]): Artwork[] {
  return rows.map(normalizeArtwork);
}

export function splitByKind(artworks: Artwork[]) {
  return {
    tavole: artworks.filter((artwork) => artwork.kind === "tavola"),
    illustrazioni: artworks.filter(
      (artwork) => artwork.kind === "illustrazione",
    ),
  };
}

export function tabSlugToKind(slug: string | undefined): ArtworkKind | null {
  if (slug === "tavole") return "tavola";
  if (slug === "illustrazioni") return "illustrazione";
  return null;
}
