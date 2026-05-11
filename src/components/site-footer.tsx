import Link from "next/link";
import { Camera, MessageCircle, Palette } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Opere" },
  { href: "/about", label: "Chi sono" },
  { href: "/contact", label: "Commissioni" },
];

export function SiteFooter() {
  return (
    <footer className="w-full bg-deep-blue">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div>
            <Link href="/" className="font-display text-2xl font-bold text-pure-white">
              Ethan&apos;s Drawings
            </Link>
            <p className="mt-4 max-w-sm text-base text-pure-white/60 leading-relaxed">
              Portfolio manga e illustrazioni di Ethan, artista italiano appassionato di cultura giapponese.
            </p>
          </div>
          <div className="flex flex-wrap gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className="text-base font-medium text-pure-white hover:text-accent transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex gap-5">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="text-pure-white hover:text-accent hover:scale-110 transition-all" aria-label="Instagram">
              <Camera size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
              className="text-pure-white hover:text-accent hover:scale-110 transition-all" aria-label="Twitter">
              <MessageCircle size={24} />
            </a>
            <a href="https://artstation.com" target="_blank" rel="noopener noreferrer"
              className="text-pure-white hover:text-accent hover:scale-110 transition-all" aria-label="ArtStation">
              <Palette size={24} />
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-pure-white/10 pt-8">
          <p className="text-sm text-pure-white/40">&copy; 2026 Ethan&apos;s Drawings. Tutti i diritti riservati.</p>
          <a href="mailto:cloudiestdayy@gmail.com" className="text-sm text-accent hover:text-pure-white transition-colors">
            cloudiestdayy@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
