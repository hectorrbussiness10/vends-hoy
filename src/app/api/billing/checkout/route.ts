import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/store";
import { appUrl, monthlyPriceId, stripe } from "@/lib/stripe";
import { PRICE_EUR, REFERRAL_DISCOUNT_EUR } from "@/lib/access";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Entre en su cuenta." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { slug?: string } | null;
  const site = body?.slug ? await db.getSiteBySlug(body.slug) : (await db.listSitesByOwner(user.id))[0];
  if (!site || site.ownerId !== user.id) {
    return NextResponse.json({ error: "Web no encontrada." }, { status: 404 });
  }

  const client = stripe();
  const priceId = monthlyPriceId();
  if (!client || !priceId) {
    const updated = { ...site, plan: "active" as const };
    await db.updateSite(updated);
    await db.markRewardsReady(user.id, site.id);
    return NextResponse.json({
      url: `${appUrl()}/cuenta?pagado=1`,
      demo: true,
      message: "Stripe no está configurado. En local se marca la web como activa para que pueda probar el flujo.",
    });
  }

  const rewards = await db.listRewards(user.id);
  const ready = rewards.filter((item) => item.status === "ready");
  const discount = Math.min(PRICE_EUR, ready.length * REFERRAL_DISCOUNT_EUR);

  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer: site.stripeCustomerId || undefined,
    customer_email: site.stripeCustomerId ? undefined : user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl()}/cuenta?pagado=1`,
    cancel_url: `${appUrl()}/cuenta`,
    metadata: { siteId: site.id, userId: user.id },
    subscription_data: {
      metadata: { siteId: site.id, userId: user.id },
      ...(discount
        ? {
            trial_settings: undefined,
          }
        : {}),
    },
    allow_promotion_codes: true,
    discounts: discount
      ? undefined
      : undefined,
  });

  if (!session.url) return NextResponse.json({ error: "Stripe no devolvió una URL." }, { status: 500 });
  return NextResponse.json({ url: session.url, discount });
}
