import { business } from "@config/business";
import type { DaySchedule, MenuItem, Review, ShopLocation } from "@config/types";
import { DEFAULT_FEATURES, type Sector, type SiteContent } from "@/lib/content-types";

export type { SiteContent } from "@/lib/content-types";

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("34") ? digits : `34${digits}`;
}

export function seedFromMartin(): SiteContent {
  const serviceField = business.booking.fields.find((field) => field.name === "servicio");
  const notesField = business.booking.fields.find((field) => field.name === "notas");
  const hourField = business.booking.fields.find((field) => field.name === "hora");

  return {
    name: business.name,
    legalName: business.legalName,
    sector: "tattoo",
    city: business.city,
    neighborhood: business.neighborhood,
    tagline: business.tagline,
    description: business.description,
    theme: { ...business.theme },
    features: { ...DEFAULT_FEATURES },
    contact: { ...business.contact },
    hours: business.hours.map((day) => ({
      ...day,
      lunch: { ...day.lunch },
      dinner: { ...day.dinner },
    })),
    nav: business.nav.map((link) => ({ ...link })),
    mobileCta: { ...business.mobileCta },
    hero: {
      ...business.hero,
      primaryCta: { ...business.hero.primaryCta },
      secondaryCta: { ...business.hero.secondaryCta },
    },
    menuSection: { ...business.menuSection },
    reviewsSection: { ...business.reviewsSection },
    contactSection: { ...business.contactSection },
    locations: business.locations.map((shop) => ({ ...shop })),
    booking: {
      eyebrow: business.booking.eyebrow,
      title: business.booking.title,
      subtitle: business.booking.subtitle,
      submitLabel: business.booking.submitLabel,
      successMessage: business.booking.successMessage,
      whatsappIntro: business.booking.whatsappIntro,
      serviceOptions: serviceField?.options ?? [],
      notesPlaceholder: notesField?.placeholder ?? "",
      notesLabel: notesField?.label ?? "Notas",
      hourDefault: hourField?.defaultValue ?? "12:00",
    },
    products: business.products.map((product, index) => ({
      id: product.id,
      name: product.name,
      category: business.categories.find((item) => item.id === product.categoryId)?.label ?? product.categoryId,
      price: product.price,
      description: product.description,
      agotado: false,
      image: product.image,
      order: index + 1,
      featured: product.featured,
      tags: product.tags,
    })),
    reviews: business.reviews.map((review) => ({ ...review })),
    googleRating: { ...business.googleRating },
    seo: { ...business.seo },
  };
}

const SECTORS: Sector[] = [
  "restaurante",
  "barberia",
  "tattoo",
  "fisio",
  "urgencias",
  "tienda",
  "muebles",
  "salon",
  "otro",
];

