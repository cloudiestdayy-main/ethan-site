import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminForMutation } from "@/lib/admin";
import { SITE_SETTING_KEYS } from "@/lib/settings-shared";
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

const settingsSchema = z
  .object({
    announcement_text: z.string().trim().max(200),
    hero_title: z.string().trim().max(120),
    hero_subtitle: z.string().trim().max(300),
    contact_email: optionalEmail,
    instagram_url: optionalUrl,
    twitter_url: optionalUrl,
    artstation_url: optionalUrl,
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

  // Copre anche /about e /contact (statiche), oltre alle pagine dinamiche.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
