import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/store";
import { hashSecret, signValue, verifySecret } from "@/lib/crypto";
import type { Profile, Site } from "@/lib/models";

const USER_COOKIE = "vh_session";
const panelCookie = (slug: string) => `panel_${slug}`;

function cookieOk(value: string, expected: string): boolean {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function currentUser(): Promise<Profile | null> {
  const raw = (await cookies()).get(USER_COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig || !cookieOk(sig, signValue(id))) return null;
  return db.getProfile(id);
}

export async function setUserSession(userId: string) {
  (await cookies()).set(USER_COOKIE, `${userId}.${signValue(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearUserSession() {
  (await cookies()).delete(USER_COOKIE);
}

export async function isPanelAuthed(slug: string, site?: Site | null): Promise<boolean> {
  const record = site ?? (await db.getSiteBySlug(slug));
  if (!record) return false;
  const owner = await currentUser();
  if (owner?.id === record.ownerId) return true;
  const current = (await cookies()).get(panelCookie(slug))?.value;
  if (!current) return false;
  return cookieOk(current, signValue(`${slug}:${record.panelPasswordHash}`));
}

export async function setPanelSession(site: Site) {
  (await cookies()).set(panelCookie(site.slug), signValue(`${site.slug}:${site.panelPasswordHash}`), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearPanelSession(slug: string) {
  (await cookies()).delete(panelCookie(slug));
}

export async function loginUser(email: string, password: string): Promise<Profile | null> {
  const profile = await db.getProfileByEmail(email);
  if (!profile || !verifySecret(password, profile.passwordHash)) return null;
  await setUserSession(profile.id);
  return profile;
}

export { hashSecret, verifySecret };
