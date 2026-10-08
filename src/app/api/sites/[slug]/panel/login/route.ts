import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { setPanelSession, verifySecret } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site) return NextResponse.json({ error: "Web no encontrada." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || !verifySecret(body.password, site.panelPasswordHash)) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }
  await setPanelSession(site);
  return NextResponse.json({ ok: true, mustChangePassword: site.mustChangePassword });
}
