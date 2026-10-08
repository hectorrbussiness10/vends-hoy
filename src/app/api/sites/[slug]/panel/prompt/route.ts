import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { isPanelAuthed } from "@/lib/auth";
import { canEdit, PROMPTS_PER_DAY } from "@/lib/access";
import { previewPromptEdit } from "@/lib/generate";
import { snapshotAndApply } from "@/lib/versions";
import { todayKey } from "@/lib/crypto";
import { sanitizeSiteContent } from "@/lib/site-content";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site || !(await isPanelAuthed(slug, site))) {
    return NextResponse.json({ error: "Entre en el panel." }, { status: 401 });
  }
  if (!canEdit(site)) {
    return NextResponse.json({ error: "La prueba o la suscripción no están activas." }, { status: 402 });
  }
  const used = await db.countPromptsToday(site.id, todayKey());
  if (used >= PROMPTS_PER_DAY) {
    return NextResponse.json({ error: "Hoy ya ha usado las 5 ediciones por escrito." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { prompt?: string } | null;
  const prompt = body?.prompt?.trim();
  if (!prompt) return NextResponse.json({ error: "Escriba el cambio que desea." }, { status: 400 });

  const { summary, next } = await previewPromptEdit(site.content, prompt);
  const event = {
    id: crypto.randomUUID(),
    siteId: site.id,
    prompt,
    summary,
    preview: next,
    applied: false,
    createdAt: new Date().toISOString(),
  };
  await db.insertPrompt(event);
  return NextResponse.json({
    id: event.id,
    summary,
    preview: next,
    remaining: PROMPTS_PER_DAY - used - 1,
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site || !(await isPanelAuthed(slug, site))) {
    return NextResponse.json({ error: "Entre en el panel." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { id?: string; preview?: unknown } | null;
  if (!body?.id || !body.preview) {
    return NextResponse.json({ error: "Confirme el cambio propuesto." }, { status: 400 });
  }
  const next = sanitizeSiteContent(body.preview, site.content);
  await snapshotAndApply(site, next);
  await db.markPromptApplied(body.id);
  return NextResponse.json({ ok: true, content: next });
}
