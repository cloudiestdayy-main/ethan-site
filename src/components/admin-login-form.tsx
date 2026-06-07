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

    if (error) {
      console.error("signInWithOtp failed:", error.message);
      setMessage(`Invio non riuscito: ${error.message}`);
      return;
    }

    setMessage("Link inviato. Controlla la tua email.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-accent mb-2">Email admin</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
          className="w-full bg-transparent border-b border-ink/10 py-3 text-lg text-ink outline-none transition-colors focus:border-accent placeholder:text-ink/20"
          placeholder="admin@email.com" />
      </div>
      <button type="submit" disabled={pending}
        className="inline-flex items-center gap-3 bg-ink text-pure-white px-6 py-3 text-sm uppercase tracking-[0.16em] font-medium hover:bg-accent transition-colors disabled:opacity-60">
        {pending ? "Invio..." : "Ricevi magic link"}
        <ArrowUpRight size={16} strokeWidth={1.5} />
      </button>
      {message ? <p className="text-sm text-ink/40">{message}</p> : null}
    </form>
  );
}
