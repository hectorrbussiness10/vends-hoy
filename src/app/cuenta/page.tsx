import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/store";
import { siteLive, trialHoursLeft } from "@/lib/access";
import { AccountClient, SubscribeButton } from "@/components/account/AccountClient";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const user = await currentUser();
  if (!user) redirect("/entrar");
  const sites = await db.listSitesByOwner(user.id);
  const rewards = await db.listRewards(user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <main className="min-h-screen bg-[#07080c] px-4 py-20 text-cream">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">Cuenta</p>
            <h1 className="mt-2 font-display text-5xl">{user.name || user.email}</h1>
          </div>
          <Link href="/crear" className="rounded-full bg-cream px-5 py-2 text-sm font-semibold text-night">
            Nueva web
          </Link>
        </div>
        <AccountClient inviteUrl={`${appUrl}/i/${user.referralCode}`} rewards={rewards.length} />
        <div className="mt-10 space-y-4">
          {sites.length === 0 && <p className="text-cream/60">Aún no ha publicado ninguna web.</p>}
          {sites.map((site) => (
            <article key={site.id} className="rounded-[28px] border border-white/10 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl">{site.content.name}</h2>
                  <p className="text-sm text-cream/60">
                    {siteLive(site)
                      ? site.plan === "active"
                        ? "Suscripción activa"
                        : `Prueba · ${trialHoursLeft(site)} h`
                      : "En pausa"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/s/${site.slug}`} className="rounded-full bg-white/10 px-4 py-2 text-sm">
                    Ver web
                  </Link>
                  <Link href={`/s/${site.slug}/panel`} className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold">
                    Panel
                  </Link>
                  {site.plan !== "active" && <SubscribeButton slug={site.slug} />}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
