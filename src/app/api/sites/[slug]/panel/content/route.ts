import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { isPanelAuthed } from "@/lib/auth";
import { canEdit } from "@/lib/access";
import { sanitizeSiteContent } from "@/lib/site-content";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site || !(await isPanelAuthed(slug, site))) {
    return NextResponse.json({ error: "Entre en el panel." }, { status: 401 });
  }
  const bookings = await db.listBookings(site.id);
  return NextResponse.json({ content: site.content, bookings, plan: site.plan, trialEndsAt: site.trialEndsAt });
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site || !(await isPanelAuthed(slug, site))) {
    return NextResponse.json({ error: "Entre en el panel." }, { status: 401 });
  }
  if (!canEdit(site)) {
    return NextResponse.json({ error: "La prueba ha terminado. Suscríbase para seguir editando." }, { status: 402 });
  }
  const body = await request.json();
  const content = sanitizeSiteContent(body, site.content);
  await db.updateSite({ ...site, content, sector: content.sector });
  revalidatePath(`/s/${slug}`);
  revalidatePath(`/s/${slug}/panel`);
  return NextResponse.json(content);
}
