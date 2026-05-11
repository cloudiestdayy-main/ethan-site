import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Artwork } from "@/lib/supabase/types";
import { getArtworkImageUrl as _getArtworkImageUrl } from "@/lib/artworks-shared";
export { getArtworkImageUrl } from "@/lib/artworks-shared";

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
