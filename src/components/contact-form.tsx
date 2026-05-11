"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { type ContactState, submitCommissionRequest } from "@/app/actions/contact";

const initialState: ContactState = { ok: false, message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitCommissionRequest, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-accent mb-2">Nome</label>
        <input name="name" required
          className="w-full bg-transparent border-b border-pure-white/20 py-3 text-lg text-pure-white outline-none transition-colors focus:border-accent placeholder:text-pure-white/30"
          placeholder="Il tuo nome" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-accent mb-2">Email</label>
        <input name="email" type="email" required
          className="w-full bg-transparent border-b border-pure-white/20 py-3 text-lg text-pure-white outline-none transition-colors focus:border-accent placeholder:text-pure-white/30"
          placeholder="la tua@email.com" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-accent mb-2">Messaggio</label>
        <textarea name="message" required rows={5}
          className="w-full bg-transparent border-b border-pure-white/20 py-3 text-lg text-pure-white outline-none transition-colors focus:border-accent resize-none placeholder:text-pure-white/30"
          placeholder="Descrivi la tua idea..." />
      </div>
      <button type="submit" disabled={pending}
        className="inline-flex items-center gap-3 bg-accent text-pure-black px-8 py-4 text-base font-medium hover:bg-pure-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 mt-4">
        <Send size={18} />
        {pending ? "Invio in corso..." : "Invia richiesta"}
      </button>
      {state.message ? (
        <p className={state.ok ? "text-sm text-accent" : "text-sm text-red-400"}>{state.message}</p>
      ) : null}
    </form>
  );
}
