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
  };

  if (!body.contentType || !allowedImageTypes.has(body.contentType)) {
    return NextResponse.json(
      { message: "Formato immagine non supportato." },
      { status: 400 },
    );
  }

  const extension = body.filename?.split(".").pop()?.toLowerCase() || "jpg";
  const baseName = slugify(body.filename?.replace(/\.[^.]+$/, "") || "opera");
  const path = `${new Date().getFullYear()}/${Date.now()}-${baseName}.${extension}`;

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
