import { redirect } from "next/navigation";
import { requireCreator } from "@/lib/require-creator";
import { db } from "@/lib/store";
import { AppChrome } from "@/components/marketing/AppChrome";
import { StudioClient } from "@/components/admin/StudioClient";

export const dynamic = "force-dynamic";

export default async function EstudioPage() {
  const user = await requireCreator();
  if (!user) redirect("/cuenta");
  const stats = await db.adminStats();

  return (
    <AppChrome>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs uppercase tracking-[0.22em] text-terracotta">Solo estudio</p>
        <h1 className="mt-2 font-display text-5xl">Monitor de Ideia Builders</h1>
        <p className="mt-3 max-w-2xl text-ink/60">
          Visible únicamente para {user.email}. Cuentas, sesiones, pruebas, paneles configurados y pagos, más un chat
          con datos en vivo.
        </p>
        <div className="mt-10">
          <StudioClient initial={stats} />
        </div>
      </main>
    </AppChrome>
  );
}
