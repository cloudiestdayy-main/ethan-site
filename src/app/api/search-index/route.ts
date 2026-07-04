import { NextResponse } from "next/server";
import { getPublicArtworksStatic } from "@/lib/artworks";
import type { SearchIndexItem } from "@/lib/search-index";

// Cache ISR della route: le mutazioni admin fanno comunque
// revalidatePath("/api/search-index") per aggiornarla subito.
export const revalidate = 60;

export async function GET() {
  const artworks = await getPublicArtworksStatic();

  const items: SearchIndexItem[] = artworks.map((artwork) => ({
    title: artwork.title,
    slug: artwork.slug,
    category: artwork.category,
    kind: artwork.kind,
    image_path: artwork.image_path,
    year: artwork.year,
  }));

  return NextResponse.json({ artworks: items });
}
