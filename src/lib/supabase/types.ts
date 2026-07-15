export type ArtworkKind = "tavola" | "illustrazione";

export type Artwork = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  kind: ArtworkKind;
  year: number | null;
  image_path: string;
  image_width: number | null;
  image_height: number | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  view_count: number;
  created_at: string;
};

/** Tavola aggiuntiva di un'opera (l'immagine dell'opera resta la pagina 1). */
export type ArtworkImage = {
  id: string;
  artwork_id: string;
  image_path: string;
  image_width: number | null;
  image_height: number | null;
  sort_order: number;
  created_at: string;
};

/** Opera con le sue tavole aggiuntive (usata dalla gestione admin). */
export type ArtworkWithImages = Artwork & { images: ArtworkImage[] };

export type CommissionRequest = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
};

export type SiteSettingRow = {
  key: string;
  value: string;
  updated_at: string;
};
