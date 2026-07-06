"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, Search, X } from "lucide-react";
import { SearchOverlay } from "@/components/search-overlay";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "I miei lavori" },
  { href: "/about", label: "Chi sono" },
  { href: "/contact", label: "Contatti" },
];

// Il link all'area admin vive nel footer: il menu resta solo per i visitatori.
const actionItems = [{ href: "/contact", label: "Scrivi", Icon: Mail }];

export function SiteHeader({ announcement = "" }: { announcement?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const announcementText = announcement.trim();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  function toggleMenu() {
    setSearchOpen(false);
    setMenuOpen((open) => !open);
  }

  function openSearch() {
    setMenuOpen(false);
    setSearchOpen(true);
  }

  return (
    <>
      <header
        className={`site-header-enter fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          scrolled || menuOpen
            ? "border-b border-ink/5 bg-pure-white/85 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        {announcementText ? (
          // Si legge intera (fino a 2 righe) e si ritira scrollando, per non
          // occupare viewport lungo tutta la pagina.
          <p
            className={`overflow-hidden bg-ink px-5 text-center text-[12px] font-medium tracking-[0.04em] text-pure-white transition-all duration-500 ${
              scrolled && !menuOpen
                ? "max-h-0 py-0 opacity-0"
                : "max-h-24 py-2 opacity-100"
            }`}
          >
            <span className="line-clamp-2">{announcementText}</span>
          </p>
        ) : null}

        <nav className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-5 py-4 md:px-10 md:py-5">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Cerca opere"
            title="Cerca opere"
            className="inline-flex h-10 w-10 items-center justify-center justify-self-start rounded-full border border-ink/10 text-ink transition-all duration-300 hover:border-accent-ink hover:text-accent-ink"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="justify-self-center font-serif text-[28px] font-semibold leading-none text-ink transition-colors duration-300 hover:text-accent-ink md:text-[32px]"
          >
            ED
          </Link>

          <button
            onClick={toggleMenu}
            className="relative flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-ink/10 text-ink transition-all duration-300 hover:border-accent-ink hover:text-accent-ink"
            aria-label="Apri o chiudi il menu"
            aria-expanded={menuOpen}
          >
            <span className="relative h-5 w-5">
              <Menu
                size={18}
                className={`absolute inset-0 m-auto transition-all duration-300 ${
                  menuOpen
                    ? "rotate-90 scale-75 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <X
                size={18}
                className={`absolute inset-0 m-auto transition-all duration-300 ${
                  menuOpen
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-75 opacity-0"
                }`}
              />
            </span>
          </button>
        </nav>
      </header>

      <div
        inert={!menuOpen}
        className={`fixed inset-0 z-40 bg-pure-white/98 backdrop-blur-2xl transition-all duration-700 ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-6">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`group relative font-serif text-[clamp(1.75rem,7vw,2.5rem)] font-semibold text-ink transition-all duration-500 hover:text-accent-ink ${
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: menuOpen ? `${150 + index * 80}ms` : "0ms",
              }}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                    pathname === item.href
                      ? "bg-accent-ink"
                      : "bg-ink/20 group-hover:bg-accent-ink/60"
                  }`}
                />
                {item.label}
              </span>
            </Link>
          ))}

          <div className="mt-4 flex items-center gap-4">
            {actionItems.map(({ href, label, Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                aria-label={label}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 text-ink transition-all hover:border-accent-ink hover:text-accent-ink"
              >
                <Icon size={20} strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
