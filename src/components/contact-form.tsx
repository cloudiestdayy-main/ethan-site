"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { type ContactState, submitCommissionRequest } from "@/app/actions/contact";

const initialState: ContactState = { ok: false, message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitCommissionRequest,
    initialState
  );

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
          Nome
        </label>
        <input
          name="name"
          required
          className="w-full border-b border-white/10 bg-transparent py-3 text-base text-pure-white outline-none transition-colors placeholder:text-white/20 focus:border-accent"
          placeholder="Il tuo nome"
        />
      </div>
      <div>
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full border-b border-white/10 bg-transparent py-3 text-base text-pure-white outline-none transition-colors placeholder:text-white/20 focus:border-accent"
          placeholder="la tua@email.com"
        />
      </div>
      <div>
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
          Messaggio
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full resize-none border-b border-white/10 bg-transparent py-3 text-base text-pure-white outline-none transition-colors placeholder:text-white/20 focus:border-accent"
          placeholder="Descrivi la tua idea..."
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-3 rounded-full border border-accent bg-accent px-8 py-4 text-sm font-medium text-pure-black transition-all duration-300 hover:bg-pure-white hover:text-pure-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={16} strokeWidth={1.5} />
        {pending ? "Invio in corso..." : "Invia richiesta"}
      </button>
      {state.message ? (
        <p className={state.ok ? "text-sm text-accent" : "text-sm text-red-400"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
