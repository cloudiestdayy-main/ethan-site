import Link from "next/link";
import { InstagramIcon, XIcon, ArtStationIcon } from "@/components/social-icons";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Opere" },
  { href: "/about", label: "Chi sono" },
  { href: "/contact", label: "Commissioni" },
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-white/10 bg-pure-black">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <Link
            href="/"
            className="font-serif text-2xl font-semibold text-pure-white transition-colors hover:text-accent"
          >
            Ethan&apos;s Drawings
          </Link>

          <nav className="flex flex-wrap gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-pure-white/60 transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-5">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pure-white/60 transition-colors hover:text-accent"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pure-white/60 transition-colors hover:text-accent"
              aria-label="X"
            >
              <XIcon className="h-5 w-5" />
            </a>
            <a
              href="https://artstation.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pure-white/60 transition-colors hover:text-accent"
              aria-label="ArtStation"
            >
              <ArtStationIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 md:flex-row md:items-center">
          <p className="text-xs text-pure-white/30">
            &copy; 2026 Ethan&apos;s Drawings. Tutti i diritti riservati.
          </p>
          <a
            href="mailto:cloudiestdayy@gmail.com"
            className="text-xs text-accent transition-colors hover:text-pure-white"
          >
            cloudiestdayy@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
