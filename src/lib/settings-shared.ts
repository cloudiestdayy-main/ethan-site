import { getArtworkImageUrl } from "@/lib/artworks-shared";

export const SITE_SETTING_KEYS = [
  "announcement_text",
  "hero_title",
  "hero_subtitle",
  "contact_email",
  "instagram_url",
  "twitter_url",
  "artstation_url",
  // Home
  "home_most_viewed_title",
  "home_works_title",
  "home_works_text",
  "home_about_quote",
  "home_about_text",
  "home_contact_title",
  "home_contact_text",
  // Chi sono
  "about_story_heading",
  "about_story_text",
  "about_why_heading",
  "about_why_text",
  "about_process_1_title",
  "about_process_1_text",
  "about_process_2_title",
  "about_process_2_text",
  "about_process_3_title",
  "about_process_3_text",
  "about_tools",
  // Contatti
  "contact_title",
  "contact_intro_text",
  // Immagini (path nello storage `artworks` sotto `site/`; vuoto = file /public)
  "hero_image_path",
  "portrait_image_path",
  "process_1_image_path",
  "process_2_image_path",
  "process_3_image_path",
  "contact_image_path",
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export type SiteSettings = Record<SiteSettingKey, string>;

/**
 * Valore vuoto = elemento nascosto nel sito (barra annuncio, testi hero,
 * icone social, blocco email). L'email parte dal valore reale gia' in uso;
 * i social partono vuoti: i vecchi URL placeholder (instagram.com generico)
 * non devono piu' comparire finche' il cliente non inserisce quelli veri.
 *
 * Per le chiavi di contenuto (vedi FALLBACK_KEYS) vale la semantica opposta:
 * il default e' il testo storico del sito e un valore vuoto nel DB significa
 * "usa il default" — cosi' il cliente non puo' rompere il layout svuotando
 * un campo.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcement_text: "",
  hero_title: "",
  hero_subtitle: "",
  contact_email: "cloudiestdayy@gmail.com",
  instagram_url: "",
  twitter_url: "",
  artstation_url: "",
  home_most_viewed_title: "I più visti",
  home_works_title: "I miei lavori",
  home_works_text:
    "Tavole e illustrazioni vivono in due archivi separati: scegli da dove iniziare, oppure sfoglia tutto.",
  home_about_quote:
    "Compongo storie una tavola alla volta: ritmo della pagina, pause e cura del segno.",
  home_about_text:
    "Ethan lavora su tavole manga, character design e illustrazioni con un taglio narrativo. Ogni progetto parte dalla composizione e dal ritmo, fino alla rifinitura del tratto.",
  home_contact_title: "Hai un'idea\nda raccontare?",
  home_contact_text:
    "Scrivimi per una commissione, una collaborazione o anche solo per parlare di tavole e illustrazioni: rispondo appena possibile.",
  about_story_heading: "Segno, pausa, pagina",
  about_story_text: [
    "Mi chiamo Ethan e sono un artista italiano con una passione viscerale per la cultura giapponese. Fin da bambino, i manga hanno rappresentato per me non solo una forma di intrattenimento, ma un vero e proprio linguaggio visivo attraverso cui esprimere emozioni e narrare storie.",
    "Il mio viaggio artistico e' iniziato con i primi scarabocchi ispirati a Dragon Ball ed e' proseguito attraverso anni di studio approfondito delle tecniche tradizionali giapponesi. Ho avuto la fortuna di viaggiare in Giappone, dove ho potuto immergermi nella cultura dell'inking e del sumi-e, affinando il mio stile personale.",
    "Oggi il mio lavoro fonde la precisione del tratto manga con la ricchezza espressiva della tradizione artistica giapponese.",
  ].join("\n\n"),
  about_why_heading: "Le storie chiedono spazio",
  about_why_text: [
    "Disegno da quando ho memoria: prima ancora di essere un mestiere, e' il modo piu' naturale che ho per capire quello che vedo e quello che provo. Una tavola mi permette di fermare un momento, dargli un ritmo e restituirlo a chi guarda.",
    "Il bianco e nero, il segno a china e la pagina che respira sono la mia lingua. Ogni storia che disegno e' un modo per condividere la meraviglia che da bambino trovavo nei manga.",
  ].join("\n\n"),
  about_process_1_title: "Schizzo",
  about_process_1_text:
    "La composizione nasce a matita: layout, pose e ritmo della tavola.",
  about_process_2_title: "China",
  about_process_2_text:
    "Il segno viene ripassato a china, definendo contrasti e profondità.",
  about_process_3_title: "Finale",
  about_process_3_text:
    "Rifiniture, retini o colore: la tavola è pronta per stampa o digitale.",
  about_tools: [
    "Matite e portamine",
    "China e pennini",
    "Pennelli",
    "Retini",
    "Tavoletta grafica",
  ].join("\n"),
  contact_title: "Mettiti in contatto",
  contact_intro_text:
    "Che sia una commissione, una collaborazione o una semplice domanda sulle tavole: raccontami la tua idea. La risposta include disponibilita', tempi e una prima direzione visiva.",
  hero_image_path: "",
  portrait_image_path: "",
  process_1_image_path: "",
  process_2_image_path: "",
  process_3_image_path: "",
  contact_image_path: "",
};

/** Chiavi immagine: il valore e' un path nello storage, vuoto = fallback /public. */
export const IMAGE_SETTING_KEYS = [
  "hero_image_path",
  "portrait_image_path",
  "process_1_image_path",
  "process_2_image_path",
  "process_3_image_path",
  "contact_image_path",
] as const satisfies readonly SiteSettingKey[];

export type SiteImageKey = (typeof IMAGE_SETTING_KEYS)[number];

export const SITE_IMAGE_FALLBACKS: Record<SiteImageKey, string> = {
  // Versione di Pagina-29 senza i margini bianchi della pagina: la hero
  // full-bleed (stile victoriarosepark.com) non deve mostrare bordi.
  hero_image_path: "/images/site/hero-default.png",
  portrait_image_path: "/images/artist/ethan-portrait.png",
  process_1_image_path: "/images/process/01-schizzo.png",
  process_2_image_path: "/images/process/02-china.png",
  process_3_image_path: "/images/process/03-finale.png",
  contact_image_path: "/images/portfolio/Pagina-29.png",
};

/**
 * Chiavi con semantica "vuoto = usa il default" (contenuti e immagini):
 * tutte tranne le 7 storiche, dove vuoto = elemento nascosto.
 */
export const FALLBACK_KEYS: ReadonlySet<SiteSettingKey> = new Set(
  SITE_SETTING_KEYS.filter(
    (key) =>
      ![
        "announcement_text",
        "hero_title",
        "hero_subtitle",
        "contact_email",
        "instagram_url",
        "twitter_url",
        "artstation_url",
      ].includes(key),
  ),
);

export function isSiteSettingKey(value: string): value is SiteSettingKey {
  return (SITE_SETTING_KEYS as readonly string[]).includes(value);
}

export function isSiteImageKey(value: string): value is SiteImageKey {
  return (IMAGE_SETTING_KEYS as readonly string[]).includes(value);
}

/**
 * URL da usare per un'immagine del sito: file caricato dal cliente nello
 * storage (`site/...`) oppure il file /public originale come fallback.
 */
export function resolveSiteImage(
  settings: SiteSettings,
  key: SiteImageKey,
): string {
  const path = settings[key].trim();
  return (path && getArtworkImageUrl(path)) || SITE_IMAGE_FALLBACKS[key];
}

/** Divide un testo in paragrafi sulle righe vuote (usato anche dal preview bridge). */
export function splitParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Divide un testo in voci, una per riga (usato anche dal preview bridge). */
export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
