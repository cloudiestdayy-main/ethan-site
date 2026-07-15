import { redirect } from "next/navigation";
import { AdminArtworkManager } from "@/components/admin-artwork-manager";
import { AdminShell } from "@/components/admin-shell";
import { getAdminSession, getAllArtworksForAdmin } from "@/lib/admin";

export const metadata = {
  title: "Opere caricate",
  robots: { index: false, follow: false },
};

export default async function AdminArtworksPage() {
  const session = await getAdminSession();
  if (session.configured && !session.user) redirect("/admin/login");
  if (!session.allowed) redirect("/admin");

  const artworks = await getAllArtworksForAdmin();

  return (
    <AdminShell
      active="artworks"
      title="Opere caricate"
      subtitle="Modifica, riordina, pubblica o elimina le opere dell'archivio."
    >
      <section className="rounded-[20px] bg-paper p-6 md:p-10">
        <AdminArtworkManager
          key={artworks
            .map(
              (artwork) =>
                `${artwork.id}:${artwork.sort_order}:${artwork.image_width || 0}:${artwork.image_height || 0}`,
            )
            .join("|")}
          artworks={artworks}
        />
      </section>
    </AdminShell>
  );
}
