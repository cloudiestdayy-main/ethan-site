"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Maximize, X, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Immagine dell'opera cliccabile: si apre a schermo intero e da lì si può
 * ingrandire alla risoluzione reale (con pan via scroll) per leggere il
 * dettaglio del tratto. Escape chiude, lo scroll della pagina resta bloccato.
 */
export function ArtworkLightbox({
  src,
  alt,
  width,
  height,
  priority = true,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Solo la prima tavola della pagina deve essere prioritaria. */
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setZoomed(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Apri "${alt}" a schermo intero`}
        className="group relative block w-full cursor-zoom-in"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 1024px) 64vw, 92vw"
          className="h-auto w-full rounded-xl object-contain"
          priority={priority}
        />
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-ink/80 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-pure-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize size={13} strokeWidth={1.8} />
          Ingrandisci
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[70] bg-ink/95 backdrop-blur-sm"
        >
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2 md:right-6 md:top-6">
            <button
              type="button"
              onClick={() => setZoomed((value) => !value)}
              aria-label={zoomed ? "Riduci" : "Ingrandisci al dettaglio"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-pure-white/20 bg-ink/60 text-pure-white transition-colors hover:bg-pure-white hover:text-ink"
            >
              {zoomed ? (
                <ZoomOut size={18} strokeWidth={1.5} />
              ) : (
                <ZoomIn size={18} strokeWidth={1.5} />
              )}
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Chiudi"
              autoFocus
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-pure-white/20 bg-ink/60 text-pure-white transition-colors hover:bg-pure-white hover:text-ink"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          {zoomed ? (
            <div className="h-full w-full overflow-auto">
              <div className="flex min-h-full min-w-full items-start justify-center p-4 md:p-8">
                <Image
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  sizes="100vw"
                  quality={90}
                  onClick={() => setZoomed(false)}
                  className="max-w-none cursor-zoom-out"
                  style={{ width: `${width}px` }}
                />
              </div>
            </div>
          ) : (
            <div
              className="flex h-full w-full items-center justify-center p-4 md:p-10"
              onClick={close}
            >
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                sizes="100vw"
                quality={90}
                onClick={(event) => {
                  event.stopPropagation();
                  setZoomed(true);
                }}
                className="max-h-full w-auto max-w-full cursor-zoom-in object-contain"
              />
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
