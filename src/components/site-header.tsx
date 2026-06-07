"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, Search, UserRound, X } from "lucide-react";

const navItems = [
  { href: "/portfolio", label: "I miei lavori" },
  { href: "/about", label: "Chi sono" },
  { href: "/contact", label: "Commissioni" },
];

const actionItems = [
  { href: "/portfolio", label: "Cerca opere", Icon: Search },
  { href: "/admin/login", label: "Area admin", Icon: UserRound },
  { href: "/contact", label: "Scrivi", Icon: Mail },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`site-header-enter fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          scrolled
            ? "border-b border-ink/5 bg-pure-white/85 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:grid md:grid-cols-[1fr_auto_1fr] md:py-5 md:px-10">
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-[14px] font-medium tracking-[0.02em] transition-colors duration-300 hover:text-accent ${
                  pathname === item.href
                    ? "text-ink"
                    : "text-ink/60"
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute -bottom-1 left-0 h-px w-full bg-accent" />
                )}
              </Link>
            ))}
          </div>

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="justify-self-center font-serif text-[28px] font-semibold leading-none text-ink transition-colors duration-300 hover:text-accent md:text-[32px]"
          >
            ED
          </Link>

          <div className="hidden items-center justify-end gap-3 md:flex">
            {actionItems.map(({ href, label, Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                title={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink transition-all duration-300 hover:border-accent hover:text-accent"
              >
                <Icon size={20} strokeWidth={1.5} />
              </Link>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-ink/10 text-ink transition-all duration-300 hover:border-accent hover:text-accent md:hidden"
            aria-label="Toggle menu"
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
        className={`fixed inset-0 z-40 bg-pure-white/98 backdrop-blur-2xl transition-all duration-700 md:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-6">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`group relative font-serif text-[clamp(1.75rem,7vw,2.5rem)] font-semibold text-ink transition-all duration-500 hover:text-accent ${
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
                      ? "bg-accent"
                      : "bg-ink/20 group-hover:bg-accent/60"
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
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 text-ink transition-all hover:border-accent hover:text-accent"
              >
                <Icon size={20} strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
