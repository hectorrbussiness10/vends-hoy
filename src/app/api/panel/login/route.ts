import { NextResponse } from "next/server";
import { panelPassword, setPanelSession } from "@/lib/panel-auth";

export async function POST(request: Request) {
  const password = panelPassword();
  if (!password) {
    return NextResponse.json({ error: "El panel no tiene contraseña configurada." }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || body.password !== password) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  await setPanelSession();
  return NextResponse.json({ ok: true });
}
