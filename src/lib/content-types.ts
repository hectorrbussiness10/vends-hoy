import type { DaySchedule, HeroContent, MenuItem, NavLink, Review, ShopLocation, ThemeTokens } from "@config/types";

export type Sector =
  | "restaurante"
  | "barberia"
  | "tattoo"
  | "fisio"
  | "urgencias"
  | "tienda"
  | "muebles"
  | "salon"
  | "otro";

export type SiteFeatures = {
  catalog: boolean;
  reviews: boolean;
  booking: boolean;
  hours: boolean;
  locations: boolean;
};

export type SiteContent = {
  name: string;
  legalName: string;
  sector: Sector;
  city: string;
  neighborhood: string;
  tagline: string;
  description: string;
  theme: ThemeTokens;
  features: SiteFeatures;
  contact: {
    phone: string;
    phoneHref: string;
    whatsapp: string;
    whatsappHref: string;
    email: string;
    address: string;
    postalCode: string;
    mapsUrl: string;
    mapEmbedSrc: string;
    instagram?: string;
  };
  hours: DaySchedule[];
  nav: NavLink[];
  mobileCta: { call: string; whatsapp: string; book: string };
  hero: HeroContent;
  menuSection: {
    eyebrow: string;
    title: string;
    subtitle?: string;
    featuredLabel: string;
  };
  reviewsSection: { eyebrow: string; title: string; subtitle?: string };
  contactSection: {
    eyebrow: string;
    title: string;
    subtitle?: string;
    mapCaption: string;
  };
  locations: ShopLocation[];
  booking: {
    eyebrow: string;
    title: string;
    subtitle: string;
    submitLabel: string;
    successMessage: string;
    whatsappIntro: string;
    serviceOptions: string[];
    notesPlaceholder: string;
    notesLabel: string;
    hourDefault: string;
  };
  products: MenuItem[];
  reviews: Review[];
  googleRating: { score: number; count: number; url: string };
  seo: { title: string; description: string; website: string };
};

export const DEFAULT_FEATURES: SiteFeatures = {
  catalog: true,
  reviews: true,
  booking: true,
  hours: true,
  locations: true,
};

export const SECTOR_LABELS: Record<Sector, { catalog: string; book: string; item: string }> = {
  restaurante: { catalog: "Carta", book: "Reservar mesa", item: "plato" },
  barberia: { catalog: "Servicios", book: "Pedir cita", item: "servicio" },
  tattoo: { catalog: "Servicios", book: "Pedir cita", item: "servicio" },
  fisio: { catalog: "Tratamientos", book: "Pedir cita", item: "tratamiento" },
  urgencias: { catalog: "Servicios", book: "Pedir cita", item: "servicio" },
  tienda: { catalog: "Catálogo", book: "Encargar", item: "producto" },
  muebles: { catalog: "Piezas", book: "Pedir presupuesto", item: "pieza" },
  salon: { catalog: "Servicios", book: "Pedir cita", item: "servicio" },
  otro: { catalog: "Catálogo", book: "Contactar", item: "servicio" },
};
