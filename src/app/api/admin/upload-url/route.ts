import { NextResponse } from "next/server";
import { requireAdminForMutation } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Slot per le immagini "di sito" (hero, ritratto, processo, contatti):
// finiscono sotto site/ nel bucket artworks, separati dalle opere.
const siteImageSlots = new Set([
  "hero",
  "portrait",
  "process-1",
  "process-2",
  "process-3",
  "contact",
]);

export async function POST(request: Request) {
  const admin = await requireAdminForMutation();

  if (!admin.ok) {
    return NextResponse.json({ message: admin.message }, { status: admin.status });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase service role mancante." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    filename?: string;
    contentType?: string;
    scope?: string;
    slot?: string;
  };

  if (!body.contentType || !allowedImageTypes.has(body.contentType)) {
    return NextResponse.json(
      { message: "Formato immagine non supportato." },
      { status: 400 },
    );
  }

  const extension = body.filename?.split(".").pop()?.toLowerCase() || "jpg";
  let path: string;

  if (body.scope === "site") {
    if (!body.slot || !siteImageSlots.has(body.slot)) {
      return NextResponse.json(
        { message: "Slot immagine non valido." },
        { status: 400 },
      );
    }
    path = `site/${body.slot}-${Date.now()}.${extension}`;
  } else {
    const baseName = slugify(body.filename?.replace(/\.[^.]+$/, "") || "opera");
    path = `${new Date().getFullYear()}/${Date.now()}-${baseName}.${extension}`;
  }

  const { data, error } = await supabase.storage
    .from("artworks")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { message: error?.message || "Upload URL non creata." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    path: data.path,
    token: data.token,
  });
}
