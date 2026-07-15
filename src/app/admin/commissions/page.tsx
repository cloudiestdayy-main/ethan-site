import { redirect } from "next/navigation";
import { AdminCommissionManager } from "@/components/admin-commission-manager";
import { AdminShell } from "@/components/admin-shell";
import { getAdminSession, getCommissionRequests } from "@/lib/admin";

export const metadata = {
  title: "Richieste di commissione",
  robots: { index: false, follow: false },
};

export default async function AdminCommissionsPage() {
  const session = await getAdminSession();
  if (session.configured && !session.user) redirect("/admin/login");
  if (!session.allowed) redirect("/admin");

  const commissions = await getCommissionRequests();

  return (
    <AdminShell
      active="commissions"
      title="Richieste di commissione"
      subtitle="I messaggi arrivati dal form contatti del sito."
    >
      <section className="rounded-[20px] bg-paper p-6 md:p-10">
        <AdminCommissionManager
          key={commissions.requests
            .map((request) => `${request.id}:${request.status}`)
            .join("|")}
          requests={commissions.requests}
          loadOk={commissions.ok}
        />
      </section>
    </AdminShell>
  );
}
