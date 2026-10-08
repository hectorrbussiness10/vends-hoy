import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEYLEN = 64;

export function hashSecret(value: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(value, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifySecret(value: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(value, salt, KEYLEN);
  const prev = Buffer.from(hash, "hex");
  return next.length === prev.length && timingSafeEqual(next, prev);
}

export function randomPassword(length = 10): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "negocio";
}

export function referralCode(): string {
  return randomBytes(4).toString("hex");
}

export function appSecret(): string {
  return process.env.APP_SECRET || "vends-hoy-local-dev-secret";
}

export function signValue(value: string): string {
  return createHash("sha256").update(`${appSecret()}:${value}`).digest("hex");
}

export function todayKey(timeZone = "Europe/Madrid"): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );
}
