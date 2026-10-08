import type { Site } from "@/lib/models";
import type { SiteContent } from "@/lib/content-types";
import { db } from "@/lib/store";

export async function snapshotAndApply(site: Site, next: SiteContent): Promise<Site> {
  const now = new Date().toISOString();
  const initial = site.versions.find((item) => item.label === "initial") ?? {
    id: crypto.randomUUID(),
    siteId: site.id,
    label: "initial" as const,
    content: site.initialContent,
    createdAt: site.createdAt,
  };
  const previous = {
    id: crypto.randomUUID(),
    siteId: site.id,
    label: "v2" as const,
    content: site.content,
    createdAt: now,
  };
  const older = site.versions
    .filter((item) => item.label !== "initial")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const versions = [
    initial,
    older ? { ...older, label: "v1" as const } : previous,
    older ? previous : undefined,
  ].filter(Boolean) as Site["versions"];

  const updated: Site = { ...site, content: next, versions };
  await db.updateSite(updated);
  await db.replaceVersions(site.id, versions);
  return updated;
}

export async function restoreVersion(site: Site, label: "initial" | "v1" | "v2"): Promise<Site> {
  const version = site.versions.find((item) => item.label === label);
  if (!version) throw new Error("No hay esa versión guardada.");
  if (label === "initial") {
    const updated: Site = { ...site, content: site.initialContent };
    await db.updateSite(updated);
    return updated;
  }
  return snapshotAndApply(site, version.content);
}
