import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminForMutation } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ArtworkUpdatePayload = {
  title?: string;
  category?: string | null;
  description?: string | null;
  year?: number | null;
  image_path?: string;
  image_width?: number | null;
  image_height?: number | null;
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
};

const artworkUpdateSchema = z
  .object({
    title: z.string().trim().min(2).optional(),
    category: z.string().trim().max(80).optional().nullable(),
    description: z.string().trim().optional().nullable(),
    year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
    image_path: z.string().trim().min(3).optional(),
    image_width: z.number().int().positive().optional().nullable(),
    image_height: z.number().int().positive().optional().nullable(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
    sort_order: z.number().int().optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

const optionalMetadataColumns = ["category", "image_width", "image_height"];

function shouldRetryWithoutOptionalMetadata(message: string) {
  const normalized = message.toLowerCase();
  return optionalMetadataColumns.some((column) => normalized.includes(column));
}

function toUpdatePayload(data: z.infer<typeof artworkUpdateSchema>): ArtworkUpdatePayload {
  const payload: ArtworkUpdatePayload = {};

  if ("title" in data) payload.title = data.title;
  if ("category" in data) payload.category = data.category || null;
  if ("description" in data) payload.description = data.description || null;
  if ("year" in data) payload.year = data.year || null;
  if ("image_path" in data && data.image_path) payload.image_path = data.image_path;
  if ("image_width" in data) payload.image_width = data.image_width || null;
  if ("image_height" in data) payload.image_height = data.image_height || null;
  if ("featured" in data) payload.featured = data.featured;
  if ("published" in data) payload.published = data.published;
  if ("sort_order" in data) payload.sort_order = data.sort_order;

  return payload;
}

function withoutOptionalMetadata(payload: ArtworkUpdatePayload) {
  return {
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
    ...(payload.year !== undefined ? { year: payload.year } : {}),
    ...(payload.image_path !== undefined ? { image_path: payload.image_path } : {}),
    ...(payload.featured !== undefined ? { featured: payload.featured } : {}),
    ...(payload.published !== undefined ? { published: payload.published } : {}),
    ...(payload.sort_order !== undefined ? { sort_order: payload.sort_order } : {}),
  };
}

function revalidateArtworkPages(slug: string | null | undefined) {
  revalidatePath("/");
  revalidatePath("/portfolio");
  if (slug) revalidatePath(`/portfolio/${slug}`);
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminForMutation();

  if (!admin.ok) {
    return NextResponse.json({ message: admin.message }, { status: admin.status });
  }

  const parsed = artworkUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Dati opera non validi." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase service role mancante." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const { data: existing, error: loadError } = await supabase
    .from("artworks")
    .select("id, slug, image_path")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ message: loadError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ message: "Opera non trovata." }, { status: 404 });
  }

  const payload = toUpdatePayload(parsed.data);
  let updateResult = await supabase
    .from("artworks")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (updateResult.error && shouldRetryWithoutOptionalMetadata(updateResult.error.message)) {
    updateResult = await supabase
      .from("artworks")
      .update(withoutOptionalMetadata(payload))
      .eq("id", id)
      .select("*")
      .single();
  }

  if (updateResult.error) {
    if (payload.image_path && payload.image_path !== existing.image_path) {
      await supabase.storage.from("artworks").remove([payload.image_path]);
    }

    return NextResponse.json({ message: updateResult.error.message }, { status: 500 });
  }

  let storageMessage: string | null = null;

  if (payload.image_path && existing.image_path && payload.image_path !== existing.image_path) {
    const { error: removeError } = await supabase.storage
      .from("artworks")
      .remove([existing.image_path]);

    storageMessage = removeError?.message || null;
  }

  revalidateArtworkPages(existing.slug);

  return NextResponse.json({
    artwork: updateResult.data,
    storageMessage,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  const { data: existing, error: loadError } = await supabase
    .from("artworks")
    .select("id, slug, image_path")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ message: loadError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ message: "Opera non trovata." }, { status: 404 });
  }

  const { error: deleteError } = await supabase.from("artworks").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 });
  }

  let storageMessage: string | null = null;

  if (existing.image_path) {
    const { error: removeError } = await supabase.storage
      .from("artworks")
      .remove([existing.image_path]);

    storageMessage = removeError?.message || null;
  }

  revalidateArtworkPages(existing.slug);

  return NextResponse.json({ ok: true, storageMessage });
}
