import { NextResponse } from "next/server";
import { isDemoPanel } from "@/lib/demo-panel";
import { isPanelAuthed } from "@/lib/panel-auth";
import { uploadSiteImage } from "@/lib/site-content";

export async function POST(request: Request) {
  if (isDemoPanel()) {
    return NextResponse.json(
      { error: "Esta vista es de prueba. No se suben fotos." },
      { status: 403 },
    );
  }
  if (!(await isPanelAuthed())) {
    return NextResponse.json({ error: "Entra en el panel." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Elige una foto." }, { status: 400 });
  }
  if (file.size > 4_000_000) {
    return NextResponse.json({ error: "La foto pesa más de 4 MB." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo tiene que ser una imagen." }, { status: 400 });
  }

  try {
    const url = await uploadSiteImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir la foto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
