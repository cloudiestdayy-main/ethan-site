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
  AdminCategoryField,
  resolveCategoryFields,
} from "@/components/admin-category-field";
import {
  readClientImageDimensions,
  type ImageDimensions,
} from "@/lib/client-image-dimensions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type UploadState = "idle" | "uploading" | "saving" | "done" | "error";

type SelectedFile = {
  file: File;
  url: string;
  dimensions: ImageDimensions | null;
};

const MAX_BYTES = 20 * 1024 * 1024; // matches the Storage bucket limit (20MB)
const MAX_FILES = 40;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STEPS: { key: UploadState; label: string }[] = [
  { key: "uploading", label: "Carico le immagini" },
  { key: "saving", label: "Salvo i metadati" },
  { key: "done", label: "Fatto" },
];

export function AdminUploadForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  // Rimonta il selettore categoria dopo un salvataggio (reset dello stato "nuova").
  const [formVersion, setFormVersion] = useState(0);
  const isWorking = state === "uploading" || state === "saving";
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      for (const item of filesRef.current) URL.revokeObjectURL(item.url);
    };
  }, []);

  const addFiles = useCallback(async (selected: FileList | File[] | null) => {
    setMessage("");
    setState("idle");

    const incoming = Array.from(selected || []);
    if (!incoming.length) return;

    const invalid = incoming.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      setState("error");
      setMessage("Ogni file deve essere un'immagine (JPG, PNG, WebP o GIF).");
      return;
    }

    const tooBig = incoming.find((file) => file.size > MAX_BYTES);
    if (tooBig) {
      setState("error");
      setMessage(
        `"${tooBig.name}" e' troppo grande (max ${formatBytes(MAX_BYTES)}).`,
      );
      return;
    }

    const prepared: SelectedFile[] = [];
    for (const file of incoming) {
      prepared.push({
        file,
        url: URL.createObjectURL(file),
        dimensions: await readClientImageDimensions(file),
      });
    }

    setFiles((current) => {
      const next = [...current, ...prepared];
      if (next.length > MAX_FILES) {
        setState("error");
        setMessage(`Massimo ${MAX_FILES} tavole per opera.`);
        for (const item of prepared) URL.revokeObjectURL(item.url);
        return current;
      }
      return next;
    });
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    void addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    if (isWorking) return;
    void addFiles(event.dataTransfer.files);
  }

  function removeFile(index: number) {
    setFiles((current) => {
      const item = current[index];
      if (item) URL.revokeObjectURL(item.url);
      return current.filter((_, i) => i !== index);
    });
    setState("idle");
    setMessage("");
  }

  function clearFiles() {
    for (const item of filesRef.current) URL.revokeObjectURL(item.url);
    setFiles([]);
    setState("idle");
    setMessage("");
  }

  async function uploadOne(item: SelectedFile) {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      throw new Error("Supabase non e configurato.");
    }

    const uploadResponse = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        filename: item.file.name,
        contentType: item.file.type,
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error("Non posso preparare l'upload. Riprova.");
    }

    const uploadData = (await uploadResponse.json()) as {
      path: string;
      token: string;
    };

    const { error: uploadError } = await supabase.storage
      .from("artworks")
      .uploadToSignedUrl(uploadData.path, uploadData.token, item.file);

    if (uploadError) {
      throw new Error("Upload non riuscito. Riprova.");
    }

    const dimensions =
      item.dimensions ?? (await readClientImageDimensions(item.file));

    return {
      image_path: uploadData.path,
      image_width: dimensions.image_width,
      image_height: dimensions.image_height,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!files.length) {
      setState("error");
      setMessage("Seleziona almeno un'immagine prima di salvare.");
      return;
    }

    const form = new FormData(event.currentTarget);

    setState("uploading");
    setMessage("");
    setUploadProgress(0);

    const uploaded: Array<{
      image_path: string;
      image_width: number | null;
      image_height: number | null;
    }> = [];

    try {
      for (const [index, item] of files.entries()) {
        setUploadProgress(index + 1);
        uploaded.push(await uploadOne(item));
      }
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Upload non riuscito.",
      );
      return;
    }

    setState("saving");

    const [cover, ...extraImages] = uploaded;
    const saveResponse = await fetch("/api/admin/artworks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        category: resolveCategoryFields(form),
        kind: form.get("kind") || "tavola",
        description: form.get("description"),
        year: form.get("year") || null,
        image_path: cover.image_path,
        image_width: cover.image_width,
        image_height: cover.image_height,
        extra_images: extraImages,
        featured: form.get("featured") === "on",
        published: form.get("published") === "on",
      }),
    });

    if (!saveResponse.ok) {
      setState("error");
      setMessage("Immagini caricate, ma i metadati non sono stati salvati.");
      return;
    }

    const saveData = (await saveResponse.json().catch(() => ({}))) as {
      imagesMessage?: string | null;
    };

    formRef.current?.reset();
    clearFiles();
    setFormVersion((version) => version + 1);
    setState("done");
    setMessage(
      saveData.imagesMessage
        ? `Opera salvata, ma le tavole extra non sono state registrate: ${saveData.imagesMessage}`
        : "Opera salvata e pubblicata nell'archivio.",
    );
    router.refresh();
  }

  const cover = files[0] || null;

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
          {cover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover.url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pure-black/55 via-transparent to-transparent" />
              {files.length > 1 ? (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-pure-black/50 px-4 py-2 text-xs uppercase tracking-[0.14em] text-pure-white backdrop-blur-sm">
                  {files.length} tavole
                </span>
              ) : null}
              <span className="absolute bottom-4 left-4 right-4 z-10 inline-flex items-center justify-center gap-2 rounded-full border border-pure-white/30 bg-pure-black/40 px-4 py-2 text-xs uppercase tracking-[0.14em] text-pure-white backdrop-blur-sm">
                <ImageUp size={14} strokeWidth={1.7} />
                Trascina o clicca per aggiungerne altre
              </span>
            </>
          ) : (
            <span className="relative z-10 flex flex-col items-center gap-3 px-6">
              <span className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-pure-white/80 px-5 py-3 text-sm uppercase tracking-[0.16em] text-ink backdrop-blur-sm transition-all duration-300 group-hover:border-accent group-hover:bg-accent/10">
                <ImageUp size={16} strokeWidth={1.5} />
                Seleziona o trascina le tavole
              </span>
              <span className="text-xs text-ink/35">
                Anche piu&apos; file insieme — la prima e&apos; la copertina.
                <br />
                JPG, PNG, WebP o GIF — max {formatBytes(MAX_BYTES)} ciascuna
              </span>
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileChange}
            disabled={isWorking}
          />
        </label>

        {files.length ? (
          <div className="grid gap-2">
            {files.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-paper/60 px-4 py-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg border border-ink/8 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">
                    {index === 0 ? (
                      <span className="mr-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-accent">
                        Copertina
                      </span>
                    ) : (
                      <span className="mr-2 text-xs text-ink/35">
                        Tavola {index + 1}
                      </span>
                    )}
                    {item.file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/40">
                    {formatBytes(item.file.size)}
                    {item.dimensions?.image_width && item.dimensions?.image_height
                      ? ` · ${item.dimensions.image_width} × ${item.dimensions.image_height}px`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={isWorking}
                  aria-label={`Rimuovi ${item.file.name}`}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-red-300 hover:text-red-300 disabled:opacity-50"
                >
                  <X size={15} strokeWidth={1.7} />
                </button>
              </div>
            ))}
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
        <div className="grid gap-5 md:grid-cols-3">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-ink/40">
              Tipo
            </span>
            <select
              name="kind"
              defaultValue="tavola"
              className="mt-2 w-full cursor-pointer border-b border-ink/10 bg-transparent py-4 text-lg text-ink outline-none transition focus:border-accent"
            >
              <option value="tavola">Tavola</option>
              <option value="illustrazione">Illustrazione</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-ink/40">
              Categoria (collezione)
            </span>
            <AdminCategoryField key={formVersion} categories={categories} />
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
            disabled={isWorking || !files.length}
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
              ? `Carico ${uploadProgress}/${files.length}...`
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
