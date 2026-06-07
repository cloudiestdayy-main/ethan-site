"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut}
      className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-ink transition hover:border-accent hover:text-accent">
      <LogOut size={14} strokeWidth={1.5} />
      Esci
    </button>
  );
}
