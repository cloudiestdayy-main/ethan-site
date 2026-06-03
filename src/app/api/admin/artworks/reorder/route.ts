import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminForMutation } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export async function POST(request: Request) {
  const admin = await requireAdminForMutation();

  if (!admin.ok) {
    return NextResponse.json({ message: admin.message }, { status: admin.status });
  }

  const parsed = reorderSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Ordine opere non valido." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase service role mancante." },
      { status: 503 },
    );
  }

  const updates = await Promise.all(
    parsed.data.ids.map((id, index) =>
      supabase
        .from("artworks")
        .update({ sort_order: index * 10 })
        .eq("id", id)
        .select("id")
        .single(),
    ),
  );

  const failedUpdate = updates.find((result) => result.error);

  if (failedUpdate?.error) {
    return NextResponse.json({ message: failedUpdate.error.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/portfolio");

  return NextResponse.json({ ok: true });
}
