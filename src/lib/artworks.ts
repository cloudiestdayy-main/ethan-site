import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Artwork } from "@/lib/supabase/types";
import { getPublicSupabaseConfig } from "@/lib/env";

export function getArtworkImageUrl(path: string | null | undefined) {
  const config = getPublicSupabaseConfig();

  if (!config || !path) {
    return null;
  }

  const safePath = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${config.url}/storage/v1/object/public/artworks/${safePath}`;
}

export async function getPublicArtworks(options?: { featured?: boolean }) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as Artwork[];
  }

  let query = supabase
    .from("artworks")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (options?.featured) {
    query = query.eq("featured", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load artworks", error.message);
    return [];
  }

  return (data || []) as Artwork[];
}

export async function getArtworkBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to load artwork", error.message);
    return null;
  }

  return data as Artwork | null;
}
