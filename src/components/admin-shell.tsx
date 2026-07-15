import type { PropsWithChildren } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Images,
  ImageUp,
  LayoutDashboard,
  PenLine,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { getCommissionRequests } from "@/lib/admin";

export type AdminSection = "overview" | "content" | "upload" | "artworks";

const NAV_ITEMS = [
  {
    id: "overview" as const,
    href: "/admin",
    label: "Panoramica",
    icon: LayoutDashboard,
  },
  {
    id: "content" as const,
    href: "/admin/content",
    label: "Contenuti sito",
    icon: PenLine,
  },
  {
    id: "upload" as const,
    href: "/admin/upload",
    label: "Carica opera",
    icon: ImageUp,
  },
  {
    id: "artworks" as const,
    href: "/admin/artworks",
    label: "Opere",
    icon: Images,
  },
];

function navItemClass(isActive: boolean) {
  return `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
    isActive
      ? "bg-pure-white/10 font-medium text-pure-white"
      : "text-pure-white/55 hover:bg-pure-white/5 hover:text-pure-white"
  }`;
}

/**
 * Layout "gestionale" dell'area admin: sidebar di navigazione fissa a
 * sinistra (nav orizzontale su mobile) e contenuto della sezione a destra.
 * Server component: legge il numero di richieste nuove per il badge.
 */
export async function AdminShell({
  active,
  title,
  subtitle,
  children,
}: PropsWithChildren<{
  active: AdminSection;
  title: string;
  subtitle?: string;
}>) {
  const commissions = await getCommissionRequests();
  const newCount = commissions.requests.filter(
    (request) => request.status === "new",
  ).length;

  // Le richieste di commissione vivono nella Panoramica: il badge sta lì.
  const badge = (id: AdminSection) =>
    id === "overview" && newCount ? (
      <span className="ml-auto rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-pure-black">
        {newCount}
      </span>
    ) : null;

  return (
    <div className="flex min-h-svh flex-col bg-ink lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-[260px] shrink-0 border-r border-pure-white/10 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col">
        <div className="border-b border-pure-white/10 px-6 py-7">
          <p className="text-xs uppercase tracking-[0.18em] text-pure-white/50">
            Ethan&apos;s Drawings
          </p>
          <p className="mt-2 font-display text-2xl font-bold uppercase text-pure-white">
            Admin
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={item.id === active ? "page" : undefined}
              className={navItemClass(item.id === active)}
            >
              <item.icon size={17} strokeWidth={1.7} />
              {item.label}
              {badge(item.id)}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 border-t border-pure-white/10 px-6 py-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-pure-white/50 transition hover:text-accent"
          >
            <ExternalLink size={14} strokeWidth={1.7} />
            Vedi il sito
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Nav orizzontale (mobile) */}
      <div className="border-b border-pure-white/10 lg:hidden">
        <div className="flex items-center justify-between px-5 pt-5">
          <p className="font-display text-xl font-bold uppercase text-pure-white">
            Admin
          </p>
          <SignOutButton />
        </div>
        <nav className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={item.id === active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition ${
                item.id === active
                  ? "border-pure-white/30 bg-pure-white/10 text-pure-white"
                  : "border-pure-white/10 text-pure-white/55 hover:text-pure-white"
              }`}
            >
              <item.icon size={14} strokeWidth={1.7} />
              {item.label}
              {badge(item.id)}
            </Link>
          ))}
        </nav>
      </div>

      {/* Contenuto della sezione */}
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10">
        <header className="border-b border-pure-white/10 pb-7">
          <h1 className="font-display text-3xl font-bold uppercase text-pure-white md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-sm text-pure-white/50">
              {subtitle}
            </p>
          ) : null}
        </header>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
