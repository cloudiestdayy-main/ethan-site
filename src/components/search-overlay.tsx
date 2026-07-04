"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LoaderCircle, Search, X } from "lucide-react";
import { KIND_LABELS } from "@/lib/artwork-kinds";
import { getArtworkImageUrl } from "@/lib/artworks-shared";
import { filterSearchIndex, type SearchIndexItem } from "@/lib/search-index";

const MAX_RESULTS = 12;

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndexItem[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestedRef = useRef(false);

  // L'indice e' l'intero archivio pubblicato (poche decine di opere):
  // una fetch al primo open, poi il filtro gira in locale a ogni tasto.
  // Niente setState sincrono qui dentro (regola react set-state-in-effect):
  // lo stato cambia solo nei callback async della fetch.
  const loadIndex = useCallback(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    fetch("/api/search-index")
      .then((response) => {
        if (!response.ok) throw new Error("search index unavailable");
        return response.json() as Promise<{ artworks: SearchIndexItem[] }>;
      })
      .then((data) => setIndex(data.artworks || []))
      .catch(() => {
        requestedRef.current = false;
        setLoadFailed(true);
      });
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    loadIndex();
  }, [open, loadIndex]);

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleClose]);

  function retryLoad() {
    setLoadFailed(false);
    loadIndex();
  }

  const loading = open && index === null && !loadFailed;
  const trimmedQuery = query.trim();
  const results = index
    ? filterSearchIndex(index, query).slice(0, MAX_RESULTS)
    : [];
  const showEmptyState =
    Boolean(index) && trimmedQuery.length >= 2 && results.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cerca opere"
      className={`fixed inset-0 z-[60] bg-pure-white/98 backdrop-blur-2xl transition-all duration-500 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-5 pb-8 pt-6 md:px-8 md:pt-10">
        <div className="flex items-center gap-4 border-b border-ink/10 pb-5">
          <Search size={20} strokeWidth={1.5} className="shrink-0 text-ink/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca per titolo o collezione..."
            aria-label="Cerca opere per titolo o collezione"
            className="w-full bg-transparent font-serif text-2xl font-medium text-ink outline-none placeholder:text-ink/25 md:text-3xl"
          />
          <button
            type="button"
            onClick={handleClose}
            aria-label="Chiudi la ricerca"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink transition-all duration-300 hover:border-accent hover:text-accent"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="no-scrollbar mt-2 flex-1 overflow-y-auto pb-10">
          {loading ? (
            <p className="flex items-center gap-3 py-6 text-sm text-ink/40">
              <LoaderCircle size={16} className="animate-spin" />
              Carico l&apos;archivio...
            </p>
          ) : null}

          {loadFailed ? (
            <div className="flex flex-wrap items-center gap-4 py-6">
              <p className="text-sm text-ink/50">
                Non riesco a caricare l&apos;archivio.
              </p>
              <button
                type="button"
                onClick={retryLoad}
                className="rounded-full border border-ink/10 px-4 py-2 text-xs uppercase tracking-[0.14em] text-ink/60 transition hover:border-accent hover:text-accent"
              >
                Riprova
              </button>
            </div>
          ) : null}

          {!loading && !loadFailed && trimmedQuery.length < 2 ? (
            <p className="py-6 text-sm text-ink/35">
              Scrivi almeno due lettere per cercare tra tavole e illustrazioni.
            </p>
          ) : null}

          {results.length ? (
            <ul>
              {results.map((item) => {
                const imageUrl = getArtworkImageUrl(item.image_path);
                const meta = [
                  KIND_LABELS[item.kind].singular,
                  item.category || null,
                  item.year ? String(item.year) : null,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <li key={item.slug}>
                    <Link
                      href={`/portfolio/${item.slug}`}
                      onClick={handleClose}
                      className="group flex items-center gap-4 border-b border-ink/8 py-4"
                    >
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-ink/8 bg-paper">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-serif text-lg font-medium text-ink transition-colors group-hover:text-accent">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-ink/40">
                          {meta}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={16}
                        className="shrink-0 text-ink/30 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {showEmptyState ? (
            <p className="py-6 text-sm text-ink/50">
              Nessuna opera trovata per &ldquo;{trimmedQuery}&rdquo;.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
