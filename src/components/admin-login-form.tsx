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
      setMessage("Supabase non e' configurato.");
      setPending(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=/admin`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setPending(false);
    setMessage(error ? "Non sono riuscito a inviare il link." : "Link inviato. Controlla la tua email.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-accent mb-2">Email admin</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
          className="w-full bg-transparent border-b border-pure-white/20 py-3 text-lg text-pure-white outline-none transition-colors focus:border-accent placeholder:text-pure-white/30"
          placeholder="admin@email.com" />
      </div>
      <button type="submit" disabled={pending}
        className="inline-flex items-center gap-3 bg-accent text-pure-black px-6 py-3 text-sm uppercase tracking-[0.16em] font-medium hover:bg-pure-white transition-colors disabled:opacity-60">
        {pending ? "Invio..." : "Ricevi magic link"}
        <ArrowUpRight size={16} strokeWidth={1.5} />
      </button>
      {message ? <p className="text-sm text-pure-white/60">{message}</p> : null}
    </form>
  );
}
