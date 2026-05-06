import Link from "next/link";
import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <section className="grid w-full gap-12 rounded-[34px] bg-paper p-8 md:p-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.18em] text-muted hover:text-sage"
            >
              Studio Tavole
            </Link>
            <h1 className="mt-14 font-editorial text-7xl leading-none md:text-9xl">
              Accesso studio.
            </h1>
            <p className="mt-8 max-w-md text-lg leading-8 text-muted">
              Area riservata per caricare tavole, pubblicarle e scegliere le
              opere in evidenza.
            </p>
          </div>
          <div className="self-end">
            <AdminLoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
