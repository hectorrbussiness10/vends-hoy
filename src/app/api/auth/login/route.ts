import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const user = await loginUser(body?.email || "", body?.password || "");
  if (!user) return NextResponse.json({ error: "Email o contraseña incorrectos." }, { status: 401 });
  return NextResponse.json({ ok: true });
}
