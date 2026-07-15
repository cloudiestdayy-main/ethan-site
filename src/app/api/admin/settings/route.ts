import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminForMutation } from "@/lib/admin";
import { IMAGE_SETTING_KEYS, SITE_SETTING_KEYS } from "@/lib/settings-shared";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Vuoto = elemento nascosto nel sito, quindi "" e' sempre accettato.
const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: "Email non valida.",
  });

const optionalUrl = z
  .string()
  .trim()
  .max(200)
  .refine((value) => value === "" || /^https?:\/\/.+\..+/.test(value), {
    message: "URL non valido (serve https://...).",
  });

const title = z.string().trim().max(200);
const shortText = z.string().trim().max(600);
const longText = z.string().trim().max(3000);

// Path immagine: vuoto (= ripristina il file originale) oppure un file
// caricato dall'editor sotto il prefisso `site/` del bucket artworks.
const imagePath = z
  .string()
  .trim()
  .max(200)
  .refine((value) => value === "" || /^site\/[\w.\-]+$/.test(value), {
    message: "Percorso immagine non valido.",
  });

const settingsSchema = z
  .object({
    announcement_text: z.string().trim().max(200),
    hero_title: z.string().trim().max(120),
    hero_subtitle: z.string().trim().max(300),
    contact_email: optionalEmail,
    instagram_url: optionalUrl,
    twitter_url: optionalUrl,
    artstation_url: optionalUrl,
    home_most_viewed_title: title,
    home_works_title: title,
    home_works_text: shortText,
    home_about_quote: shortText,
    home_about_text: shortText,
    home_contact_title: title,
    home_contact_text: shortText,
    about_story_heading: title,
    about_story_text: longText,
    about_why_heading: title,
    about_why_text: longText,
    about_process_1_title: title,
    about_process_1_text: shortText,
    about_process_2_title: title,
    about_process_2_text: shortText,
    about_process_3_title: title,
    about_process_3_text: shortText,
    about_tools: shortText,
    contact_title: title,
    contact_intro_text: longText,
    hero_image_path: imagePath,
    portrait_image_path: imagePath,
    process_1_image_path: imagePath,
    process_2_image_path: imagePath,
    process_3_image_path: imagePath,
    contact_image_path: imagePath,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0);

export async function PATCH(request: Request) {
  const admin = await requireAdminForMutation();

  if (!admin.ok) {
    return NextResponse.json({ message: admin.message }, { status: admin.status });
  }

  const parsed = settingsSchema.safeParse(await request.json());

  if (!parsed.success) {
    const detail = parsed.error.issues[0]?.message;
    return NextResponse.json(
      {
        message:
          detail && detail !== "Invalid input"
            ? detail
            : "Contenuti non validi (controlla lunghezza e formato dei campi).",
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase service role mancante." },
      { status: 503 },
    );
  }

  // Path immagine precedenti: se il salvataggio li sostituisce, il vecchio
  // file `site/...` va rimosso dallo storage (mai i file delle opere).
  const imageKeysInPayload = IMAGE_SETTING_KEYS.filter(
    (key) => key in parsed.data,
  );
  let previousImagePaths = new Map<string, string>();

  if (imageKeysInPayload.length) {
    const { data: previousRows } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", imageKeysInPayload);
    previousImagePaths = new Map(
      (previousRows || []).map((row) => [row.key as string, row.value as string]),
    );
  }

  const rows = SITE_SETTING_KEYS.filter((key) => key in parsed.data).map(
    (key) => ({
      key,
      value: parsed.data[key] ?? "",
      updated_at: new Date().toISOString(),
    }),
  );

  const { error } = await supabase.from("site_settings").upsert(rows);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const replacedPaths = imageKeysInPayload
    .map((key) => previousImagePaths.get(key) || "")
    .filter(
      (previous, index) =>
        previous.startsWith("site/") &&
        previous !== parsed.data[imageKeysInPayload[index]],
    );

  if (replacedPaths.length) {
    // Non fatale: il salvataggio e' riuscito, al peggio resta un file orfano.
    const { error: removeError } = await supabase.storage
      .from("artworks")
      .remove(replacedPaths);
    if (removeError) {
      console.error(
        "Failed to remove replaced site images",
        removeError.message,
      );
    }
  }

  // Copre anche /about e /contact (statiche), oltre alle pagine dinamiche.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
