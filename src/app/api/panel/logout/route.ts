import { NextResponse } from "next/server";
import { clearPanelSession } from "@/lib/panel-auth";

export async function POST() {
  await clearPanelSession();
  return NextResponse.json({ ok: true });
}
