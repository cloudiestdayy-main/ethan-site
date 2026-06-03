import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminForMutation } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

const artworkSchema = z.object({
  title: z.string().trim().min(2),
  category: z.string().trim().max(80).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  image_path: z.string().trim().min(3),
  image_width: z.number().int().positive().optional().nullable(),
  image_height: z.number().int().positive().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

type ArtworkInsertPayload = {
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  year: number | null;
  image_path: string;
  image_width: number | null;
  image_height: number | null;
  featured: boolean;
  published: boolean;
};

const optionalMetadataColumns = ["category", "image_width", "image_height"];

export async function POST(request: Request) {
  const admin = await requireAdminForMutation();

  if (!admin.ok) {
    return NextResponse.json({ message: admin.message }, { status: admin.status });
  }

  const parsed = artworkSchema.safeParse(await request.json());

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

  const slugBase = slugify(parsed.data.title);
  const slug = `${slugBase}-${Date.now().toString(36)}`;
  const artworkPayload: ArtworkInsertPayload = {
    title: parsed.data.title,
    slug,
    category: parsed.data.category || null,
    description: parsed.data.description || null,
    year: parsed.data.year || null,
    image_path: parsed.data.image_path,
    image_width: parsed.data.image_width || null,
    image_height: parsed.data.image_height || null,
    featured: parsed.data.featured,
    published: parsed.data.published,
  };

  let insertResult = await supabase
    .from("artworks")
    .insert(artworkPayload)
    .select("*")
    .single();

  if (
    insertResult.error &&
    optionalMetadataColumns.some((column) =>
      insertResult.error?.message.toLowerCase().includes(column),
    )
  ) {
    insertResult = await supabase
      .from("artworks")
      .insert({
        title: artworkPayload.title,
        slug: artworkPayload.slug,
        description: artworkPayload.description,
        year: artworkPayload.year,
        image_path: artworkPayload.image_path,
        featured: artworkPayload.featured,
        published: artworkPayload.published,
      })
      .select("*")
      .single();
  }

  if (insertResult.error) {
    return NextResponse.json({ message: insertResult.error.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/portfolio");

  return NextResponse.json({ artwork: insertResult.data });
}
