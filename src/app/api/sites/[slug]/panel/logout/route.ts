import { NextResponse } from "next/server";
import { clearPanelSession } from "@/lib/auth";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await clearPanelSession(slug);
  return NextResponse.json({ ok: true });
}
