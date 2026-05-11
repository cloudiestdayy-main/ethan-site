"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImageUp } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type UploadState = "idle" | "uploading" | "saving" | "done" | "error";

export function AdminUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("");
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setMessage("Seleziona una immagine.");
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

    const uploadResponse = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!uploadResponse.ok) {
      setState("error");
      setMessage("Non posso preparare l'upload.");
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
      setMessage("Upload non riuscito.");
      return;
    }

    setState("saving");

    const saveResponse = await fetch("/api/admin/artworks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        year: form.get("year") || null,
        image_path: uploadData.path,
        featured: form.get("featured") === "on",
        published: form.get("published") === "on",
      }),
    });

    if (!saveResponse.ok) {
      setState("error");
      setMessage("Immagine caricata, ma metadati non salvati.");
      return;
    }

    event.currentTarget.reset();
    setFile(null);
    setState("done");
    setMessage("Opera salvata.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <label className="group relative flex min-h-[360px] cursor-pointer items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-pure-white/20 bg-deep-blue/20 text-center transition-all duration-500 hover:border-accent hover:bg-deep-blue/30">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        <span className="relative z-10 inline-flex items-center gap-3 rounded-full border border-accent/30 bg-pure-black/60 px-5 py-3 text-sm uppercase tracking-[0.16em] text-pure-white backdrop-blur-sm transition-all duration-300 group-hover:border-accent group-hover:bg-accent/10 group-hover:shadow-[0_0_20px_rgba(94,234,212,0.15)]">
          <ImageUp size={16} strokeWidth={1.5} />
          Seleziona tavola
        </span>
      </label>

      <div className="space-y-5">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.18em] text-pure-white/50">
            Titolo
          </span>
          <input
            name="title"
            required
            placeholder="Titolo dell'opera"
            className="mt-2 w-full border-b border-pure-white/15 bg-transparent py-4 text-lg text-pure-white placeholder:text-pure-white/25 outline-none transition focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.18em] text-pure-white/50">
            Descrizione
          </span>
          <textarea
            name="description"
            rows={5}
            placeholder="Breve descrizione..."
            className="mt-2 w-full resize-none border-b border-pure-white/15 bg-transparent py-4 text-lg text-pure-white placeholder:text-pure-white/25 outline-none transition focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.18em] text-pure-white/50">
            Anno
          </span>
          <input
            name="year"
            type="number"
            min="1900"
            max="2100"
            placeholder="2025"
            className="mt-2 w-full border-b border-pure-white/15 bg-transparent py-4 text-lg text-pure-white placeholder:text-pure-white/25 outline-none transition focus:border-accent"
          />
        </label>
        <div className="flex flex-wrap gap-6 text-sm text-pure-white/60">
          <label className="inline-flex items-center gap-3 cursor-pointer group">
            <input
              name="published"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border border-pure-white/20 bg-pure-black accent-accent cursor-pointer"
            />
            <span className="transition-colors group-hover:text-pure-white">Pubblicata</span>
          </label>
          <label className="inline-flex items-center gap-3 cursor-pointer group">
            <input
              name="featured"
              type="checkbox"
              className="h-4 w-4 rounded border border-pure-white/20 bg-pure-black accent-accent cursor-pointer"
            />
            <span className="transition-colors group-hover:text-pure-white">In evidenza</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={state === "uploading" || state === "saving"}
          className="inline-flex min-h-12 items-center gap-3 rounded-full bg-accent px-6 py-3 text-sm uppercase tracking-[0.16em] text-pure-black transition hover:bg-pure-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-60"
        >
          {state === "done" ? <Check size={16} strokeWidth={1.5} /> : null}
          {state === "uploading"
            ? "Upload"
            : state === "saving"
              ? "Salvataggio"
              : "Salva opera"}
        </button>
        {message ? (
          <p className={`text-sm ${state === "error" ? "text-red-400" : state === "done" ? "text-accent" : "text-pure-white/50"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
