"use server";

import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendCommissionNotification } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Inserisci il tuo nome."),
  email: z.string().trim().email("Inserisci una email valida."),
  message: z.string().trim().min(12, "Racconta brevemente la commissione."),
});

export type ContactState = {
  ok: boolean;
  message: string;
};

export async function submitCommissionRequest(
  _previousState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Controlla i campi.",
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Supabase non e configurato. Aggiungi le variabili ambiente.",
    };
  }

  const { error } = await supabase.from("commission_requests").insert(parsed.data);

  if (error) {
    return {
      ok: false,
      message: "Non sono riuscito a salvare la richiesta. Riprova.",
    };
  }

  await sendCommissionNotification(parsed.data);

  return {
    ok: true,
    message: "Richiesta inviata. Ti rispondero con tempi e disponibilita.",
  };
}
