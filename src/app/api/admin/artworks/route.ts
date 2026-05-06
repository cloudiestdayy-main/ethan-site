import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminForMutation } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

const artworkSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  image_path: z.string().trim().min(3),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

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
  const { data, error } = await supabase
    .from("artworks")
    .insert({
      ...parsed.data,
      description: parsed.data.description || null,
      year: parsed.data.year || null,
      slug,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/portfolio");

  return NextResponse.json({ artwork: data });
}
