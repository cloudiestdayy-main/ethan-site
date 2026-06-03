import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminForMutation } from "@/lib/admin";
import { getArtworkImageUrl } from "@/lib/artworks-shared";
import { fetchImageDimensions } from "@/lib/server-image-dimensions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type BackfillResult = {
  id: string;
  status: "updated" | "skipped" | "failed";
  message?: string;
};

const backfillSchema = z.object({
  force: z.boolean().optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdminForMutation();

  if (!admin.ok) {
    return NextResponse.json({ message: admin.message }, { status: admin.status });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = backfillSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Richiesta backfill non valida." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase service role mancante." },
      { status: 503 },
    );
  }

  const { data: artworks, error } = await supabase
    .from("artworks")
    .select("id, image_path, image_width, image_height")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const targets = (artworks || []).filter(
    (artwork) => parsed.data.force || !artwork.image_width || !artwork.image_height,
  );
  const results: BackfillResult[] = [];

  for (const artwork of targets) {
    const imageUrl = getArtworkImageUrl(artwork.image_path);

    if (!imageUrl) {
      results.push({
        id: artwork.id,
        status: "skipped",
        message: "URL immagine non disponibile.",
      });
      continue;
    }

    try {
      const dimensions = await fetchImageDimensions(imageUrl);

      if (!dimensions) {
        results.push({
          id: artwork.id,
          status: "failed",
          message: "Formato immagine non riconosciuto.",
        });
        continue;
      }

      const { error: updateError } = await supabase
        .from("artworks")
        .update(dimensions)
        .eq("id", artwork.id);

      if (updateError) {
        results.push({
          id: artwork.id,
          status: "failed",
          message: updateError.message,
        });
        continue;
      }

      results.push({ id: artwork.id, status: "updated" });
    } catch (error) {
      results.push({
        id: artwork.id,
        status: "failed",
        message: error instanceof Error ? error.message : "Errore sconosciuto.",
      });
    }
  }

  if (results.some((result) => result.status === "updated")) {
    revalidatePath("/");
    revalidatePath("/portfolio");
  }

  return NextResponse.json({
    total: targets.length,
    updated: results.filter((result) => result.status === "updated").length,
    failed: results.filter((result) => result.status === "failed").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    results,
  });
}
