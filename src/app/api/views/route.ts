import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseStaticClient } from "@/lib/supabase/server";

const viewSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export async function POST(request: Request) {
  const parsed = viewSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload non valido." }, { status: 400 });
  }

  const supabase = createSupabaseStaticClient();

  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  // RPC security definer: incremento atomico, conta solo opere pubblicate.
  // Nessun revalidatePath qui: una revalidate per visita massacrerebbe la
  // cache; l'ordinamento si aggiorna al prossimo render naturale.
  const { error } = await supabase.rpc("increment_artwork_view", {
    artwork_slug: parsed.data.slug,
  });

  if (error) {
    console.error("Failed to increment artwork view", error.message);
  }

  return NextResponse.json({ ok: true });
}
