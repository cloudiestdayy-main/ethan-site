import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Images,
  ImageUp,
  PenLine,
} from "lucide-react";
import { AdminCommissionManager } from "@/components/admin-commission-manager";
import { AdminShell } from "@/components/admin-shell";
import {
  getAdminSession,
  getAllArtworksForAdmin,
  getCommissionRequests,
} from "@/lib/admin";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const SECTION_CARDS = [
  {
    href: "/admin/content",
    icon: PenLine,
    title: "Contenuti sito",
    text: "Testi e immagini di home, Chi sono e Contatti, con anteprima live.",
  },
  {
    href: "/admin/upload",
    icon: ImageUp,
    title: "Carica opera",
    text: "Nuova opera per l'archivio, anche con piu' tavole insieme.",
  },
  {
    href: "/admin/artworks",
    icon: Images,
    title: "Opere",
    text: "Modifica, riordina, pubblica o elimina le opere caricate.",
  },
];

export default async function AdminPage() {
  const session = await getAdminSession();
  if (session.configured && !session.user) redirect("/admin/login");

  if (!session.configured) {
    return (
      <main className="min-h-screen bg-ink px-5 py-16 md:px-10">
        <section className="mx-auto max-w-3xl rounded-[20px] bg-paper p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-ink">Configurazione richiesta</p>
          <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold text-ink uppercase">Aggiungi le variabili Supabase</h2>
          <p className="mt-6 max-w-2xl text-ink/50">Dopo aver creato il progetto Supabase, imposta NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY e ADMIN_EMAILS.</p>
        </section>
      </main>
    );
  }

  if (!session.allowed) {
    return (
      <main className="min-h-screen bg-ink px-5 py-16 md:px-10">
        <section className="mx-auto max-w-3xl rounded-[20px] bg-paper p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-ink">Accesso negato</p>
          <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold text-ink uppercase">Questa email non e&apos; nella allowlist admin.</h2>
        </section>
      </main>
    );
  }

  const [artworks, commissions] = await Promise.all([
    getAllArtworksForAdmin(),
    getCommissionRequests(),
  ]);
  const published = artworks.filter((artwork) => artwork.published).length;
  const drafts = artworks.length - published;
  const totalPages = artworks.reduce(
    (sum, artwork) => sum + 1 + artwork.images.length,
    0,
  );
  const newCommissions = commissions.requests.filter(
    (request) => request.status === "new",
  ).length;

  const stats = [
    { label: "Opere pubblicate", value: published },
    { label: "Bozze", value: drafts },
    { label: "Tavole totali", value: totalPages },
    { label: "Richieste nuove", value: newCommissions },
  ];

  return (
    <AdminShell
      active="overview"
      title="Panoramica"
      subtitle="Lo stato del sito a colpo d'occhio. Usa il menu per entrare nelle sezioni."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[20px] bg-paper p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/50">
              {stat.label}
            </p>
            <p className="mt-3 font-display text-5xl font-bold text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {SECTION_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[20px] bg-paper p-6 transition hover:-translate-y-0.5 md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-pure-white transition group-hover:bg-accent-ink">
                <card.icon size={19} strokeWidth={1.7} />
              </span>
              <ArrowUpRight
                size={18}
                strokeWidth={1.7}
                className="text-ink/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-ink"
              />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold uppercase text-ink">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-ink/60">{card.text}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-[20px] bg-paper p-6 md:p-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-ink">
              Posta in arrivo
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase text-ink md:text-4xl">
              Richieste di commissione
            </h2>
          </div>
          {newCommissions ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 text-xs uppercase tracking-[0.16em] text-accent-ink">
              {newCommissions} {newCommissions === 1 ? "nuova" : "nuove"}
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
    </AdminShell>
  );
}
