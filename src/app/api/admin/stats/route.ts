import { NextResponse } from "next/server";
import { requireCreator } from "@/lib/require-creator";
import { db } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireCreator();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  return NextResponse.json(await db.adminStats());
}
