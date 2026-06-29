import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminArtworkManager } from "@/components/admin-artwork-manager";
import { AdminCommissionManager } from "@/components/admin-commission-manager";
import { AdminUploadForm } from "@/components/admin-upload-form";
import { SignOutButton } from "@/components/sign-out-button";
import {
  getAdminSession,
  getAllArtworksForAdmin,
  getCommissionRequests,
} from "@/lib/admin";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (session.configured && !session.user) redirect("/admin/login");
  const artworks = session.allowed ? await getAllArtworksForAdmin() : [];
  const commissions = session.allowed
    ? await getCommissionRequests()
    : { ok: true, requests: [] };
  const newCommissionCount = commissions.requests.filter(
    (request) => request.status === "new",
  ).length;

  return (
    <main className="min-h-screen bg-pure-white px-5 py-8 md:px-10">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/8 pb-8">
          <div>
            <Link href="/" className="text-xs uppercase tracking-[0.18em] text-ink/40 hover:text-accent transition-colors">Ethan&apos;s Drawings</Link>
            <h1 className="mt-5 font-display text-4xl md:text-7xl font-bold text-ink uppercase">Admin</h1>
          </div>
          {session.user ? <SignOutButton /> : null}
        </header>

        {!session.configured ? (
          <section className="mt-12 rounded-[20px] bg-paper p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Configurazione richiesta</p>
            <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold text-ink uppercase">Aggiungi le variabili Supabase</h2>
            <p className="mt-6 max-w-2xl text-ink/50">Dopo aver creato il progetto Supabase, imposta NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY e ADMIN_EMAILS.</p>
          </section>
        ) : !session.allowed ? (
          <section className="mt-12 rounded-[20px] bg-paper p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Accesso negato</p>
            <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold text-ink uppercase">Questa email non e&apos; nella allowlist admin.</h2>
          </section>
        ) : (
          <div className="mt-12 grid gap-12">
            <section className="rounded-[20px] bg-paper p-6 md:p-10">
              <div className="mb-10">
                <p className="text-xs uppercase tracking-[0.2em] text-accent">Nuova opera</p>
                <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold text-ink uppercase">Carica una tavola</h2>
              </div>
              <AdminUploadForm />
            </section>
            <section className="rounded-[20px] bg-paper p-6 md:p-10">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent">Archivio</p>
                  <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold text-ink uppercase">Opere caricate</h2>
                </div>
              </div>
              <AdminArtworkManager
                key={artworks
                  .map((artwork) => `${artwork.id}:${artwork.sort_order}:${artwork.image_width || 0}:${artwork.image_height || 0}`)
                  .join("|")}
                artworks={artworks}
              />
            </section>
            <section className="rounded-[20px] bg-paper p-6 md:p-10">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent">Posta in arrivo</p>
                  <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold text-ink uppercase">Richieste di commissione</h2>
                </div>
                {newCommissionCount ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-xs uppercase tracking-[0.16em] text-accent">
                    {newCommissionCount} {newCommissionCount === 1 ? "nuova" : "nuove"}
                  </span>
                ) : null}
              </div>
              <AdminCommissionManager
                key={commissions.requests
                  .map((request) => `${request.id}:${request.status}`)
                  .join("|")}
                requests={commissions.requests}
                loadOk={commissions.ok}
              />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
