import type { Metadata } from "next";
import { EmptyGallery } from "@/components/empty-gallery";
import {
  PortfolioKindTabs,
  type KindTab,
} from "@/components/portfolio-kind-tabs";
import { Reveal } from "@/components/reveal";
import { splitByKind, tabSlugToKind } from "@/lib/artwork-kinds";
import { getPublicArtworks } from "@/lib/artworks";
import { groupArtworksByCollection } from "@/lib/collections";

export const metadata: Metadata = {
  title: "I miei lavori",
  description:
    "Tavole e illustrazioni di Ethan, divise per tipo e raccolte in collezioni.",
};

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<{ tab?: string; view?: string }>;
};

export default async function PortfolioPage({ searchParams }: PageProps) {
  const [{ tab, view }, artworks] = await Promise.all([
    searchParams,
    getPublicArtworks(),
  ]);
  const { tavole, illustrazioni } = splitByKind(artworks);
  const initialKind = tabSlugToKind(tab) ?? "tavola";
  const initialView = view === "griglia" ? "griglia" : "collezioni";
  const tabs: KindTab[] = [
    { kind: "tavola", collections: groupArtworksByCollection(tavole) },
    {
      kind: "illustrazione",
      collections: groupArtworksByCollection(illustrazioni),
    },
  ];

  return (
    <main>
      <section className="border-b border-ink/5 bg-pure-white pb-24 pt-28 md:py-40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Reveal>
            <div className="line-accent mb-6" />
            <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-accent-ink">
              Archivio
            </p>
            <h1 className="mb-8 font-serif text-[clamp(2.5rem,6vw,6rem)] font-medium leading-[0.9] text-ink">
              I miei lavori
            </h1>
            <p className="max-w-xl text-base leading-[1.8] text-ink/70">
              Tavole e illustrazioni vivono in due archivi separati: passa da un
              tipo all&apos;altro con i tab (o con uno swipe) e sfoglia le
              collezioni come caroselli o come griglia.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 md:px-10">
          {artworks.length ? (
            <PortfolioKindTabs
              initialKind={initialKind}
              initialView={initialView}
              tabs={tabs}
            />
          ) : (
            <EmptyGallery />
          )}
        </div>
      </section>
    </main>
  );
}
