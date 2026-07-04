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
