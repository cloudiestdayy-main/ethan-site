"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, LoaderCircle, Save } from "lucide-react";
import { AdminImageField } from "@/components/admin-image-field";
import {
  PREVIEW_READY_MESSAGE,
  PREVIEW_SET_MESSAGE,
} from "@/components/preview-bridge";
import {
  DEFAULT_SITE_SETTINGS,
  FALLBACK_KEYS,
  SITE_IMAGE_FALLBACKS,
  isSiteImageKey,
  resolveSiteImage,
  type SiteImageKey,
  type SiteSettingKey,
  type SiteSettings,
} from "@/lib/settings-shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Notice = { tone: "success" | "error"; text: string } | null;

type TextField = {
  kind: "text";
  key: SiteSettingKey;
  label: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  maxLength: number;
};

type ImageField = {
  kind: "image";
  key: SiteImageKey;
  label: string;
  hint?: string;
};

type Field = TextField | ImageField;

type Tab = {
  id: string;
  label: string;
  previewPath: string;
  sections: { title: string; fields: Field[] }[];
};

/** Slot lato API (upload-url) per ogni chiave immagine. */
const IMAGE_SLOTS: Record<SiteImageKey, string> = {
  hero_image_path: "hero",
  portrait_image_path: "portrait",
  process_1_image_path: "process-1",
  process_2_image_path: "process-2",
  process_3_image_path: "process-3",
  contact_image_path: "contact",
};

