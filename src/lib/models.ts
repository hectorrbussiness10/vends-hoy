import type { SiteContent } from "@/lib/content-types";

export type Plan = "trial" | "active" | "canceled" | "past_due";

export type Profile = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  referralCode: string;
  referredBy: string | null;
  createdAt: string;
};

export type SiteVersion = {
  id: string;
  siteId: string;
  label: "initial" | "v1" | "v2";
  content: SiteContent;
  createdAt: string;
};

export type Site = {
  id: string;
  slug: string;
  ownerId: string;
  sector: SiteContent["sector"];
  content: SiteContent;
  initialContent: SiteContent;
  versions: SiteVersion[];
  panelPasswordHash: string;
  mustChangePassword: boolean;
  trialEndsAt: string;
  plan: Plan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  referralCode: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  siteId: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  status: string;
  createdAt: string;
};

export type PromptEvent = {
  id: string;
  siteId: string;
  prompt: string;
  summary: string;
  preview: SiteContent | null;
  applied: boolean;
  createdAt: string;
};

export type ReferralReward = {
  id: string;
  inviterId: string;
  invitedId: string;
  invitedSiteId: string | null;
  amountCents: number;
  status: "pending" | "ready" | "applied" | "expired";
  applyOn: string | null;
  appliedAt: string | null;
  createdAt: string;
};

export type LoginEvent = {
  id: string;
  profileId: string;
  email: string;
  createdAt: string;
};

export type StoreData = {
  profiles: Profile[];
  sites: Site[];
  bookings: Booking[];
  promptEvents: PromptEvent[];
  rewards: ReferralReward[];
  loginEvents: LoginEvent[];
};

export const emptyStore = (): StoreData => ({
  profiles: [],
  sites: [],
  bookings: [],
  promptEvents: [],
  rewards: [],
  loginEvents: [],
});
