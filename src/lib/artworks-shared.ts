import { getPublicSupabaseConfig } from "@/lib/env";

export function getArtworkImageUrl(path: string | null | undefined) {
  const config = getPublicSupabaseConfig();
  if (!config || !path) return null;
  const safePath = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${config.url}/storage/v1/object/public/artworks/${safePath}`;
}