const TABS: Tab[] = [
  {
    id: "general",
    label: "Generale",
    previewPath: "/",
    sections: [
      {
        title: "Annuncio e hero",
        fields: [
          {
            kind: "text",
            key: "announcement_text",
            label: "Annuncio nell'header",
            hint: "Barra sopra il menu su tutte le pagine. Vuoto = nascosta.",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "hero_title",
            label: "Titolo hero (home)",
            hint: "Vuoto = nessun titolo visibile (l'anteprima live funziona solo se il titolo e' gia' presente).",
            maxLength: 120,
          },
          {
            kind: "text",
            key: "hero_subtitle",
            label: "Sottotitolo hero (home)",
            hint: "Vuoto = nessun sottotitolo visibile.",
            maxLength: 300,
          },
        ],
      },
      {
        title: "Contatti e social",
        fields: [
          {
            kind: "text",
            key: "contact_email",
            label: "Email pubblica",
            hint: "Compare nel footer e nella pagina Contatti.",
            maxLength: 120,
          },
          {
            kind: "text",
            key: "instagram_url",
            label: "Instagram",
            hint: "Vuoto = icona nascosta.",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "twitter_url",
            label: "X (Twitter)",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "artstation_url",
            label: "ArtStation",
            maxLength: 200,
          },
        ],
      },
    ],
  },
  {
    id: "home",
    label: "Home",
    previewPath: "/",
    sections: [
      {
        title: "Immagine di apertura",
        fields: [
          {
            kind: "image",
            key: "hero_image_path",
            label: "Sfondo hero",
            hint: "Usata anche in cima alla pagina Chi sono.",
          },
        ],
      },
      {
        title: "Sezioni opere",
        fields: [
          {
            kind: "text",
            key: "home_most_viewed_title",
            label: "Titolo “I più visti”",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "home_works_title",
            label: "Titolo archivio",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "home_works_text",
            label: "Testo archivio",
            multiline: true,
            rows: 3,
            maxLength: 600,
          },
        ],
      },
      {
        title: "Blocco “Chi sono”",
        fields: [
          {
            kind: "text",
            key: "home_about_quote",
            label: "Citazione",
            hint: "Le virgolette vengono aggiunte automaticamente.",
            multiline: true,
            rows: 3,
            maxLength: 600,
          },
          {
            kind: "text",
            key: "home_about_text",
            label: "Testo di presentazione",
            multiline: true,
            rows: 4,
            maxLength: 600,
          },
        ],
      },
      {
        title: "Blocco contatti",
        fields: [
          {
            kind: "text",
            key: "home_contact_title",
            label: "Titolo",
            hint: "Un a capo = riga nuova nel titolo.",
            multiline: true,
            rows: 2,
            maxLength: 200,
          },
          {
            kind: "text",
            key: "home_contact_text",
            label: "Testo",
            multiline: true,
            rows: 3,
            maxLength: 600,
          },
          {
            kind: "image",
            key: "contact_image_path",
            label: "Immagine del blocco",
          },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "Chi sono",
    previewPath: "/about",
    sections: [
      {
        title: "La mia storia",
        fields: [
          {
            kind: "image",
            key: "portrait_image_path",
            label: "Ritratto",
            hint: "Usato anche nel blocco “Chi sono” della home.",
          },
          {
            kind: "text",
            key: "about_story_heading",
            label: "Titolo",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "about_story_text",
            label: "Biografia",
            hint: "Riga vuota = nuovo paragrafo.",
            multiline: true,
            rows: 10,
            maxLength: 3000,
          },
        ],
      },
      {
        title: "Perché disegno",
        fields: [
          {
            kind: "text",
            key: "about_why_heading",
            label: "Titolo",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "about_why_text",
            label: "Testo",
            hint: "Riga vuota = nuovo paragrafo.",
            multiline: true,
            rows: 6,
            maxLength: 3000,
          },
        ],
      },
      {
        title: "Metodo di lavoro",
        fields: [
          {
            kind: "text",
            key: "about_process_1_title",
            label: "Fase 01 — Titolo",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "about_process_1_text",
            label: "Fase 01 — Testo",
            multiline: true,
            rows: 2,
            maxLength: 600,
          },
          {
            kind: "image",
            key: "process_1_image_path",
            label: "Fase 01 — Immagine",
          },
          {
            kind: "text",
            key: "about_process_2_title",
            label: "Fase 02 — Titolo",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "about_process_2_text",
            label: "Fase 02 — Testo",
            multiline: true,
            rows: 2,
            maxLength: 600,
          },
          {
            kind: "image",
            key: "process_2_image_path",
            label: "Fase 02 — Immagine",
          },
          {
            kind: "text",
            key: "about_process_3_title",
            label: "Fase 03 — Titolo",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "about_process_3_text",
            label: "Fase 03 — Testo",
            multiline: true,
            rows: 2,
            maxLength: 600,
          },
          {
            kind: "image",
            key: "process_3_image_path",
            label: "Fase 03 — Immagine",
          },
          {
            kind: "text",
            key: "about_tools",
            label: "Strumenti",
            hint: "Uno per riga.",
            multiline: true,
            rows: 5,
            maxLength: 600,
          },
        ],
      },
    ],
  },
  {
    id: "contact",
    label: "Contatti",
    previewPath: "/contact",
    sections: [
      {
        title: "Introduzione",
        fields: [
          {
            kind: "text",
            key: "contact_title",
            label: "Titolo pagina",
            maxLength: 200,
          },
          {
            kind: "text",
            key: "contact_intro_text",
            label: "Testo introduttivo",
            multiline: true,
            rows: 4,
            maxLength: 3000,
          },
        ],
      },
    ],
  },
];

const inputClass =
  "mt-2 w-full border-b border-ink/10 bg-transparent py-3 text-base text-ink placeholder:text-ink/20 outline-none transition focus:border-accent";
const labelClass = "text-xs uppercase tracking-[0.18em] text-ink/60";
const hintClass = "mt-2 block text-xs text-ink/50";

type PendingImage = { file: File; url: string };

export function AdminContentEditor({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [tabId, setTabId] = useState(TABS[0].id);
  const [draft, setDraft] = useState<Partial<SiteSettings>>({});
  const [pendingImages, setPendingImages] = useState<
    Partial<Record<SiteImageKey, PendingImage>>
  >({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  // Ref specchio dello stato, usate dai listener (message/beforeunload).
  const draftRef = useRef(draft);
  const pendingImagesRef = useRef(pendingImages);
  useEffect(() => {
    draftRef.current = draft;
    pendingImagesRef.current = pendingImages;
  }, [draft, pendingImages]);

  const tab = TABS.find((candidate) => candidate.id === tabId) ?? TABS[0];
  const isDirty =
    Object.keys(draft).length > 0 || Object.keys(pendingImages).length > 0;

  /** Valore mostrato nell'anteprima per una chiave testo (vuoto = default). */
  const previewTextValue = useCallback(
    (key: SiteSettingKey, raw: string) =>
      raw.trim() === "" && FALLBACK_KEYS.has(key)
        ? DEFAULT_SITE_SETTINGS[key]
        : raw,
    [],
  );

  const postToPreview = useCallback((key: SiteSettingKey, value: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_SET_MESSAGE, key, value },
      window.location.origin,
    );
  }, []);

  /** Ripubblica l'intera bozza (dopo il ready dell'iframe o un cambio tab). */
  const postAllDrafts = useCallback(() => {
    for (const [key, value] of Object.entries(draftRef.current)) {
      const settingKey = key as SiteSettingKey;
      if (isSiteImageKey(settingKey)) {
        if (value === "") postToPreview(settingKey, SITE_IMAGE_FALLBACKS[settingKey]);
      } else {
        postToPreview(settingKey, previewTextValue(settingKey, value ?? ""));
      }
    }
    for (const [key, pending] of Object.entries(pendingImagesRef.current)) {
      if (pending) postToPreview(key as SiteSettingKey, pending.url);
    }
  }, [postToPreview, previewTextValue]);

  // Handshake con il bridge dentro l'iframe.
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if ((event.data as { type?: string })?.type !== PREVIEW_READY_MESSAGE)
        return;
      postAllDrafts();
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [postAllDrafts]);

  // Avviso del browser se si chiude la pagina con modifiche non salvate.
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Revoca gli object URL residui allo smontaggio.
  useEffect(() => {
    return () => {
      for (const pending of Object.values(pendingImagesRef.current)) {
        if (pending) URL.revokeObjectURL(pending.url);
      }
    };
  }, []);

  // Anteprima con debounce mentre si digita.
  const sendTimer = useRef<number | null>(null);
  const queuedSends = useRef(new Map<SiteSettingKey, string>());

  const queuePreview = useCallback(
    (key: SiteSettingKey, value: string) => {
      queuedSends.current.set(key, value);
      if (sendTimer.current) window.clearTimeout(sendTimer.current);
      sendTimer.current = window.setTimeout(() => {
        queuedSends.current.forEach((queuedValue, queuedKey) =>
          postToPreview(queuedKey, queuedValue),
        );
        queuedSends.current.clear();
      }, 150);
    },
    [postToPreview],
  );

  function handleTextChange(key: SiteSettingKey, value: string) {
    setDraft((current) =>
      value === settings[key]
        ? (() => {
            const next = { ...current };
            delete next[key];
            return next;
          })()
        : { ...current, [key]: value },
    );
    queuePreview(key, previewTextValue(key, value));
  }

  function handleImageFile(key: SiteImageKey, file: File) {
    const url = URL.createObjectURL(file);
    setPendingImages((current) => {
      const previous = current[key];
      if (previous) URL.revokeObjectURL(previous.url);
      return { ...current, [key]: { file, url } };
    });
    // Un nuovo file sostituisce un eventuale "ripristina" in bozza.
    setDraft((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    postToPreview(key, url);
  }

  function handleImageReset(key: SiteImageKey) {
    setPendingImages((current) => {
      const previous = current[key];
      if (previous) URL.revokeObjectURL(previous.url);
      const next = { ...current };
      delete next[key];
      return next;
    });
    setDraft((current) => {
      const next = { ...current };
      if (settings[key].trim() !== "") next[key] = "";
      else delete next[key];
      return next;
    });
    postToPreview(key, SITE_IMAGE_FALLBACKS[key]);
  }

  async function handleSave() {
    setSaving(true);
    setNotice(null);

    const payload: Partial<Record<SiteSettingKey, string>> = { ...draft };
    const imageEntries = Object.entries(pendingImages) as Array<
      [SiteImageKey, PendingImage]
    >;

    if (imageEntries.length) {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        setNotice({ tone: "error", text: "Supabase non e' configurato." });
        setSaving(false);
        return;
      }

      for (const [key, pending] of imageEntries) {
        const uploadResponse = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            filename: pending.file.name,
            contentType: pending.file.type,
            scope: "site",
            slot: IMAGE_SLOTS[key],
          }),
        });

        if (!uploadResponse.ok) {
          setNotice({
            tone: "error",
            text: "Non posso preparare l'upload delle immagini. Riprova.",
          });
          setSaving(false);
          return;
        }

        const uploadData = (await uploadResponse.json()) as {
          path: string;
          token: string;
        };

        const { error: uploadError } = await supabase.storage
          .from("artworks")
          .uploadToSignedUrl(uploadData.path, uploadData.token, pending.file);

        if (uploadError) {
          setNotice({
            tone: "error",
            text: "Upload dell'immagine non riuscito. Riprova.",
          });
          setSaving(false);
          return;
        }

        payload[key] = uploadData.path;
      }
    }

    if (!Object.keys(payload).length) {
      setNotice({ tone: "success", text: "Nessuna modifica da salvare." });
      setSaving(false);
      return;
    }

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
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

    for (const [, pending] of imageEntries) URL.revokeObjectURL(pending.url);
    setPendingImages({});
    setDraft({});
    setNotice({ tone: "success", text: "Contenuti aggiornati sul sito." });
    setSaving(false);
    router.refresh();
    // Ricarica l'anteprima: mostra la pagina con i contenuti salvati.
    iframeRef.current?.contentWindow?.location.reload();
  }

  const previewSrc = useMemo(() => tab.previewPath, [tab.previewPath]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,480px)_1fr]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => setTabId(candidate.id)}
              className={`rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition ${
                candidate.id === tabId
                  ? "bg-ink text-pure-white"
                  : "border border-ink/10 text-ink/50 hover:border-ink/30 hover:text-ink"
              }`}
            >
              {candidate.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-10">
          {tab.sections.map((section) => (
            <section key={section.title} className="grid gap-6">
              <p className="border-b border-ink/8 pb-3 text-xs uppercase tracking-[0.2em] text-accent-ink">
                {section.title}
              </p>
              {section.fields.map((field) =>
                field.kind === "image" ? (
                  <AdminImageField
                    key={field.key}
                    label={field.label}
                    hint={field.hint}
                    displayUrl={
                      pendingImages[field.key]?.url ??
                      (draft[field.key] === ""
                        ? SITE_IMAGE_FALLBACKS[field.key]
                        : resolveSiteImage(settings, field.key))
                    }
                    canReset={
                      Boolean(pendingImages[field.key]) ||
                      (!(field.key in draft) &&
                        settings[field.key].trim() !== "")
                    }
                    disabled={saving}
                    onFile={(file) => handleImageFile(field.key, file)}
                    onReset={() => handleImageReset(field.key)}
                  />
                ) : (
                  <label key={field.key} className="block">
                    <span className={labelClass}>{field.label}</span>
                    {field.multiline ? (
                      <textarea
                        value={draft[field.key] ?? settings[field.key]}
                        rows={field.rows ?? 4}
                        maxLength={field.maxLength}
                        disabled={saving}
                        onChange={(event) =>
                          handleTextChange(field.key, event.target.value)
                        }
                        className={`${inputClass} resize-y`}
                      />
                    ) : (
                      <input
                        value={draft[field.key] ?? settings[field.key]}
                        maxLength={field.maxLength}
                        disabled={saving}
                        onChange={(event) =>
                          handleTextChange(field.key, event.target.value)
                        }
                        className={inputClass}
                      />
                    )}
                    {field.hint ? (
                      <span className={hintClass}>{field.hint}</span>
                    ) : null}
                  </label>
                ),
              )}
            </section>
          ))}
        </div>

        <div className="sticky bottom-0 mt-10 flex flex-wrap items-center gap-4 border-t border-ink/8 bg-paper py-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.16em] text-pure-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle size={16} strokeWidth={1.7} className="animate-spin" />
            ) : (
              <Save size={16} strokeWidth={1.7} />
            )}
            {saving ? "Salvo..." : "Salva contenuti"}
          </button>
          {isDirty && !saving ? (
            <span className="rounded-full bg-accent/20 px-4 py-2 text-xs uppercase tracking-[0.14em] text-accent-ink">
              Modifiche non salvate
            </span>
          ) : null}
          {notice ? (
            <p
              className={`text-sm ${
                notice.tone === "error" ? "text-red-400" : "text-accent-ink"
              }`}
            >
              {notice.text}
            </p>
          ) : null}
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-6">
          <div className="flex items-center justify-between pb-3">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/60">
              Anteprima live
            </p>
            <a
              href={previewSrc}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-ink/60 transition hover:text-accent"
            >
              Apri la pagina
              <ExternalLink size={13} strokeWidth={1.7} />
            </a>
          </div>
          <iframe
            ref={iframeRef}
            src={previewSrc}
            title="Anteprima del sito"
            className="h-[calc(100vh-7rem)] w-full rounded-2xl border border-ink/10 bg-pure-white"
          />
          <p className="mt-3 text-xs text-ink/50">
            L&apos;anteprima mostra le modifiche mentre scrivi. Diventano
            pubbliche solo dopo &ldquo;Salva contenuti&rdquo;.
          </p>
        </div>
      </div>

      <div className="lg:hidden">
        <p className="rounded-2xl border border-ink/8 bg-pure-white/60 p-4 text-xs text-ink/60">
          L&apos;anteprima live e&apos; disponibile su schermi piu&apos; grandi.
          Dopo il salvataggio puoi controllare la pagina{" "}
          <a href={previewSrc} target="_blank" rel="noreferrer" className="text-accent-ink u-underline">
            aprendola qui
          </a>
          .
        </p>
      </div>
    </div>
  );
}
