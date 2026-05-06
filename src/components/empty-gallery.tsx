import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function EmptyGallery({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-paper p-8 md:p-12">
      <div className="absolute right-[-12%] top-[-24%] h-72 w-72 rounded-[48%_52%_55%_45%/58%_42%_58%_42%] border border-sage/30" />
      <div className="relative z-10 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-sage">
          Archivio in preparazione
        </p>
        <h2 className="mt-5 font-editorial text-5xl leading-none text-foreground md:text-7xl">
          Le prime tavole verranno caricate dallo studio.
        </h2>
        {!compact ? (
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm uppercase tracking-[0.16em]"
          >
            Richiedi una commissione
            <ArrowUpRight size={15} strokeWidth={1.5} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
