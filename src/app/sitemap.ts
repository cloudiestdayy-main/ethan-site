import type { MetadataRoute } from "next";
import { getPublicArtworks } from "@/lib/artworks";

// Always compute fresh from Supabase so newly published artworks appear right
// away, instead of being frozen at build time (when the DB read can be empty).
export const dynamic = "force-dynamic";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/portfolio`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const artworks = await getPublicArtworks();
  const artworkRoutes: MetadataRoute.Sitemap = artworks.map((artwork) => ({
    url: `${baseUrl}/portfolio/${artwork.slug}`,
    lastModified: artwork.created_at ? new Date(artwork.created_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...artworkRoutes];
}
