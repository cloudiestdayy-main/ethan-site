import "server-only";

import {
  DEFAULT_SITE_SETTINGS,
  isSiteSettingKey,
  type SiteSettings,
} from "@/lib/settings-shared";
import { createSupabaseStaticClient } from "@/lib/supabase/server";

/**
 * Legge le impostazioni sito con il client anon SENZA cookie: la chiamata
 * vive in `SiteShell`, che avvolge anche /about e /contact (pagine statiche),
 * e `cookies()` le renderebbe dinamiche. Degrada ai default se Supabase non
 * e' configurato o la tabella non esiste ancora.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createSupabaseStaticClient();

  if (!supabase) {
    return { ...DEFAULT_SITE_SETTINGS };
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) {
    console.error("Failed to load site settings", error.message);
    return { ...DEFAULT_SITE_SETTINGS };
  }

  const settings: SiteSettings = { ...DEFAULT_SITE_SETTINGS };

  for (const row of data || []) {
    if (typeof row.key === "string" && isSiteSettingKey(row.key)) {
      settings[row.key] = typeof row.value === "string" ? row.value : "";
    }
  }

  return settings;
}
