"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Check, ImageUp, LoaderCircle, Sparkles, X } from "lucide-react";
import {
  readClientImageDimensions,
  type ImageDimensions,
} from "@/lib/client-image-dimensions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type UploadState = "idle" | "uploading" | "saving" | "done" | "error";

const MAX_BYTES = 20 * 1024 * 1024; // matches the Storage bucket limit (20MB)

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STEPS: { key: UploadState; label: string }[] = [
  { key: "uploading", label: "Carico l'immagine" },
  { key: "saving", label: "Salvo i metadati" },
  { key: "done", label: "Fatto" },
];

export function AdminUploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("");
  const isWorking = state === "uploading" || state === "saving";

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectFile = useCallback(async (selected: File | null) => {
    setMessage("");
    setState("idle");

    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setState("error");
      setMessage("Il file deve essere un'immagine (JPG, PNG, WebP o GIF).");
      return;
    }

    if (selected.size > MAX_BYTES) {
      setState("error");
      setMessage(`Immagine troppo grande (max ${formatBytes(MAX_BYTES)}).`);
      return;
    }

    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(selected);
    });
    setFile(selected);
    setDimensions(await readClientImageDimensions(selected));
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    void selectFile(event.target.files?.[0] || null);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    if (isWorking) return;
    void selectFile(event.dataTransfer.files?.[0] || null);
  }

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setDimensions(null);
    setState("idle");
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setState("error");
      setMessage("Seleziona un'immagine prima di salvare.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setState("error");
      setMessage("Supabase non e configurato.");
      return;
    }

    setState("uploading");
    setMessage("");
    const measured = dimensions ?? (await readClientImageDimensions(file));

    const uploadResponse = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });

    if (!uploadResponse.ok) {
      setState("error");
      setMessage("Non posso preparare l'upload. Riprova.");
      return;
    }

    const uploadData = (await uploadResponse.json()) as {
      path: string;
      token: string;
    };

    const { error: uploadError } = await supabase.storage
      .from("artworks")
      .uploadToSignedUrl(uploadData.path, uploadData.token, file);

    if (uploadError) {
      setState("error");
      setMessage("Upload non riuscito. Riprova.");
      return;
    }

    setState("saving");

    const saveResponse = await fetch("/api/admin/artworks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        category: form.get("category") || null,
        description: form.get("description"),
        year: form.get("year") || null,
        image_path: uploadData.path,
        image_width: measured.image_width,
        image_height: measured.image_height,
        featured: form.get("featured") === "on",
        published: form.get("published") === "on",
      }),
    });

    if (!saveResponse.ok) {
      setState("error");
      setMessage("Immagine caricata, ma i metadati non sono stati salvati.");
      return;
    }

    formRef.current?.reset();
    clearFile();
    setState("done");
    setMessage("Opera salvata e pubblicata nell'archivio.");
    router.refresh();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div className="space-y-3">
        <label
          onDragEnter={(event) => {
            event.preventDefault();
            if (!isWorking) setDragActive(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`group relative flex min-h-[360px] cursor-pointer items-center justify-center overflow-hidden rounded-[28px] border border-dashed text-center transition-all duration-300 ${
            dragActive
              ? "border-accent bg-accent/10 ring-2 ring-accent/30"
              : "border-ink/15 bg-paper/60 hover:border-accent hover:bg-paper"
          }`}
        >
          {previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pure-black/55 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 right-4 z-10 inline-flex items-center justify-center gap-2 rounded-full border border-pure-white/30 bg-pure-black/40 px-4 py-2 text-xs uppercase tracking-[0.14em] text-pure-white backdrop-blur-sm">
                <ImageUp size={14} strokeWidth={1.7} />
                Trascina o clicca per cambiare
              </span>
            </>
          ) : (
            <span className="relative z-10 flex flex-col items-center gap-3 px-6">
              <span className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-pure-white/80 px-5 py-3 text-sm uppercase tracking-[0.16em] text-ink backdrop-blur-sm transition-all duration-300 group-hover:border-accent group-hover:bg-accent/10">
                <ImageUp size={16} strokeWidth={1.5} />
                Seleziona o trascina la tavola
              </span>
              <span className="text-xs text-ink/35">
                JPG, PNG, WebP o GIF — max {formatBytes(MAX_BYTES)}
              </span>
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isWorking}
          />
        </label>

        {file ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-paper/60 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{file.name}</p>
              <p className="mt-0.5 text-xs text-ink/40">
                {formatBytes(file.size)}
                {dimensions?.image_width && dimensions?.image_height
                  ? ` · ${dimensions.image_width} × ${dimensions.image_height}px`
                  : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              disabled={isWorking}
              aria-label="Rimuovi immagine"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-red-300 hover:text-red-300 disabled:opacity-50"
            >
              <X size={15} strokeWidth={1.7} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.18em] text-ink/40">
            Titolo <span className="text-accent">*</span>
          </span>
          <input
            name="title"
            required
            placeholder="Titolo dell'opera"
            className="mt-2 w-full border-b border-ink/10 bg-transparent py-4 text-lg text-ink placeholder:text-ink/20 outline-none transition focus:border-accent"
          />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-ink/40">
              Categoria
            </span>
            <input
              name="category"
              placeholder="Manga, character design..."
              className="mt-2 w-full border-b border-ink/10 bg-transparent py-4 text-lg text-ink placeholder:text-ink/20 outline-none transition focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-ink/40">
              Anno
            </span>
            <input
              name="year"
              type="number"
              min="1900"
              max="2100"
              placeholder="2025"
              className="mt-2 w-full border-b border-ink/10 bg-transparent py-4 text-lg text-ink placeholder:text-ink/20 outline-none transition focus:border-accent"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.18em] text-ink/40">
            Descrizione
          </span>
          <textarea
            name="description"
            rows={5}
            placeholder="Tecnica, soggetto, contesto della tavola..."
            className="mt-2 w-full resize-none border-b border-ink/10 bg-transparent py-4 text-lg text-ink placeholder:text-ink/20 outline-none transition focus:border-accent"
          />
        </label>
        <div className="flex flex-wrap gap-6 text-sm text-ink/50">
          <label className="inline-flex items-center gap-3 cursor-pointer group">
            <input
              name="published"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border border-ink/15 bg-pure-white accent-accent cursor-pointer"
            />
            <span className="transition-colors group-hover:text-ink">Pubblicata</span>
          </label>
          <label className="inline-flex items-center gap-3 cursor-pointer group">
            <input
              name="featured"
              type="checkbox"
              className="h-4 w-4 rounded border border-ink/15 bg-pure-white accent-accent cursor-pointer"
            />
            <span className="transition-colors group-hover:text-ink">In evidenza</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={isWorking || !file}
            className="inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.16em] text-pure-white transition hover:bg-accent hover:shadow-[0_0_20px_rgba(201,168,124,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "done" ? (
              <Check size={16} strokeWidth={1.7} />
            ) : isWorking ? (
              <LoaderCircle size={16} strokeWidth={1.7} className="animate-spin" />
            ) : (
              <Sparkles size={16} strokeWidth={1.7} />
            )}
            {state === "uploading"
              ? "Carico..."
              : state === "saving"
                ? "Salvo..."
                : "Salva opera"}
          </button>

          {isWorking || state === "done" ? (
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em]">
              {STEPS.map((step, index) => {
                const order: UploadState[] = ["uploading", "saving", "done"];
                const reached = order.indexOf(state) >= order.indexOf(step.key);
                return (
                  <span
                    key={step.key}
                    className={`flex items-center gap-2 ${
                      reached ? "text-accent" : "text-ink/25"
                    }`}
                  >
                    {index > 0 ? <span className="text-ink/15">·</span> : null}
                    {step.label}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        {message ? (
          <p
            className={`text-sm ${
              state === "error"
                ? "text-red-400"
                : state === "done"
                  ? "text-accent"
                  : "text-ink/40"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
