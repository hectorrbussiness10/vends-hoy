import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { hashSecret, referralCode } from "@/lib/crypto";
import { setUserSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    name?: string;
    invite?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() || "";
  const password = body?.password || "";
  if (!email.includes("@") || password.length < 8) {
    return NextResponse.json({ error: "Email válido y contraseña de 8 caracteres." }, { status: 400 });
  }
  if (await db.getProfileByEmail(email)) {
    return NextResponse.json({ error: "Ese email ya tiene cuenta." }, { status: 409 });
  }
  const inviter = body?.invite ? await db.getProfileByReferral(body.invite) : null;
  const profile = {
    id: crypto.randomUUID(),
    email,
    name: body?.name?.trim() || email.split("@")[0],
    passwordHash: hashSecret(password),
    referralCode: referralCode(),
    referredBy: inviter?.id ?? null,
    createdAt: new Date().toISOString(),
  };
  await db.insertProfile(profile);
  if (inviter) {
    await db.insertReward({
      id: crypto.randomUUID(),
      inviterId: inviter.id,
      invitedId: profile.id,
      invitedSiteId: null,
      amountCents: 5000,
      status: "pending",
      applyOn: null,
      appliedAt: null,
      createdAt: new Date().toISOString(),
    });
  }
  await setUserSession(profile.id);
  await db.recordLogin(profile);
  return NextResponse.json({ ok: true, referralCode: profile.referralCode });
}
