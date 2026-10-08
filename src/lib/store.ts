import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { emptyStore, type Booking, type LoginEvent, type Profile, type PromptEvent, type ReferralReward, type Site, type StoreData } from "@/lib/models";
import { isCreatorEmail } from "@/lib/creators";
import { sanitizeSiteContent } from "@/lib/site-content";

const FILE = path.join(process.cwd(), "data", "vends-hoy.json");

function supabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

let writeQueue: Promise<void> = Promise.resolve();

async function readLocal(): Promise<StoreData> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreData;
    return {
      profiles: parsed.profiles ?? [],
      sites: parsed.sites ?? [],
      bookings: parsed.bookings ?? [],
      promptEvents: parsed.promptEvents ?? [],
      rewards: parsed.rewards ?? [],
      loginEvents: parsed.loginEvents ?? [],
    };
  } catch {
    return emptyStore();
  }
}

async function writeLocal(data: StoreData) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(data, null, 2), "utf8");
}

function mutateLocal(fn: (data: StoreData) => void | StoreData | Promise<void | StoreData>) {
  writeQueue = writeQueue.then(async () => {
    const data = await readLocal();
    const next = (await fn(data)) ?? data;
    await writeLocal(next);
  });
  return writeQueue;
}

function rowToSite(row: Record<string, unknown>, versions: Site["versions"] = []): Site {
  return {
    id: String(row.id),
    slug: String(row.slug),
    ownerId: String(row.owner_id),
    sector: row.sector as Site["sector"],
    content: sanitizeSiteContent(row.content),
    initialContent: sanitizeSiteContent(row.initial_content),
    versions,
    panelPasswordHash: String(row.panel_password_hash),
    mustChangePassword: Boolean(row.must_change_password),
    trialEndsAt: String(row.trial_ends_at),
    plan: row.plan as Site["plan"],
    stripeCustomerId: (row.stripe_customer_id as string) || null,
    stripeSubscriptionId: (row.stripe_subscription_id as string) || null,
    referralCode: String(row.referral_code),
    createdAt: String(row.created_at),
  };
}

