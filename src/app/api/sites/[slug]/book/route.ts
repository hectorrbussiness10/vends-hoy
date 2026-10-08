import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { siteLive } from "@/lib/access";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site) return NextResponse.json({ error: "Web no encontrada." }, { status: 404 });
  const owner = await db.getProfile(site.ownerId);
  if (!siteLive(site, owner?.email)) return NextResponse.json({ error: "Esta web está en pausa." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as Record<string, string> | null;
  const name = body?.nombre?.trim();
  if (!name) return NextResponse.json({ error: "Indique un nombre." }, { status: 400 });
  await db.insertBooking({
    id: crypto.randomUUID(),
    siteId: site.id,
    name,
    phone: body?.telefono || "",
    email: body?.email || "",
    service: body?.servicio || "",
    date: body?.fecha || "",
    time: body?.hora || "",
    notes: body?.notas || "",
    status: "nueva",
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
