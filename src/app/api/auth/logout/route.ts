import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth";

async function out() {
  await clearUserSession();
}

export async function POST() {
  await out();
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  await out();
  return NextResponse.redirect(new URL("/", request.url));
}
