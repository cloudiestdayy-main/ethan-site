import { redirect } from "next/navigation";
import { AdminContentEditor } from "@/components/admin-content-editor";
import { AdminShell } from "@/components/admin-shell";
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
    <AdminShell
      active="content"
      title="Contenuti sito"
      subtitle="Modifica testi e immagini del sito: l'anteprima si aggiorna mentre scrivi, il sito pubblico cambia solo dopo il salvataggio."
    >
      <div className="rounded-[20px] bg-paper p-6 md:p-8">
        <AdminContentEditor
          key={SITE_SETTING_KEYS.map((settingKey) => settings[settingKey]).join(
            "",
          )}
          settings={settings}
        />
      </div>
    </AdminShell>
  );
}
