"use client";

import { useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("signInWithPassword failed:", error.message);
      setMessage(
        error.message === "Invalid login credentials"
          ? "Email o password non corretti."
          : `Accesso non riuscito: ${error.message}`,
      );
      setPending(false);
      return;
    }

    // Navigazione completa (non client-side): il server deve rileggere i
    // cookie di sessione appena scritti per aprire l'admin.
    window.location.assign("/admin");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-accent mb-2">Email admin</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email"
          className="w-full bg-transparent border-b border-ink/10 py-3 text-lg text-ink outline-none transition-colors focus:border-accent placeholder:text-ink/20"
          placeholder="admin@email.com" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-accent mb-2">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password"
          className="w-full bg-transparent border-b border-ink/10 py-3 text-lg text-ink outline-none transition-colors focus:border-accent placeholder:text-ink/20"
          placeholder="••••••••" />
      </div>
      <button type="submit" disabled={pending}
        className="inline-flex items-center gap-3 bg-ink text-pure-white px-6 py-3 text-sm uppercase tracking-[0.16em] font-medium hover:bg-accent transition-colors disabled:opacity-60">
        {pending ? (
          <>
            Accedo...
            <LoaderCircle size={16} strokeWidth={1.5} className="animate-spin" />
          </>
        ) : (
          <>
            Accedi
            <ArrowUpRight size={16} strokeWidth={1.5} />
          </>
        )}
      </button>
      {message ? <p className="text-sm text-red-400">{message}</p> : null}
    </form>
  );
}
