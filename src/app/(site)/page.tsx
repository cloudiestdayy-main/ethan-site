import { HomeExperience } from "@/components/home-experience";
import { getPublicArtworks } from "@/lib/artworks";
import { groupArtworksByCollection } from "@/lib/collections";

export const revalidate = 60;

export default async function HomePage() {
  const allArtworks = await getPublicArtworks();
  const featured = allArtworks.filter((artwork) => artwork.featured);
  const artworks = (featured.length ? featured : allArtworks).slice(0, 3);
  const collections = groupArtworksByCollection(allArtworks);

  return (
    <HomeExperience
      featuredArtworks={artworks}
      featuredLabel={featured.length ? "Opere in evidenza" : "Ultime opere"}
      collections={collections}
    />
  );
}
