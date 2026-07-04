import Link from "next/link";
import { BackToTop } from "@/components/back-to-top";
import {
  hasSocialLinks,
  SocialLinks,
  type SocialUrls,
} from "@/components/social-links";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "I miei lavori" },
  { href: "/about", label: "Chi sono" },
  { href: "/contact", label: "Contatti" },
];

export function SiteFooter({
  contactEmail,
  socials,
}: {
  contactEmail: string;
  socials: SocialUrls;
}) {
  const email = contactEmail.trim();

  return (
    <footer className="w-full border-t border-ink/8 bg-pure-white">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10">
        <div className="mb-12 flex justify-center border-b border-ink/5 pb-10 md:justify-end">
          <BackToTop />
        </div>

        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <Link
            href="/"
            className="font-serif text-2xl font-semibold text-ink transition-colors hover:text-accent"
          >
            Ethan&apos;s Drawings
          </Link>

          <nav className="flex flex-wrap gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink/50 transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {hasSocialLinks(socials) ? (
            <div className="flex items-center gap-1">
              <SocialLinks
                urls={socials}
                linkClassName="p-2 text-ink/50 transition-colors hover:text-accent"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink/5 pt-8 md:flex-row md:items-center">
          <p className="text-xs text-ink/30">
            &copy; 2026 Ethan&apos;s Drawings. Tutti i diritti riservati.
          </p>
          {email ? (
            <a
              href={`mailto:${email}`}
              className="text-xs text-accent transition-colors hover:text-ink"
            >
              {email}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
