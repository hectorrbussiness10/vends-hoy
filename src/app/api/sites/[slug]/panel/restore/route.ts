import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { isPanelAuthed } from "@/lib/auth";
import { canEdit } from "@/lib/access";
import { restoreVersion } from "@/lib/versions";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site || !(await isPanelAuthed(slug, site))) {
    return NextResponse.json({ error: "Entre en el panel." }, { status: 401 });
  }
  if (!canEdit(site)) {
    return NextResponse.json({ error: "Suscríbase para restaurar versiones." }, { status: 402 });
  }
  const body = (await request.json().catch(() => null)) as { label?: "initial" | "v1" | "v2" } | null;
  if (!body?.label) return NextResponse.json({ error: "Indique la versión." }, { status: 400 });
  try {
    const updated = await restoreVersion(site, body.label);
    revalidatePath(`/s/${slug}`);
    return NextResponse.json({ content: updated.content });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo restaurar." }, { status: 400 });
  }
}
