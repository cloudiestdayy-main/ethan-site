import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminContentEditor } from "@/components/admin-content-editor";
import { getAdminSession } from "@/lib/admin";
import { getSiteSettings } from "@/lib/settings";
import { SITE_SETTING_KEYS } from "@/lib/settings-shared";

export const metadata = {
  title: "Contenuti sito",
  robots: { index: false, follow: false },
};

export default async function AdminContentPage() {
  const session = await getAdminSession();
  if (session.configured && !session.user) redirect("/admin/login");
  if (!session.allowed) redirect("/admin");

  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-ink px-5 py-8 md:px-10">
      <div className="mx-auto max-w-[1700px]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-pure-white/10 pb-8">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-pure-white/50 transition-colors hover:text-accent"
            >
              <ArrowLeft size={13} strokeWidth={1.7} />
              Torna all&apos;admin
            </Link>
            <h1 className="mt-5 font-display text-4xl font-bold uppercase text-pure-white md:text-6xl">
              Contenuti sito
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-pure-white/50">
              Modifica testi e immagini del sito: l&apos;anteprima a destra si
              aggiorna mentre scrivi, il sito pubblico cambia solo dopo il
              salvataggio.
            </p>
          </div>
        </header>

        <div className="mt-10 rounded-[20px] bg-paper p-6 md:p-8">
          <AdminContentEditor
            key={SITE_SETTING_KEYS.map((settingKey) => settings[settingKey]).join(
              "",
            )}
            settings={settings}
          />
        </div>
      </div>
    </main>
  );
}
