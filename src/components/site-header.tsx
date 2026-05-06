import Link from "next/link";

const navItems = [
  { href: "/portfolio", label: "Opere" },
  { href: "/about", label: "Studio" },
  { href: "/contact", label: "Commissioni" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-line/70 bg-paper/78 px-4 py-3 text-xs uppercase tracking-[0.16em] text-ink-soft backdrop-blur md:px-6">
        <Link href="/" className="font-medium">
          Studio Tavole
        </Link>
        <div className="flex items-center gap-3 md:gap-7">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-sage"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
