import Stripe from "stripe";
import { PRICE_EUR, REFERRAL_DISCOUNT_EUR } from "@/lib/access";

export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function monthlyPriceId(): string | null {
  return process.env.STRIPE_PRICE_ID || null;
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export { PRICE_EUR, REFERRAL_DISCOUNT_EUR };
