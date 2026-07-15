import { HomeExperience } from "@/components/home-experience";
import { splitByKind } from "@/lib/artwork-kinds";
import { getPublicArtworks } from "@/lib/artworks";
import { getSiteSettings } from "@/lib/settings";
import { resolveSiteImage } from "@/lib/settings-shared";
import type { Artwork } from "@/lib/supabase/types";

export const revalidate = 60;

const MOST_VIEWED_LIMIT = 8;

/**
 * Ordina per visualizzazioni; finche' nessuna opera ha visite (sito appena
 * migrato) ripiega sulla logica precedente: in evidenza, poi le piu' recenti.
 */
function pickMostViewed(artworks: Artwork[]) {
  const hasViews = artworks.some((artwork) => artwork.view_count > 0);

  if (!hasViews) {
    const featured = artworks.filter((artwork) => artwork.featured);
    return {
      artworks: (featured.length ? featured : artworks).slice(
        0,
        MOST_VIEWED_LIMIT,
      ),
      isFallback: true,
    };
  }

  const sorted = [...artworks].sort(
    (a, b) =>
      b.view_count - a.view_count ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return { artworks: sorted.slice(0, MOST_VIEWED_LIMIT), isFallback: false };
}

export default async function HomePage() {
  const [allArtworks, settings] = await Promise.all([
    getPublicArtworks(),
    getSiteSettings(),
  ]);
  const mostViewed = pickMostViewed(allArtworks);
  const { tavole, illustrazioni } = splitByKind(allArtworks);

  return (
    <HomeExperience
      hero={{ title: settings.hero_title, subtitle: settings.hero_subtitle }}
      content={{
        mostViewedTitle: settings.home_most_viewed_title,
        worksTitle: settings.home_works_title,
        worksText: settings.home_works_text,
        aboutQuote: settings.home_about_quote,
        aboutText: settings.home_about_text,
        contactTitle: settings.home_contact_title,
        contactText: settings.home_contact_text,
        heroImage: resolveSiteImage(settings, "hero_image_path"),
        portraitImage: resolveSiteImage(settings, "portrait_image_path"),
        contactImage: resolveSiteImage(settings, "contact_image_path"),
      }}
      mostViewed={mostViewed.artworks}
      mostViewedIsFallback={mostViewed.isFallback}
      kindPanels={{
        tavola: {
          count: tavole.length,
          cover: tavole[0]?.image_path ?? null,
        },
        illustrazione: {
          count: illustrazioni.length,
          cover: illustrazioni[0]?.image_path ?? null,
        },
      }}
    />
  );
}
