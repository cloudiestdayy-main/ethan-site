export const SITE_SETTING_KEYS = [
  "announcement_text",
  "hero_title",
  "hero_subtitle",
  "contact_email",
  "instagram_url",
  "twitter_url",
  "artstation_url",
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export type SiteSettings = Record<SiteSettingKey, string>;

/**
 * Valore vuoto = elemento nascosto nel sito (barra annuncio, testi hero,
 * icone social, blocco email). L'email parte dal valore reale gia' in uso;
 * i social partono vuoti: i vecchi URL placeholder (instagram.com generico)
 * non devono piu' comparire finche' il cliente non inserisce quelli veri.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcement_text: "",
  hero_title: "",
  hero_subtitle: "",
  contact_email: "cloudiestdayy@gmail.com",
  instagram_url: "",
  twitter_url: "",
  artstation_url: "",
};

export function isSiteSettingKey(value: string): value is SiteSettingKey {
  return (SITE_SETTING_KEYS as readonly string[]).includes(value);
}