export function sanitizeSiteContent(input: unknown, seed = seedFromMartin()): SiteContent {
  const raw = (input && typeof input === "object" ? input : {}) as Partial<SiteContent>;
  const contact = { ...seed.contact, ...(raw.contact ?? {}) };
  const phone = text(contact.phone, seed.contact.phone);
  const whatsapp = text(contact.whatsapp, phone);
  const wa = phoneDigits(whatsapp);
  const name = text(raw.name, seed.name);
  const sector = SECTORS.includes(raw.sector as Sector) ? (raw.sector as Sector) : seed.sector;

  const locations = Array.isArray(raw.locations)
    ? raw.locations.slice(0, 8).flatMap((shop) => {
        const shopName = text(shop?.name);
        const address = text(shop?.address);
        const shopPhone = text(shop?.phone) || phone;
        if (!shopName || !address) return [];
        const shopWa = text(shop?.whatsapp) || shopPhone;
        return [
          {
            id: text(shop?.id) || shopName.toLowerCase().replace(/\s+/g, "-"),
            name: shopName,
            address,
            postalCode: text(shop?.postalCode),
            phone: shopPhone,
            phoneHref: `tel:+${phoneDigits(shopPhone)}`,
            whatsapp: shopWa,
            mapsUrl:
              text(shop?.mapsUrl) ||
              `https://maps.google.com/?q=${encodeURIComponent(`${address} ${text(raw.city, seed.city)}`)}`,
            note: text(shop?.note),
            rating: text(shop?.rating) || undefined,
          } satisfies ShopLocation,
        ];
      })
    : seed.locations;

  const products: MenuItem[] = Array.isArray(raw.products)
    ? raw.products.slice(0, 40).flatMap((item, index) => {
        const itemName = text(item?.name);
        if (!itemName) return [];
        return [
          {
            id: text(item?.id) || `srv-${index + 1}`,
            name: itemName,
            category: text(item?.category, "Catálogo"),
            price: Math.max(0, num(item?.price, 0)),
            description: text(item?.description),
            agotado: Boolean(item?.agotado),
            image: text(item?.image),
            order: num(item?.order, index + 1),
            featured: Boolean(item?.featured),
            tags: Array.isArray(item?.tags)
              ? item.tags.map((tag) => text(tag)).filter(Boolean).slice(0, 4)
              : [],
          },
        ];
      })
    : seed.products;

  const reviews: Review[] = Array.isArray(raw.reviews)
    ? raw.reviews.slice(0, 24).flatMap((review, index) => {
        const author = text(review?.author);
        const body = text(review?.text);
        if (!author || !body) return [];
        const rating = Math.min(5, Math.max(1, num(review?.rating, 5)));
        if (rating < 4) return [];
        const initials =
          text(review?.avatarInitials) ||
          author
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("");
        return [
          {
            id: text(review?.id) || `r-${index + 1}`,
            author,
            avatarInitials: initials.slice(0, 3),
            rating,
            date: text(review?.date, "reseña pública"),
            source: "Google" as const,
            text: body,
          },
        ];
      })
    : seed.reviews;

  const hours: DaySchedule[] = seed.hours.map((day, index) => {
    const incoming = raw.hours?.[index];
    if (!incoming) return day;
    return {
      ...day,
      label: text(incoming.label, day.label),
      closed: Boolean(incoming.closed),
      lunch: {
        open: text(incoming.lunch?.open, day.lunch.open ?? "") || null,
        close: text(incoming.lunch?.close, day.lunch.close ?? "") || null,
      },
      dinner: day.dinner,
    };
  });

  const hero = { ...seed.hero, ...(raw.hero ?? {}) };
  const theme = { ...seed.theme, ...(raw.theme ?? {}) };
  const features = { ...seed.features, ...(raw.features ?? {}) };
  const foundScore = num(raw.googleRating?.score, 0);
  const score = foundScore >= 4 ? foundScore : 5;

  return {
    name,
    legalName: text(raw.legalName, name),
    sector,
    city: text(raw.city, seed.city),
    neighborhood: text(raw.neighborhood, seed.neighborhood),
    tagline: text(raw.tagline, seed.tagline),
    description: text(raw.description, seed.description),
    theme,
    features,
    contact: {
      ...contact,
      phone,
      phoneHref: `tel:+${phoneDigits(phone)}`,
      whatsapp,
      whatsappHref: wa
        ? `https://wa.me/${wa}?text=${encodeURIComponent(`Hola, quiero escribir a ${name}`)}`
        : seed.contact.whatsappHref,
      email: text(contact.email),
      address: text(contact.address, seed.contact.address),
      postalCode: text(contact.postalCode),
      mapsUrl: text(contact.mapsUrl, seed.contact.mapsUrl),
      mapEmbedSrc: text(contact.mapEmbedSrc, seed.contact.mapEmbedSrc),
      instagram: text(contact.instagram) || undefined,
    },
    hours,
    nav: Array.isArray(raw.nav) && raw.nav.length
      ? raw.nav.slice(0, 6).map((link, index) => ({
          href: text(link?.href, seed.nav[index]?.href ?? "#inicio"),
          label: text(link?.label, seed.nav[index]?.label ?? "Sección"),
        }))
      : seed.nav,
    mobileCta: {
      call: text(raw.mobileCta?.call, seed.mobileCta.call),
      whatsapp: text(raw.mobileCta?.whatsapp, seed.mobileCta.whatsapp),
      book: text(raw.mobileCta?.book, seed.mobileCta.book),
    },
    hero: {
      ...hero,
      eyebrow: text(hero.eyebrow, seed.hero.eyebrow),
      title: text(hero.title, seed.hero.title),
      highlight: text(hero.highlight, seed.hero.highlight),
      subtitle: text(hero.subtitle, seed.hero.subtitle),
      image: text(hero.image, seed.hero.image),
      imageAlt: text(hero.imageAlt, seed.hero.imageAlt),
      primaryCta: {
        label: text(hero.primaryCta?.label, seed.hero.primaryCta.label),
        href: text(hero.primaryCta?.href, "#reservar"),
      },
      secondaryCta: {
        label: text(hero.secondaryCta?.label, seed.hero.secondaryCta.label),
        href: text(hero.secondaryCta?.href, "#contacto"),
      },
    },
    menuSection: {
      eyebrow: text(raw.menuSection?.eyebrow, seed.menuSection.eyebrow),
      title: text(raw.menuSection?.title, seed.menuSection.title),
      subtitle: text(raw.menuSection?.subtitle, seed.menuSection.subtitle),
      featuredLabel: text(raw.menuSection?.featuredLabel, seed.menuSection.featuredLabel),
    },
    reviewsSection: {
      eyebrow: text(raw.reviewsSection?.eyebrow, seed.reviewsSection.eyebrow),
      title: text(raw.reviewsSection?.title, seed.reviewsSection.title),
      subtitle: text(raw.reviewsSection?.subtitle),
    },
    contactSection: {
      eyebrow: text(raw.contactSection?.eyebrow, seed.contactSection.eyebrow),
      title: text(raw.contactSection?.title, seed.contactSection.title),
      subtitle: text(raw.contactSection?.subtitle, seed.contactSection.subtitle),
      mapCaption: text(raw.contactSection?.mapCaption, seed.contactSection.mapCaption),
    },
    locations: locations.length ? locations : seed.locations,
    booking: {
      eyebrow: text(raw.booking?.eyebrow, seed.booking.eyebrow),
      title: text(raw.booking?.title, seed.booking.title),
      subtitle: text(raw.booking?.subtitle, seed.booking.subtitle),
      submitLabel: text(raw.booking?.submitLabel, seed.booking.submitLabel),
      successMessage: text(raw.booking?.successMessage, seed.booking.successMessage),
      whatsappIntro: text(raw.booking?.whatsappIntro, seed.booking.whatsappIntro),
      serviceOptions:
        Array.isArray(raw.booking?.serviceOptions) && raw.booking.serviceOptions.length
          ? raw.booking.serviceOptions.map((item) => text(item)).filter(Boolean).slice(0, 12)
          : seed.booking.serviceOptions,
      notesPlaceholder: text(raw.booking?.notesPlaceholder, seed.booking.notesPlaceholder),
      notesLabel: text(raw.booking?.notesLabel, seed.booking.notesLabel),
      hourDefault: text(raw.booking?.hourDefault, seed.booking.hourDefault),
    },
    products: products.length ? products.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)) : seed.products,
    reviews,
    googleRating: {
      score,
      count: num(raw.googleRating?.count, reviews.length || seed.googleRating.count),
      url: text(raw.googleRating?.url, seed.googleRating.url),
    },
    seo: {
      title: text(raw.seo?.title, `${name} | ${text(raw.city, seed.city)}`),
      description: text(raw.seo?.description, seed.seo.description),
      website: text(raw.seo?.website, seed.seo.website),
    },
  };
}

export function osmEmbed(lat: number, lng: number): string {
  const d = 0.01;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export async function getSiteContent(): Promise<SiteContent> {
  return seedFromMartin();
}

export async function saveSiteContent(input: unknown): Promise<SiteContent> {
  return sanitizeSiteContent(input);
}

export async function uploadSiteImage(file: File): Promise<string> {
  const { saveImage } = await import("@/lib/upload");
  return saveImage(file);
}
