import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isDemoPanel } from "@/lib/demo-panel";
import { isPanelAuthed } from "@/lib/panel-auth";
import { getSiteContent, saveSiteContent } from "@/lib/site-content";

export async function GET() {
  if (!(await isPanelAuthed())) {
    return NextResponse.json({ error: "Entra en el panel." }, { status: 401 });
  }
  return NextResponse.json(await getSiteContent());
}

export async function PUT(request: Request) {
  if (isDemoPanel()) {
    return NextResponse.json(
      { error: "Esta vista es de prueba. No se guarda ningún cambio." },
      { status: 403 },
    );
  }
  if (!(await isPanelAuthed())) {
    return NextResponse.json({ error: "Entra en el panel." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const content = await saveSiteContent(body);
    revalidatePath("/");
    revalidatePath("/panel");
    return NextResponse.json(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
