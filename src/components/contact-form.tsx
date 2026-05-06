"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import {
  type ContactState,
  submitCommissionRequest,
} from "@/app/actions/contact";

const initialState: ContactState = {
  ok: false,
  message: "",
};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitCommissionRequest,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">
          Nome
        </span>
        <input
          name="name"
          required
          className="mt-2 w-full border-b border-line bg-transparent py-4 text-lg outline-none transition focus:border-foreground"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full border-b border-line bg-transparent py-4 text-lg outline-none transition focus:border-foreground"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">
          Messaggio
        </span>
        <textarea
          name="message"
          required
          rows={6}
          className="mt-2 w-full resize-none border-b border-line bg-transparent py-4 text-lg outline-none transition focus:border-foreground"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center gap-3 rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-[0.16em] text-paper transition hover:bg-sage disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={16} strokeWidth={1.5} />
        {pending ? "Invio" : "Invia richiesta"}
      </button>
      {state.message ? (
        <p className={state.ok ? "text-sm text-sage" : "text-sm text-red-700"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
