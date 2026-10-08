import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { hashSecret, isPanelAuthed, setPanelSession } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site || !(await isPanelAuthed(slug, site))) {
    return NextResponse.json({ error: "Entre en el panel." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || body.password.length < 8) {
    return NextResponse.json({ error: "La nueva contraseña necesita 8 caracteres." }, { status: 400 });
  }
  const updated = { ...site, panelPasswordHash: hashSecret(body.password), mustChangePassword: false };
  await db.updateSite(updated);
  await setPanelSession(updated);
  return NextResponse.json({ ok: true });
}
