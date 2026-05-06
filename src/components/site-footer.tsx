import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70 bg-paper px-5 py-10 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 text-sm text-muted md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-editorial text-4xl leading-none text-foreground">
            Studio Tavole
          </p>
          <p className="mt-3 max-w-sm">
            Tavole manga, commissioni e studi visivi trattati con ritmo
            editoriale.
          </p>
        </div>
        <div className="flex gap-5 uppercase tracking-[0.16em] text-foreground">
          <Link href="/portfolio" className="hover:text-sage">
            Opere
          </Link>
          <Link href="/contact" className="hover:text-sage">
            Contatti
          </Link>
          <Link href="/admin" className="hover:text-sage">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