async function loadSiteVersions(db: SupabaseClient, siteId: string): Promise<Site["versions"]> {
  const { data } = await db
    .from("site_versions")
    .select("*")
    .eq("site_id", siteId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((row) => ({
    id: row.id,
    siteId: row.site_id,
    label: row.label,
    content: sanitizeSiteContent(row.content),
    createdAt: row.created_at,
  }));
}

export const db = {
  async getProfileByEmail(email: string): Promise<Profile | null> {
    const normalized = email.trim().toLowerCase();
    const remote = supabase();
    if (remote) {
      const { data } = await remote.from("profiles").select("*").eq("email", normalized).maybeSingle();
      if (!data) return null;
      return {
        id: data.id,
        email: data.email,
        name: data.name ?? "",
        passwordHash: data.password_hash,
        referralCode: data.referral_code,
        referredBy: data.referred_by,
        createdAt: data.created_at,
      };
    }
    const local = await readLocal();
    return local.profiles.find((item) => item.email === normalized) ?? null;
  },

  async getProfile(id: string): Promise<Profile | null> {
    const remote = supabase();
    if (remote) {
      const { data } = await remote.from("profiles").select("*").eq("id", id).maybeSingle();
      if (!data) return null;
      return {
        id: data.id,
        email: data.email,
        name: data.name ?? "",
        passwordHash: data.password_hash,
        referralCode: data.referral_code,
        referredBy: data.referred_by,
        createdAt: data.created_at,
      };
    }
    const local = await readLocal();
    return local.profiles.find((item) => item.id === id) ?? null;
  },

  async getProfileByReferral(code: string): Promise<Profile | null> {
    const remote = supabase();
    if (remote) {
      const { data } = await remote.from("profiles").select("*").eq("referral_code", code).maybeSingle();
      if (!data) return null;
      return {
        id: data.id,
        email: data.email,
        name: data.name ?? "",
        passwordHash: data.password_hash,
        referralCode: data.referral_code,
        referredBy: data.referred_by,
        createdAt: data.created_at,
      };
    }
    const local = await readLocal();
    return local.profiles.find((item) => item.referralCode === code) ?? null;
  },

  async insertProfile(profile: Profile) {
    const remote = supabase();
    if (remote) {
      const { error } = await remote.from("profiles").insert({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        password_hash: profile.passwordHash,
        referral_code: profile.referralCode,
        referred_by: profile.referredBy,
        created_at: profile.createdAt,
      });
      if (error) throw new Error(error.message);
      return;
    }
    await mutateLocal((data) => {
      data.profiles.push(profile);
    });
  },

  async getSiteBySlug(slug: string): Promise<Site | null> {
    const remote = supabase();
    if (remote) {
      const { data } = await remote.from("sites").select("*").eq("slug", slug).maybeSingle();
      if (!data) return null;
      return rowToSite(data, await loadSiteVersions(remote, data.id));
    }
    const local = await readLocal();
    return local.sites.find((item) => item.slug === slug) ?? null;
  },

  async getSite(id: string): Promise<Site | null> {
    const remote = supabase();
    if (remote) {
      const { data } = await remote.from("sites").select("*").eq("id", id).maybeSingle();
      if (!data) return null;
      return rowToSite(data, await loadSiteVersions(remote, data.id));
    }
    const local = await readLocal();
    return local.sites.find((item) => item.id === id) ?? null;
  },

  async listSitesByOwner(ownerId: string): Promise<Site[]> {
    const remote = supabase();
    if (remote) {
      const { data } = await remote.from("sites").select("*").eq("owner_id", ownerId).order("created_at", { ascending: false });
      const rows = data ?? [];
      return Promise.all(rows.map(async (row) => rowToSite(row, await loadSiteVersions(remote, row.id))));
    }
    const local = await readLocal();
    return local.sites.filter((item) => item.ownerId === ownerId);
  },

  async slugTaken(slug: string): Promise<boolean> {
    return Boolean(await this.getSiteBySlug(slug));
  },

  async insertSite(site: Site) {
    const remote = supabase();
    if (remote) {
      const { error } = await remote.from("sites").insert({
        id: site.id,
        slug: site.slug,
        owner_id: site.ownerId,
        sector: site.sector,
        content: site.content,
        initial_content: site.initialContent,
        panel_password_hash: site.panelPasswordHash,
        must_change_password: site.mustChangePassword,
        trial_ends_at: site.trialEndsAt,
        plan: site.plan,
        stripe_customer_id: site.stripeCustomerId,
        stripe_subscription_id: site.stripeSubscriptionId,
        referral_code: site.referralCode,
        created_at: site.createdAt,
      });
      if (error) throw new Error(error.message);
      const initial = site.versions.find((item) => item.label === "initial") ?? {
        id: crypto.randomUUID(),
        siteId: site.id,
        label: "initial" as const,
        content: site.initialContent,
        createdAt: site.createdAt,
      };
      await remote.from("site_versions").insert({
        id: initial.id,
        site_id: site.id,
        label: initial.label,
        content: initial.content,
        created_at: initial.createdAt,
      });
      return;
    }
    await mutateLocal((data) => {
      data.sites.push(site);
    });
  },

  async updateSite(site: Site) {
    const remote = supabase();
    if (remote) {
      const { error } = await remote
        .from("sites")
        .update({
          content: site.content,
          panel_password_hash: site.panelPasswordHash,
          must_change_password: site.mustChangePassword,
          plan: site.plan,
          stripe_customer_id: site.stripeCustomerId,
          stripe_subscription_id: site.stripeSubscriptionId,
          sector: site.sector,
        })
        .eq("id", site.id);
      if (error) throw new Error(error.message);
      return;
    }
    await mutateLocal((data) => {
      const index = data.sites.findIndex((item) => item.id === site.id);
      if (index >= 0) data.sites[index] = site;
    });
  },

  async replaceVersions(siteId: string, versions: Site["versions"]) {
    const remote = supabase();
    if (remote) {
      await remote.from("site_versions").delete().eq("site_id", siteId);
      if (versions.length) {
        const { error } = await remote.from("site_versions").insert(
          versions.map((item) => ({
            id: item.id,
            site_id: siteId,
            label: item.label,
            content: item.content,
            created_at: item.createdAt,
          })),
        );
        if (error) throw new Error(error.message);
      }
      return;
    }
    await mutateLocal((data) => {
      const site = data.sites.find((item) => item.id === siteId);
      if (site) site.versions = versions;
    });
  },

  async insertBooking(booking: Booking) {
    const remote = supabase();
    if (remote) {
      const { error } = await remote.from("bookings").insert({
        id: booking.id,
        site_id: booking.siteId,
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        notes: booking.notes,
        status: booking.status,
        created_at: booking.createdAt,
      });
      if (error) throw new Error(error.message);
      return;
    }
    await mutateLocal((data) => {
      data.bookings.unshift(booking);
    });
  },

  async listBookings(siteId: string): Promise<Booking[]> {
    const remote = supabase();
    if (remote) {
      const { data } = await remote.from("bookings").select("*").eq("site_id", siteId).order("created_at", { ascending: false });
      return (data ?? []).map((row) => ({
        id: row.id,
        siteId: row.site_id,
        name: row.name,
        phone: row.phone ?? "",
        email: row.email ?? "",
        service: row.service ?? "",
        date: row.date ?? "",
        time: row.time ?? "",
        notes: row.notes ?? "",
        status: row.status,
        createdAt: row.created_at,
      }));
    }
    const local = await readLocal();
    return local.bookings.filter((item) => item.siteId === siteId);
  },

  async insertPrompt(event: PromptEvent) {
    const remote = supabase();
    if (remote) {
      const { error } = await remote.from("prompt_events").insert({
        id: event.id,
        site_id: event.siteId,
        prompt: event.prompt,
        summary: event.summary,
        preview: event.preview,
        applied: event.applied,
        created_at: event.createdAt,
      });
      if (error) throw new Error(error.message);
      return;
    }
    await mutateLocal((data) => {
      data.promptEvents.push(event);
    });
  },

  async markPromptApplied(id: string) {
    const remote = supabase();
    if (remote) {
      await remote.from("prompt_events").update({ applied: true }).eq("id", id);
      return;
    }
    await mutateLocal((data) => {
      const item = data.promptEvents.find((event) => event.id === id);
      if (item) item.applied = true;
    });
  },

  async countPromptsToday(siteId: string, day: string): Promise<number> {
    const remote = supabase();
    if (remote) {
      const start = `${day}T00:00:00.000Z`;
      const end = `${day}T23:59:59.999Z`;
      const { count } = await remote
        .from("prompt_events")
        .select("id", { count: "exact", head: true })
        .eq("site_id", siteId)
        .gte("created_at", start)
        .lte("created_at", end);
      return count ?? 0;
    }
    const local = await readLocal();
    return local.promptEvents.filter((item) => item.siteId === siteId && item.createdAt.slice(0, 10) === day).length;
  },

  async insertReward(reward: ReferralReward) {
    const remote = supabase();
    if (remote) {
      const { error } = await remote.from("referral_rewards").insert({
        id: reward.id,
        inviter_id: reward.inviterId,
        invited_id: reward.invitedId,
        invited_site_id: reward.invitedSiteId,
        amount_cents: reward.amountCents,
        status: reward.status,
        apply_on: reward.applyOn,
        applied_at: reward.appliedAt,
        created_at: reward.createdAt,
      });
      if (error) throw new Error(error.message);
      return;
    }
    await mutateLocal((data) => {
      data.rewards.push(reward);
    });
  },

  async listRewards(inviterId: string): Promise<ReferralReward[]> {
    const remote = supabase();
    if (remote) {
      const { data } = await remote.from("referral_rewards").select("*").eq("inviter_id", inviterId);
      return (data ?? []).map((row) => ({
        id: row.id,
        inviterId: row.inviter_id,
        invitedId: row.invited_id,
        invitedSiteId: row.invited_site_id,
        amountCents: row.amount_cents,
        status: row.status,
        applyOn: row.apply_on,
        appliedAt: row.applied_at,
        createdAt: row.created_at,
      }));
    }
    const local = await readLocal();
    return local.rewards.filter((item) => item.inviterId === inviterId);
  },

  async markRewardsReady(invitedId: string, siteId: string) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const applyOn = nextMonth.toISOString().slice(0, 10);
    const remote = supabase();
    if (remote) {
      await remote
        .from("referral_rewards")
        .update({ status: "ready", invited_site_id: siteId, apply_on: applyOn })
        .eq("invited_id", invitedId)
        .eq("status", "pending");
      return;
    }
    await mutateLocal((data) => {
      data.rewards.forEach((item) => {
        if (item.invitedId === invitedId && item.status === "pending") {
          item.status = "ready";
          item.invitedSiteId = siteId;
          item.applyOn = applyOn;
        }
      });
    });
  },

  async recordLogin(profile: Profile) {
    const event: LoginEvent = {
      id: crypto.randomUUID(),
      profileId: profile.id,
      email: profile.email,
      createdAt: new Date().toISOString(),
    };
    const remote = supabase();
    if (remote) {
      await remote.from("login_events").insert({
        id: event.id,
        profile_id: event.profileId,
        email: event.email,
        created_at: event.createdAt,
      });
      return;
    }
    await mutateLocal((data) => {
      data.loginEvents.push(event);
    });
  },

  async adminStats() {
    const remote = supabase();
    const creatorFilter = (email: string) => isCreatorEmail(email);
    if (remote) {
      const [{ data: profiles }, { data: sites }, { data: logins }, { data: prompts }] = await Promise.all([
        remote.from("profiles").select("id, email, name, created_at"),
        remote.from("sites").select("id, slug, owner_id, plan, must_change_password, created_at, content, initial_content"),
        remote.from("login_events").select("profile_id, email, created_at"),
        remote.from("prompt_events").select("site_id, applied"),
      ]);
      const people = profiles ?? [];
      const webs = sites ?? [];
      const loginRows = logins ?? [];
      const promptRows = prompts ?? [];
      const emailById = new Map(people.map((item) => [item.id, String(item.email)]));
      const configured = webs.filter((site) => {
        const applied = promptRows.some((row) => row.site_id === site.id && row.applied);
        return !site.must_change_password || applied;
      });
      return {
        accounts: people.length,
        loginsUnique: new Set(loginRows.map((row) => row.profile_id)).size,
        loginsTotal: loginRows.length,
        trialsStarted: webs.filter((site) => !creatorFilter(emailById.get(site.owner_id) || "")).length,
        sitesConfigured: configured.filter((site) => !creatorFilter(emailById.get(site.owner_id) || "")).length,
        paying: webs.filter((site) => site.plan === "active" && !creatorFilter(emailById.get(site.owner_id) || "")).length,
        recentLogins: loginRows
          .slice()
          .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
          .slice(0, 12)
          .map((row) => ({ email: row.email, at: row.created_at })),
        sites: webs.map((site) => ({
          slug: site.slug,
          name: (site.content as { name?: string } | null)?.name || site.slug,
          email: emailById.get(site.owner_id) || "",
          plan: site.plan,
          configured: !site.must_change_password,
          createdAt: site.created_at,
        })),
      };
    }
    const local = await readLocal();
    const configured = local.sites.filter((site) => {
      const applied = local.promptEvents.some((event) => event.siteId === site.id && event.applied);
      return !site.mustChangePassword || applied;
    });
    return {
      accounts: local.profiles.length,
      loginsUnique: new Set(local.loginEvents.map((item) => item.profileId)).size,
      loginsTotal: local.loginEvents.length,
      trialsStarted: local.sites.filter((site) => {
        const owner = local.profiles.find((item) => item.id === site.ownerId);
        return !creatorFilter(owner?.email || "");
      }).length,
      sitesConfigured: configured.filter((site) => {
        const owner = local.profiles.find((item) => item.id === site.ownerId);
        return !creatorFilter(owner?.email || "");
      }).length,
      paying: local.sites.filter((site) => {
        const owner = local.profiles.find((item) => item.id === site.ownerId);
        return site.plan === "active" && !creatorFilter(owner?.email || "");
      }).length,
      recentLogins: local.loginEvents
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 12)
        .map((item) => ({ email: item.email, at: item.createdAt })),
      sites: local.sites.map((site) => ({
        slug: site.slug,
        name: site.content.name,
        email: local.profiles.find((item) => item.id === site.ownerId)?.email || "",
        plan: site.plan,
        configured: !site.mustChangePassword,
        createdAt: site.createdAt,
      })),
    };
  },

  usingSupabase(): boolean {
    return Boolean(supabase());
  },
};
