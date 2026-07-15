"use client";

import { useState, type ChangeEvent } from "react";
import { ImageUp, Undo2 } from "lucide-react";

const MAX_BYTES = 20 * 1024 * 1024; // limite del bucket Storage (20MB)

/**
 * Campo immagine dell'editor contenuti: mostra l'immagine attuale (o quella
 * in bozza), permette di sostituirla con un file locale e di ripristinare
 * l'originale. Il file resta in bozza: l'upload avviene al salvataggio.
 */
export function AdminImageField({
  label,
  hint,
  displayUrl,
  canReset,
  disabled,
  onFile,
  onReset,
}: {
  label: string;
  hint?: string;
  /** URL da mostrare: bozza locale, file caricato o fallback originale. */
  displayUrl: string;
  /** True se c'e' qualcosa da ripristinare (file in bozza o immagine caricata). */
  canReset: boolean;
  disabled?: boolean;
  onFile: (file: File) => void;
  onReset: () => void;
}) {
  const [error, setError] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Il file deve essere un'immagine (JPG, PNG, WebP o GIF).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Immagine troppo grande (max 20 MB).");
      return;
    }

    setError("");
    onFile(file);
  }

  return (
    <div className="rounded-2xl border border-ink/8 bg-pure-white/60 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/60">{label}</p>
      <div className="mt-3 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl}
          alt=""
          className="h-20 w-20 shrink-0 rounded-xl border border-ink/8 object-cover"
        />
        <div className="flex flex-wrap gap-2">
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs uppercase tracking-[0.12em] text-ink transition hover:border-accent hover:text-accent ${
              disabled ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <ImageUp size={14} strokeWidth={1.7} />
            Sostituisci
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleChange}
              disabled={disabled}
            />
          </label>
          {canReset ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                onReset();
              }}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-ink/50 transition hover:border-ink/30 hover:text-ink disabled:opacity-50"
            >
              <Undo2 size={14} strokeWidth={1.7} />
              Ripristina originale
            </button>
          ) : null}
        </div>
      </div>
      {hint ? <p className="mt-3 text-xs text-ink/50">{hint}</p> : null}
      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
