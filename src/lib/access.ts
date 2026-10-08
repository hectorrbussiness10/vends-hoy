import type { Site } from "@/lib/models";
import { isCreatorEmail } from "@/lib/creators";

export function trialOpen(site: Site): boolean {
  return new Date(site.trialEndsAt).getTime() > Date.now();
}

export function siteLive(site: Site, ownerEmail?: string | null): boolean {
  if (isCreatorEmail(ownerEmail)) return true;
  return site.plan === "active" || trialOpen(site);
}

export function canEdit(site: Site, ownerEmail?: string | null): boolean {
  return siteLive(site, ownerEmail);
}

export function trialHoursLeft(site: Site): number {
  return Math.max(0, Math.round((new Date(site.trialEndsAt).getTime() - Date.now()) / 36e5));
}

export const PRICE_EUR = 150;
export const REFERRAL_DISCOUNT_EUR = 50;
export const PROMPTS_PER_DAY = 5;
