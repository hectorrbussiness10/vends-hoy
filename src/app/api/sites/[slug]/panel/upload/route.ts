import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { isPanelAuthed } from "@/lib/auth";
import { saveImage } from "@/lib/upload";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site || !(await isPanelAuthed(slug, site))) {
    return NextResponse.json({ error: "Entre en el panel." }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Elija una foto." }, { status: 400 });
  }
  if (file.size > 4_000_000) return NextResponse.json({ error: "La foto pesa más de 4 MB." }, { status: 400 });
  try {
    return NextResponse.json({ url: await saveImage(file) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo subir." }, { status: 500 });
  }
}
