"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  ImageUp,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Save,
  Star,
  StarOff,
  Trash2,
  X,
} from "lucide-react";
import { readClientImageDimensions } from "@/lib/client-image-dimensions";
import { getArtworkImageUrl } from "@/lib/artworks-shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Artwork } from "@/lib/supabase/types";

type ActionState = {
  id: string;
  label: string;
} | null;

type Notice = {
  tone: "success" | "error" | "muted";
  text: string;
} | null;

type NoticeTone = NonNullable<Notice>["tone"];

type ArtworkUpdateResponse = {
  artwork?: Artwork;
  message?: string;
  storageMessage?: string | null;
};

type UploadUrlResponse = {
  path: string;
  token: string;
  message?: string;
};

type BackfillResponse = {
  total: number;
  updated: number;
  failed: number;
  skipped: number;
  message?: string;
};

function getNoticeClass(tone: NoticeTone) {
  if (tone === "success") return "text-accent";
  if (tone === "error") return "text-red-400";
  return "text-ink/50";
}

function getArtworkSummary(artwork: Artwork) {
  return [
    artwork.category || "Manga",
    artwork.year || "Senza anno",
    artwork.published ? "pubblicata" : "bozza",
    artwork.featured ? "in evidenza" : "archivio",
  ].join(" / ");
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

export function AdminArtworkManager({ artworks }: { artworks: Artwork[] }) {
  const router = useRouter();
  const [items, setItems] = useState(artworks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [action, setAction] = useState<ActionState>(null);
  const [notice, setNotice] = useState<Notice>(null);

  async function patchArtwork(id: string, payload: Record<string, unknown>, label: string) {
    setAction({ id, label });
    setNotice(null);

    const response = await fetch(`/api/admin/artworks/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseJsonResponse<ArtworkUpdateResponse>(response);

    if (!response.ok || !data.artwork) {
      setNotice({ tone: "error", text: data.message || "Aggiornamento non riuscito." });
      setAction(null);
      return null;
    }

    setItems((current) =>
      current.map((artwork) => (artwork.id === id ? { ...artwork, ...data.artwork } : artwork)),
    );
    setNotice({
      tone: data.storageMessage ? "muted" : "success",
      text: data.storageMessage
        ? `Opera aggiornata. Nota storage: ${data.storageMessage}`
        : "Opera aggiornata.",
    });
    router.refresh();
    setAction(null);
    return data.artwork;
  }

  async function uploadReplacementImage(file: File) {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      throw new Error("Supabase non e configurato.");
    }

    const dimensions = await readClientImageDimensions(file);
    const uploadResponse = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });
    const uploadData = await parseJsonResponse<UploadUrlResponse>(uploadResponse);

    if (!uploadResponse.ok) {
      throw new Error(uploadData.message || "Non posso preparare l'upload.");
    }

    const { error: uploadError } = await supabase.storage
      .from("artworks")
      .uploadToSignedUrl(uploadData.path, uploadData.token, file);

    if (uploadError) {
      throw new Error(uploadError.message || "Upload non riuscito.");
    }

    return {
      image_path: uploadData.path,
      image_width: dimensions.image_width,
      image_height: dimensions.image_height,
    };
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>, artwork: Artwork) {
    event.preventDefault();
    setAction({ id: artwork.id, label: "Salvataggio" });
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const replacementFile = form.get("image");
    const payload: Record<string, unknown> = {
      title: form.get("title"),
      category: form.get("category") || null,
      description: form.get("description") || null,
      year: form.get("year") || null,
      published: form.get("published") === "on",
      featured: form.get("featured") === "on",
      sort_order: Number(form.get("sort_order") || artwork.sort_order || 0),
    };

    try {
      if (replacementFile instanceof File && replacementFile.size > 0) {
        Object.assign(payload, await uploadReplacementImage(replacementFile));
      }

      const updatedArtwork = await patchArtwork(artwork.id, payload, "Salvataggio");
      if (updatedArtwork) setEditingId(null);
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Salvataggio non riuscito.",
      });
      setAction(null);
    }
  }

  async function toggleArtwork(artwork: Artwork, field: "published" | "featured") {
    await patchArtwork(artwork.id, { [field]: !artwork[field] }, "Aggiornamento");
  }

  async function deleteArtwork(artwork: Artwork) {
    const confirmed = window.confirm(`Eliminare "${artwork.title}"? L'immagine su Storage verra' rimossa.`);

    if (!confirmed) return;

    setAction({ id: artwork.id, label: "Eliminazione" });
    setNotice(null);

    const response = await fetch(`/api/admin/artworks/${artwork.id}`, {
      method: "DELETE",
    });
    const data = await parseJsonResponse<ArtworkUpdateResponse>(response);

    if (!response.ok) {
      setNotice({ tone: "error", text: data.message || "Eliminazione non riuscita." });
      setAction(null);
      return;
    }

    setItems((current) => current.filter((item) => item.id !== artwork.id));
    setNotice({
      tone: data.storageMessage ? "muted" : "success",
      text: data.storageMessage
        ? `Opera eliminata. Nota storage: ${data.storageMessage}`
        : "Opera eliminata.",
    });
    router.refresh();
    setAction(null);
  }

  async function reorderArtwork(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    const previousItems = items;
    const reordered = [...items];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, movedItem);
    setItems(reordered);
    setAction({ id: movedItem.id, label: "Riordino" });
    setNotice(null);

    const response = await fetch("/api/admin/artworks/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((artwork) => artwork.id) }),
    });
    const data = await parseJsonResponse<ArtworkUpdateResponse>(response);

    if (!response.ok) {
      setItems(previousItems);
      setNotice({ tone: "error", text: data.message || "Riordino non riuscito." });
    } else {
      setNotice({ tone: "success", text: "Ordine aggiornato." });
      router.refresh();
    }

    setAction(null);
  }

  async function backfillDimensions() {
    setAction({ id: "backfill", label: "Backfill" });
    setNotice(null);

    const response = await fetch("/api/admin/artworks/backfill-dimensions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ force: false }),
    });
    const data = await parseJsonResponse<BackfillResponse>(response);

    if (!response.ok) {
      setNotice({ tone: "error", text: data.message || "Backfill non riuscito." });
      setAction(null);
      return;
    }

    setNotice({
      tone: data.failed ? "muted" : "success",
      text: `Backfill dimensioni: ${data.updated} aggiornate, ${data.skipped} saltate, ${data.failed} fallite.`,
    });
    router.refresh();
    setAction(null);
  }

  const isBackfilling = action?.id === "backfill";

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink/50">{items.length} totali</p>
        <button
          type="button"
          onClick={backfillDimensions}
          disabled={Boolean(action)}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-ink/50 transition hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {isBackfilling ? (
            <LoaderCircle size={14} strokeWidth={1.7} className="animate-spin" />
          ) : (
            <RefreshCw size={14} strokeWidth={1.7} />
          )}
          Dimensioni mancanti
        </button>
      </div>

      {notice ? <p className={`text-sm ${getNoticeClass(notice.tone)}`}>{notice.text}</p> : null}

      {items.length ? (
        <div className="grid gap-5">
          {items.map((artwork, index) => {
            const imageUrl = getArtworkImageUrl(artwork.image_path);
            const isEditing = editingId === artwork.id;
            const isBusy = action?.id === artwork.id;

            return (
              <article key={artwork.id} className="border-t border-ink/8 py-5">
                <div className="grid gap-5 md:grid-cols-[120px_1fr_auto] md:items-start">
                  <div className="relative aspect-[0.78] overflow-hidden rounded-xl bg-pure-white">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={artwork.title}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-ink">
                          {artwork.title}
                        </h3>
                        <p className="mt-2 text-sm text-ink/50">{getArtworkSummary(artwork)}</p>
                        {artwork.image_width && artwork.image_height ? (
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink/30">
                            {artwork.image_width} x {artwork.image_height}px
                          </p>
                        ) : (
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink/30">
                            Dimensioni mancanti
                          </p>
                        )}
                      </div>
                      {isBusy ? (
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-accent">
                          <LoaderCircle size={14} className="animate-spin" />
                          {action.label}
                        </span>
                      ) : null}
                    </div>

                    {isEditing ? (
                      <form
                        onSubmit={(event) => handleEditSubmit(event, artwork)}
                        className="mt-6 grid gap-5 rounded-lg border border-ink/8 bg-paper p-5"
                      >
                        <div className="grid gap-5 md:grid-cols-2">
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.18em] text-ink/50">
                              Titolo
                            </span>
                            <input
                              name="title"
                              required
                              defaultValue={artwork.title}
                              className="mt-2 w-full border-b border-ink/10 bg-transparent py-3 text-base text-ink outline-none transition focus:border-accent"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.18em] text-ink/50">
                              Categoria
                            </span>
                            <input
                              name="category"
                              defaultValue={artwork.category || ""}
                              className="mt-2 w-full border-b border-ink/10 bg-transparent py-3 text-base text-ink outline-none transition focus:border-accent"
                            />
                          </label>
                        </div>

                        <div className="grid gap-5 md:grid-cols-[1fr_1fr_1fr]">
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.18em] text-ink/50">
                              Anno
                            </span>
                            <input
                              name="year"
                              type="number"
                              min="1900"
                              max="2100"
                              defaultValue={artwork.year || ""}
                              className="mt-2 w-full border-b border-ink/10 bg-transparent py-3 text-base text-ink outline-none transition focus:border-accent"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.18em] text-ink/50">
                              Ordine
                            </span>
                            <input
                              name="sort_order"
                              type="number"
                              defaultValue={artwork.sort_order || 0}
                              className="mt-2 w-full border-b border-ink/10 bg-transparent py-3 text-base text-ink outline-none transition focus:border-accent"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.18em] text-ink/50">
                              Immagine
                            </span>
                            <span className="mt-2 flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/10 px-4 text-sm text-ink/50 transition hover:border-accent hover:text-accent">
                              <ImageUp size={15} strokeWidth={1.7} />
                              Sostituisci
                              <input name="image" type="file" accept="image/*" className="sr-only" />
                            </span>
                          </label>
                        </div>

                        <label className="block">
                          <span className="text-xs uppercase tracking-[0.18em] text-ink/50">
                            Descrizione
                          </span>
                          <textarea
                            name="description"
                            rows={4}
                            defaultValue={artwork.description || ""}
                            className="mt-2 w-full resize-none border-b border-ink/10 bg-transparent py-3 text-base text-ink outline-none transition focus:border-accent"
                          />
                        </label>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex flex-wrap gap-5 text-sm text-ink/50">
                            <label className="inline-flex cursor-pointer items-center gap-3">
                              <input
                                name="published"
                                type="checkbox"
                                defaultChecked={artwork.published}
                                className="h-4 w-4 rounded border border-ink/15 bg-pure-white accent-accent"
                              />
                              Pubblicata
                            </label>
                            <label className="inline-flex cursor-pointer items-center gap-3">
                              <input
                                name="featured"
                                type="checkbox"
                                defaultChecked={artwork.featured}
                                className="h-4 w-4 rounded border border-ink/15 bg-pure-white accent-accent"
                              />
                              In evidenza
                            </label>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-ink/50 transition hover:border-pure-white hover:text-ink"
                            >
                              <X size={14} />
                              Annulla
                            </button>
                            <button
                              type="submit"
                              disabled={isBusy}
                              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs uppercase tracking-[0.16em] text-pure-black transition hover:bg-pure-white disabled:opacity-50"
                            >
                              <Save size={14} />
                              Salva
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => reorderArtwork(index, -1)}
                      disabled={Boolean(action) || index === 0}
                      title="Sposta su"
                      aria-label="Sposta su"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-accent hover:text-accent disabled:opacity-35"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderArtwork(index, 1)}
                      disabled={Boolean(action) || index === items.length - 1}
                      title="Sposta giu'"
                      aria-label="Sposta giu'"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-accent hover:text-accent disabled:opacity-35"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleArtwork(artwork, "published")}
                      disabled={Boolean(action)}
                      title={artwork.published ? "Nascondi" : "Pubblica"}
                      aria-label={artwork.published ? "Nascondi" : "Pubblica"}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-accent hover:text-accent disabled:opacity-35"
                    >
                      {artwork.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleArtwork(artwork, "featured")}
                      disabled={Boolean(action)}
                      title={artwork.featured ? "Rimuovi evidenza" : "Metti in evidenza"}
                      aria-label={artwork.featured ? "Rimuovi evidenza" : "Metti in evidenza"}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-accent hover:text-accent disabled:opacity-35"
                    >
                      {artwork.featured ? <Star size={16} /> : <StarOff size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : artwork.id)}
                      disabled={Boolean(action)}
                      title="Modifica"
                      aria-label="Modifica"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-accent hover:text-accent disabled:opacity-35"
                    >
                      {isEditing ? <Check size={16} /> : <Pencil size={16} />}
                    </button>
                    {artwork.published ? (
                      <Link
                        href={`/portfolio/${artwork.slug}`}
                        title="Apri"
                        aria-label="Apri opera"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-accent hover:text-accent"
                      >
                        <Eye size={16} />
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => deleteArtwork(artwork)}
                      disabled={Boolean(action)}
                      title="Elimina"
                      aria-label="Elimina"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-400/25 text-red-300 transition hover:border-red-300 hover:text-red-200 disabled:opacity-35"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border-t border-ink/8 pt-6 text-ink/50">
          Nessuna opera caricata.
        </div>
      )}
    </div>
  );
}
