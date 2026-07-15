import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminForMutation } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ArtworkImage } from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const addImagesSchema = z.object({
  images: z
    .array(
      z.object({
        image_path: z.string().trim().min(3),
        image_width: z.number().int().positive().optional().nullable(),
        image_height: z.number().int().positive().optional().nullable(),
      }),
    )
    .min(1)
    .max(40),
});

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
});

const removeSchema = z.object({
  image_id: z.string().uuid(),
});

function revalidateArtworkPages(slug: string | null | undefined) {
  revalidatePath("/");
  revalidatePath("/portfolio");
  if (slug) revalidatePath(`/portfolio/${slug}`);
}

async function loadArtwork(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  id: string,
) {
  const { data, error } = await supabase
    .from("artworks")
    .select("id, slug")
    .eq("id", id)
    .maybeSingle();

  if (error) return { artwork: null, response: NextResponse.json({ message: error.message }, { status: 500 }) };
  if (!data) return { artwork: null, response: NextResponse.json({ message: "Opera non trovata." }, { status: 404 }) };
  return { artwork: data, response: null };
}

/** Aggiunge tavole (gia' caricate su Storage) in coda a quelle esistenti. */
export async function POST(request: Request, context: RouteContext) {
  const admin = await requireAdminForMutation();

  if (!admin.ok) {
    return NextResponse.json({ message: admin.message }, { status: admin.status });
  }

  const parsed = addImagesSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Dati tavole non validi." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase service role mancante." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const { artwork, response } = await loadArtwork(supabase, id);
  if (!artwork) return response;

  const { data: lastImage } = await supabase
    .from("artwork_images")
    .select("sort_order")
    .eq("artwork_id", id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (lastImage?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("artwork_images")
    .insert(
      parsed.data.images.map((image, index) => ({
        artwork_id: id,
        image_path: image.image_path,
        image_width: image.image_width || null,
        image_height: image.image_height || null,
        sort_order: nextOrder + index,
      })),
    )
    .select("*");

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  revalidateArtworkPages(artwork.slug);

  return NextResponse.json({ images: (data || []) as ArtworkImage[] });
}

/** Riordina le tavole: `ids` nell'ordine desiderato. */
export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminForMutation();

  if (!admin.ok) {
    return NextResponse.json({ message: admin.message }, { status: admin.status });
  }

  const parsed = reorderSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Ordine non valido." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase service role mancante." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const { artwork, response } = await loadArtwork(supabase, id);
  if (!artwork) return response;

  for (const [index, imageId] of parsed.data.ids.entries()) {
    const { error } = await supabase
      .from("artwork_images")
      .update({ sort_order: index })
      .eq("id", imageId)
      .eq("artwork_id", id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

  revalidateArtworkPages(artwork.slug);

  return NextResponse.json({ ok: true });
}

/** Elimina una tavola (riga + file su Storage). */
export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireAdminForMutation();

  if (!admin.ok) {
    return NextResponse.json({ message: admin.message }, { status: admin.status });
  }

  const parsed = removeSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Tavola non valida." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase service role mancante." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const { artwork, response } = await loadArtwork(supabase, id);
  if (!artwork) return response;

  const { data: image, error: loadError } = await supabase
    .from("artwork_images")
    .select("id, image_path")
    .eq("id", parsed.data.image_id)
    .eq("artwork_id", id)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ message: loadError.message }, { status: 500 });
  }

  if (!image) {
    return NextResponse.json({ message: "Tavola non trovata." }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("artwork_images")
    .delete()
    .eq("id", image.id);

  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 });
  }

  let storageMessage: string | null = null;

  if (image.image_path) {
    const { error: removeError } = await supabase.storage
      .from("artworks")
      .remove([image.image_path]);

    storageMessage = removeError?.message || null;
  }

  revalidateArtworkPages(artwork.slug);

  return NextResponse.json({ ok: true, storageMessage });
}
