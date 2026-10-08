import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/store";
import { generateSiteContent } from "@/lib/generate";
import { hashSecret, randomPassword, referralCode, slugify } from "@/lib/crypto";
import { sanitizeSiteContent } from "@/lib/site-content";
import { isCreatorEmail } from "@/lib/creators";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Cree una cuenta o entre." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    mapsUrl?: string;
    prompt?: string;
    photos?: string[];
    businessName?: string;
  } | null;
  if (!body?.mapsUrl && !body?.prompt && !body?.photos?.length && !body?.businessName) {
    return NextResponse.json({ error: "Pegue Maps, un brief o fotos." }, { status: 400 });
  }

  const owned = await db.listSitesByOwner(user.id);
  if (owned.length >= 8) {
    return NextResponse.json({ error: "Ha alcanzado el límite de webs de esta cuenta." }, { status: 400 });
  }

  let content;
  try {
    content = await generateSiteContent({
      mapsUrl: body.mapsUrl,
      prompt: body.prompt,
      photos: body.photos,
      businessName: body.businessName,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo generar. Revise el enlace o el brief e inténtelo una vez más." }, { status: 500 });
  }
  content = sanitizeSiteContent(content);

  let slug = slugify(content.name);
  if (await db.slugTaken(slug)) slug = `${slug}-${referralCode().slice(0, 4)}`;
  const panelPassword = randomPassword();
  const now = new Date();
  const founder = isCreatorEmail(user.email);
  const trialEndsAt = founder
    ? new Date("2099-12-31T00:00:00.000Z").toISOString()
    : new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const id = crypto.randomUUID();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  content.seo.website = `${appUrl}/s/${slug}`;

  const site = {
    id,
    slug,
    ownerId: user.id,
    sector: content.sector,
    content,
    initialContent: content,
    versions: [
      {
        id: crypto.randomUUID(),
        siteId: id,
        label: "initial" as const,
        content,
        createdAt: now.toISOString(),
      },
    ],
    panelPasswordHash: hashSecret(panelPassword),
    mustChangePassword: true,
    trialEndsAt,
    plan: founder ? ("active" as const) : ("trial" as const),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    referralCode: referralCode(),
    createdAt: now.toISOString(),
  };

  try {
    await db.insertSite(site);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la web.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    slug,
    panelPassword,
    url: `/s/${slug}`,
    panel: `/s/${slug}/panel`,
  });
}
