import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminUploadForm } from "@/components/admin-upload-form";
import { SignOutButton } from "@/components/sign-out-button";
import { getAdminSession, getAllArtworksForAdmin } from "@/lib/admin";
import { getArtworkImageUrl } from "@/lib/artworks";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (session.configured && !session.user) {
    redirect("/admin/login");
  }

  const artworks = session.allowed ? await getAllArtworksForAdmin() : [];

  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-8">
          <div>
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.18em] text-muted hover:text-sage"
            >
              Studio Tavole
            </Link>
            <h1 className="mt-5 font-editorial text-6xl leading-none md:text-8xl">
              Admin.
            </h1>
          </div>
          {session.user ? <SignOutButton /> : null}
        </header>

        {!session.configured ? (
          <section className="mt-12 rounded-[30px] bg-paper p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.2em] text-sage">
              Configurazione richiesta
            </p>
            <h2 className="mt-5 font-editorial text-5xl leading-none">
              Aggiungi le variabili Supabase per attivare lo studio.
            </h2>
            <p className="mt-6 max-w-2xl text-muted">
              Dopo aver creato il progetto Supabase, imposta
              NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
              SUPABASE_SERVICE_ROLE_KEY e ADMIN_EMAILS.
            </p>
          </section>
        ) : !session.allowed ? (
          <section className="mt-12 rounded-[30px] bg-paper p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.2em] text-sage">
              Accesso negato
            </p>
            <h2 className="mt-5 font-editorial text-5xl leading-none">
              Questa email non e nella allowlist admin.
            </h2>
          </section>
        ) : (
          <div className="mt-12 grid gap-12">
            <section className="rounded-[30px] bg-paper p-6 md:p-10">
              <div className="mb-10">
                <p className="text-xs uppercase tracking-[0.2em] text-sage">
                  Nuova opera
                </p>
                <h2 className="mt-4 font-editorial text-5xl leading-none">
                  Carica una tavola.
                </h2>
              </div>
              <AdminUploadForm />
            </section>

            <section className="rounded-[30px] bg-paper p-6 md:p-10">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sage">
                    Archivio
                  </p>
                  <h2 className="mt-4 font-editorial text-5xl leading-none">
                    Opere caricate.
                  </h2>
                </div>
                <p className="text-sm text-muted">{artworks.length} totali</p>
              </div>

              {artworks.length ? (
                <div className="grid gap-4">
                  {artworks.map((artwork) => {
                    const imageUrl = getArtworkImageUrl(artwork.image_path);

                    return (
                      <article
                        key={artwork.id}
                        className="grid gap-5 border-t border-line py-5 md:grid-cols-[120px_1fr_auto] md:items-center"
                      >
                        <div className="relative aspect-[0.78] overflow-hidden rounded-[18px] bg-mist">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={artwork.title}
                              fill
                              sizes="120px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <h3 className="font-editorial text-3xl leading-none">
                            {artwork.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted">
                            {artwork.year || "Senza anno"} /{" "}
                            {artwork.published ? "pubblicata" : "bozza"} /{" "}
                            {artwork.featured ? "in evidenza" : "archivio"}
                          </p>
                        </div>
                        {artwork.published ? (
                          <Link
                            href={`/portfolio/${artwork.slug}`}
                            className="text-xs uppercase tracking-[0.16em] text-muted hover:text-sage"
                          >
                            Apri
                          </Link>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="border-t border-line pt-6 text-muted">
                  Nessuna opera caricata.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
