import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-sage">404</p>
        <h1 className="mt-5 font-editorial text-7xl leading-none">
          Pagina non trovata.
        </h1>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-[0.16em] text-paper"
        >
          Torna allo studio
        </Link>
      </div>
    </main>
  );
}
