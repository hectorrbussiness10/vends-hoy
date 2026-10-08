import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const client = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!client || !secret) return NextResponse.json({ received: true });

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Sin firma." }, { status: 400 });

  let event;
  try {
    event = client.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Firma no válida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { siteId?: string; userId?: string }; customer?: string; subscription?: string };
    const siteId = session.metadata?.siteId;
    if (siteId) {
      const site = await db.getSite(siteId);
      if (site) {
        await db.updateSite({
          ...site,
          plan: "active",
          stripeCustomerId: (session.customer as string) || site.stripeCustomerId,
          stripeSubscriptionId: (session.subscription as string) || site.stripeSubscriptionId,
        });
        if (session.metadata?.userId) await db.markRewardsReady(session.metadata.userId, site.id);
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as { id: string };
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const remote = createClient(url, key, { auth: { persistSession: false } });
      const { data } = await remote.from("sites").select("*").eq("stripe_subscription_id", sub.id).maybeSingle();
      if (data) {
        const site = await db.getSite(data.id);
        if (site) await db.updateSite({ ...site, plan: "canceled" });
      }
    }
  }

  return NextResponse.json({ received: true });
}
