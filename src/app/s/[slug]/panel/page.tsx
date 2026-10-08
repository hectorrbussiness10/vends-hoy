import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/store";
import { isPanelAuthed } from "@/lib/auth";
import { currentUser } from "@/lib/auth";
import { PanelLogin } from "@/components/panel/PanelLogin";
import { TenantPanel } from "@/components/panel/TenantPanel";
import { PROMPTS_PER_DAY } from "@/lib/access";
import { todayKey } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  return { title: site ? `Panel · ${site.content.name}` : "Panel", robots: { index: false, follow: false } };
}

export default async function PanelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site) notFound();

  const authed = await isPanelAuthed(slug, site);
  const owner = await currentUser();
  const ownerOverride = owner?.id === site.ownerId;

  if (!authed && !ownerOverride) {
    return <PanelLogin businessName={site.content.name} slug={slug} />;
  }

  const bookings = await db.listBookings(site.id);
  const used = await db.countPromptsToday(site.id, todayKey());
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <TenantPanel
      slug={slug}
      initial={site.content}
      bookings={bookings}
      mustChangePassword={site.mustChangePassword && !ownerOverride}
      remainingPrompts={Math.max(0, PROMPTS_PER_DAY - used)}
      versions={site.versions.map((item) => item.label)}
      plan={site.plan}
      trialEndsAt={site.trialEndsAt}
      inviteUrl={`${appUrl}/i/${(await db.getProfile(site.ownerId))?.referralCode ?? site.referralCode}`}
    />
  );
}
