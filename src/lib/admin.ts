import "server-only";

import { getAdminEmails, isSupabaseConfigured } from "@/lib/env";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import type { Artwork } from "@/lib/supabase/types";

export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  const allowedEmails = getAdminEmails();
  return allowedEmails.includes(email.toLowerCase());
}

export async function getAdminSession() {
  if (!isSupabaseConfigured()) {
    return { configured: false, user: null, allowed: false };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { configured: false, user: null, allowed: false };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    configured: true,
    user,
    allowed: isAllowedAdminEmail(user?.email),
  };
}

export async function getAllArtworksForAdmin() {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [] as Artwork[];
  }

  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load admin artworks", error.message);
    return [];
  }

  return (data || []) as Artwork[];
}

export async function requireAdminForMutation() {
  const session = await getAdminSession();

  if (!session.configured) {
    return { ok: false as const, status: 503, message: "Supabase non configurato." };
  }

  if (!session.user) {
    return { ok: false as const, status: 401, message: "Accesso richiesto." };
  }

  if (!session.allowed) {
    return { ok: false as const, status: 403, message: "Email non autorizzata." };
  }

  return { ok: true as const, user: session.user };
}
