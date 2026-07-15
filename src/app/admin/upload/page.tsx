import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminUploadForm } from "@/components/admin-upload-form";
import { getAdminSession, getAllArtworksForAdmin } from "@/lib/admin";
import { collectCategories } from "@/lib/categories";

export const metadata = {
  title: "Carica opera",
  robots: { index: false, follow: false },
};

export default async function AdminUploadPage() {
  const session = await getAdminSession();
  if (session.configured && !session.user) redirect("/admin/login");
  if (!session.allowed) redirect("/admin");

  const artworks = await getAllArtworksForAdmin();

  return (
    <AdminShell
      active="upload"
      title="Carica opera"
      subtitle="Una nuova opera per l'archivio: piu' file insieme = piu' tavole, la prima e' la copertina."
    >
      <section className="rounded-[20px] bg-paper p-6 md:p-10">
        <AdminUploadForm
          categories={collectCategories(
            artworks.map((artwork) => artwork.category),
          )}
        />
      </section>
    </AdminShell>
  );
}
