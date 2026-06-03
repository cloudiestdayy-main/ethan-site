import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function EmptyGallery({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-elevated p-8 md:p-12">
      <div className="relative z-10 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.12em] text-accent">
          Archivio in preparazione
        </p>
        <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-pure-white md:text-5xl">
          Le prime tavole verranno caricate presto.
        </h2>
        {!compact ? (
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-pure-white/70 transition-colors hover:text-accent"
          >
            Richiedi una commissione
            <ArrowUpRight size={15} strokeWidth={1.5} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
