import { HomeExperience } from "@/components/home-experience";
import { getPublicArtworks } from "@/lib/artworks";

export const revalidate = 60;

export default async function HomePage() {
  const featuredArtworks = await getPublicArtworks({ featured: true });
  const fallbackArtworks = featuredArtworks.length ? [] : await getPublicArtworks();
  const artworks = (featuredArtworks.length ? featuredArtworks : fallbackArtworks).slice(0, 3);

  return (
    <HomeExperience
      featuredArtworks={artworks}
      featuredLabel={featuredArtworks.length ? "Opere in evidenza" : "Ultime opere"}
    />
  );
}
