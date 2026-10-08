import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "panel_session";

export function panelPassword(): string {
  return process.env.PANEL_PASSWORD || "";
}

function sessionValue(password: string): string {
  return createHmac("sha256", password).update("panel-session-v1").digest("hex");
}

export async function isPanelAuthed(): Promise<boolean> {
  const password = panelPassword();
  if (!password) return false;
  const current = (await cookies()).get(COOKIE)?.value;
  if (!current) return false;
  const expected = sessionValue(password);
  const left = Buffer.from(current);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function setPanelSession() {
  const password = panelPassword();
  (await cookies()).set(COOKIE, sessionValue(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearPanelSession() {
  (await cookies()).delete(COOKIE);
}
