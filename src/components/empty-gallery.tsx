import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function EmptyGallery({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-deep-blue p-8 md:p-12">
      <div className="relative z-10 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Archivio in preparazione</p>
        <h2 className="mt-5 font-display text-4xl md:text-5xl font-bold text-pure-white uppercase">
          Le prime tavole verranno caricate presto.
        </h2>
        {!compact ? (
          <Link href="/contact"
            className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-pure-white hover:text-accent transition-colors">
            Richiedi una commissione
            <ArrowUpRight size={15} strokeWidth={1.5} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
