"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save } from "lucide-react";
import type { SiteSettings } from "@/lib/settings-shared";

type Notice = {
  tone: "success" | "error";
  text: string;
} | null;

const inputClass =
  "mt-2 w-full border-b border-ink/10 bg-transparent py-4 text-lg text-ink placeholder:text-ink/20 outline-none transition focus:border-accent";
const labelClass = "text-xs uppercase tracking-[0.18em] text-ink/40";
const hintClass = "mt-2 block text-xs text-ink/35";

export function AdminSettingsManager({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        announcement_text: String(form.get("announcement_text") ?? ""),
        hero_title: String(form.get("hero_title") ?? ""),
        hero_subtitle: String(form.get("hero_subtitle") ?? ""),
        contact_email: String(form.get("contact_email") ?? ""),
        instagram_url: String(form.get("instagram_url") ?? ""),
        twitter_url: String(form.get("twitter_url") ?? ""),
        artstation_url: String(form.get("artstation_url") ?? ""),
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
    };

    if (!response.ok) {
      setNotice({
        tone: "error",
        text: data.message || "Salvataggio non riuscito.",
      });
      setSaving(false);
      return;
    }

    setNotice({ tone: "success", text: "Contenuti aggiornati sul sito." });
    router.refresh();
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      <label className="block">
        <span className={labelClass}>Annuncio nell&apos;header</span>
        <input
          name="announcement_text"
          defaultValue={settings.announcement_text}
          maxLength={200}
          placeholder="Es. Nuova tavola disponibile questa settimana!"
          className={inputClass}
        />
        <span className={hintClass}>
          Compare come barra sopra il menu su tutte le pagine. Lascia vuoto per
          nasconderla.
        </span>
      </label>

      <div className="grid gap-8 md:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Titolo hero (home)</span>
          <input
            name="hero_title"
            defaultValue={settings.hero_title}
            maxLength={120}
            placeholder="Titolo grande sulla home"
            className={inputClass}
          />
          <span className={hintClass}>Vuoto = nessun titolo visibile.</span>
        </label>
        <label className="block">
          <span className={labelClass}>Sottotitolo hero (home)</span>
          <input
            name="hero_subtitle"
            defaultValue={settings.hero_subtitle}
            maxLength={300}
            placeholder="Frase sotto il titolo"
            className={inputClass}
          />
          <span className={hintClass}>Vuoto = nessun sottotitolo visibile.</span>
        </label>
      </div>

      <div className="border-t border-ink/8 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">
          Contatti e social
        </p>
        <p className="mt-2 text-xs text-ink/35">
          Compaiono nel footer e nella pagina Contatti. Un campo vuoto nasconde
          la voce corrispondente.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Email pubblica</span>
          <input
            name="contact_email"
            type="email"
            defaultValue={settings.contact_email}
            maxLength={120}
            placeholder="nome@esempio.com"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Instagram</span>
          <input
            name="instagram_url"
            defaultValue={settings.instagram_url}
            maxLength={200}
            placeholder="https://instagram.com/tuonome"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>X (Twitter)</span>
          <input
            name="twitter_url"
            defaultValue={settings.twitter_url}
            maxLength={200}
            placeholder="https://x.com/tuonome"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>ArtStation</span>
          <input
            name="artstation_url"
            defaultValue={settings.artstation_url}
            maxLength={200}
            placeholder="https://www.artstation.com/tuonome"
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.16em] text-pure-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <LoaderCircle size={16} strokeWidth={1.7} className="animate-spin" />
          ) : (
            <Save size={16} strokeWidth={1.7} />
          )}
          {saving ? "Salvo..." : "Salva contenuti"}
        </button>
        {notice ? (
          <p
            className={`text-sm ${
              notice.tone === "error" ? "text-red-400" : "text-accent"
            }`}
          >
            {notice.text}
          </p>
        ) : null}
      </div>
    </form>
  );
}
