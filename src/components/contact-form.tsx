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
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-accent-ink">
          Nome
        </label>
        <input
          name="name"
          required
          className="w-full border-b border-ink/10 bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-accent-ink"
          placeholder="Il tuo nome"
        />
      </div>
      <div>
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-accent-ink">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full border-b border-ink/10 bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-accent-ink"
          placeholder="la tua@email.com"
        />
      </div>
      <div>
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-accent-ink">
          Messaggio
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full resize-none border-b border-ink/10 bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-accent-ink"
          placeholder="Descrivi la tua idea..."
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-3 rounded-full border border-accent-ink bg-accent-ink px-8 py-4 text-sm font-medium text-pure-white transition-all duration-300 hover:border-ink hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={16} strokeWidth={1.5} />
        {pending ? "Invio in corso..." : "Invia richiesta"}
      </button>
      {state.message ? (
        <p
          role="status"
          className={state.ok ? "text-sm text-accent-ink" : "text-sm text-red-600"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
