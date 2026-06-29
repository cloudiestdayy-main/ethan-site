import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-pure-white px-5">
      <div className="max-w-xl text-center">
        <p className="text-[11px] uppercase tracking-[0.22em] text-accent">404</p>
        <h1 className="mt-5 font-serif text-[clamp(3rem,8vw,7rem)] font-medium leading-none text-ink">
          Pagina non trovata.
        </h1>
        <p className="mt-6 text-base leading-[1.8] text-ink/50">
          La tavola che cerchi non esiste o e&apos; stata spostata.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-pure-white transition-colors hover:bg-accent"
        >
          Torna allo studio
        </Link>
      </div>
    </main>
  );
}
