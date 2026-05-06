"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Supabase non e configurato.");
      setPending(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=/admin`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setPending(false);
    setMessage(
      error
        ? "Non sono riuscito a inviare il link."
        : "Link inviato. Controlla la tua email.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="block">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">
          Email admin
        </span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          className="mt-3 w-full border-b border-line bg-transparent py-4 text-lg outline-none transition focus:border-foreground"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center gap-3 rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-[0.16em] text-paper transition hover:bg-sage disabled:opacity-60"
      >
        {pending ? "Invio" : "Ricevi magic link"}
        <ArrowUpRight size={16} strokeWidth={1.5} />
      </button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </form>
  );
}
