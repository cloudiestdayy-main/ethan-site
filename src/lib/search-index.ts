import { KIND_LABELS } from "@/lib/artwork-kinds";
import type { ArtworkKind } from "@/lib/supabase/types";

export type SearchIndexItem = {
  title: string;
  slug: string;
  category: string | null;
  kind: ArtworkKind;
  image_path: string;
  year: number | null;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Filtro client-side sull'indice precaricato: match case/accent-insensitive
 * su titolo, categoria e label del tipo (Tavola/Illustrazione).
 */
export function filterSearchIndex(items: SearchIndexItem[], query: string) {
  const needle = normalizeText(query.trim());

  if (needle.length < 2) {
    return [];
  }

  return items.filter((item) => {
    const haystack = normalizeText(
      [item.title, item.category || "", KIND_LABELS[item.kind].singular].join(
        " ",
      ),
    );
    return haystack.includes(needle);
  });
}
