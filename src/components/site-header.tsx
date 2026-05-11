"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Opere" },
  { href: "/about", label: "Studio" },
  { href: "/contact", label: "Commissioni" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-pure-black/90 backdrop-blur-xl border-b border-pure-white/5"
            : "bg-transparent"
        } ${mounted ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-10">
          {/* Logo come bottone */}
          <Link
            href="/"
            className="group relative inline-flex items-center gap-2 rounded-full border border-pure-white/15 bg-pure-white/5 px-4 py-2 text-sm font-medium text-pure-white backdrop-blur-sm transition-all duration-500 hover:border-accent hover:bg-accent/10 hover:shadow-[0_0_20px_rgba(94,234,212,0.15)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="font-display tracking-wide">Ethan&apos;s Drawings</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-4 py-2 text-sm font-medium text-pure-white/80 transition-colors duration-300 hover:text-pure-white"
                style={{ transitionDelay: mounted ? `${i * 50}ms` : "0ms" }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                      pathname === item.href
                        ? "bg-accent shadow-[0_0_8px_rgba(94,234,212,0.6)] scale-100"
                        : "bg-pure-white/30 scale-75 group-hover:scale-100 group-hover:bg-accent/70"
                    }`}
                  />
                  {item.label}
                </span>
                {/* Underline animato */}
                <span
                  className={`absolute bottom-1 left-4 right-4 h-px bg-accent transition-all duration-500 ease-out ${
                    pathname === item.href
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                  }`}
                  style={{ transformOrigin: "center" }}
                />
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative md:hidden text-pure-white w-10 h-10 flex items-center justify-center rounded-full border border-pure-white/10 bg-pure-white/5 transition-all duration-300 hover:border-accent hover:bg-accent/10"
            aria-label="Toggle menu"
          >
            <span className="relative w-5 h-5">
              <Menu
                size={20}
                className={`absolute inset-0 transition-all duration-300 ${
                  menuOpen ? "rotate-90 opacity-0 scale-75" : "rotate-0 opacity-100 scale-100"
                }`}
              />
              <X
                size={20}
                className={`absolute inset-0 transition-all duration-300 ${
                  menuOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-75"
                }`}
              />
            </span>
          </button>
        </nav>
      </header>

      {/* Mobile menu fullscreen */}
      <div
        className={`fixed inset-0 z-40 bg-pure-black/98 backdrop-blur-2xl transition-all duration-700 md:hidden ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative font-display text-4xl font-bold text-pure-white transition-all duration-500 hover:text-accent ${
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: menuOpen ? `${150 + i * 80}ms` : "0ms" }}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full transition-all duration-500 ${
                    pathname === item.href
                      ? "bg-accent shadow-[0_0_12px_rgba(94,234,212,0.5)]"
                      : "bg-pure-white/20 group-hover:bg-accent/60"
                  }`}
                />
                {item.label}
              </span>
              <span
                className={`absolute -bottom-2 left-0 h-px bg-accent transition-all duration-500 ${
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
