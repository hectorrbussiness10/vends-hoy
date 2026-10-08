import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessSite } from "@/components/site/BusinessSite";
import { db } from "@/lib/store";
import { siteLive } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site) return { title: "Web no encontrada" };
  return {
    title: site.content.seo.title,
    description: site.content.seo.description,
  };
}

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.getSiteBySlug(slug);
  if (!site) notFound();
  return <BusinessSite content={site.content} slug={slug} paused={!siteLive(site)} />;
}
