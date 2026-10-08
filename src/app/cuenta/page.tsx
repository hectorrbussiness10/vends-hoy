import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/store";
import { siteLive, trialHoursLeft } from "@/lib/access";
import { isCreatorEmail } from "@/lib/creators";
import { AccountClient, SubscribeButton } from "@/components/account/AccountClient";
import { AppChrome } from "@/components/marketing/AppChrome";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const user = await currentUser();
  if (!user) redirect("/entrar");
  const sites = await db.listSitesByOwner(user.id);
  const rewards = await db.listRewards(user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const founder = isCreatorEmail(user.email);

  return (
    <AppChrome>
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-terracotta">Cuenta</p>
            <h1 className="mt-2 font-display text-5xl">{user.name || user.email}</h1>
            {founder && (
              <p className="mt-2 text-sm text-ink/60">Cuenta de estudio: acceso completo, sin cobro ni límite de prueba.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/crear" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper">
              Nueva web
            </Link>
            <a href="/api/auth/logout" className="rounded-full px-5 py-2 text-sm text-ink/60">
              Salir
            </a>
          </div>
        </div>
        <AccountClient inviteUrl={`${appUrl}/i/${user.referralCode}`} rewards={rewards.filter((item) => item.status === "ready").length} />
        <div className="mt-10 space-y-4">
          {sites.length === 0 && <p className="text-ink/55">Aún no ha publicado ninguna web. La prueba de un día empieza al crearla.</p>}
          {sites.map((site) => {
            const live = siteLive(site, user.email);
            return (
              <article key={site.id} className="rounded-[28px] border border-ink/[0.08] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl">{site.content.name}</h2>
                    <p className="text-sm text-ink/55">
                      {founder
                        ? "Estudio · acceso libre"
                        : live
                          ? site.plan === "active"
                            ? "Suscripción activa"
                            : `Prueba · ${trialHoursLeft(site)} h`
                          : "En pausa · suscríbase para reabrirla"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/s/${site.slug}`} className="rounded-full bg-paper px-4 py-2 text-sm">
                      Ver web
                    </Link>
                    <Link href={`/s/${site.slug}/panel`} className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white">
                      Panel
                    </Link>
                    {!founder && site.plan !== "active" && <SubscribeButton slug={site.slug} />}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </AppChrome>
  );
}
