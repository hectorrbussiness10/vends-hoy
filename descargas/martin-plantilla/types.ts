/**
 * Contrato de datos de un local.
 * Clonar una web = copiar este tipo con otro `business.ts`.
 * Nada de copy de marketing debe vivir hardcodeado en los componentes.
 */

export type DayKey =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export type WeeklySlot = {
  /** Hora de apertura en formato 24h (HH:mm). Null = cerrado ese tramo. */
  open: string | null;
  close: string | null;
};

export type DaySchedule = {
  day: DayKey;
  label: string;
  /** Servicio de mediodía. */
  lunch: WeeklySlot;
  /** Servicio de noche. */
  dinner: WeeklySlot;
  closed: boolean;
};

export type Sector =
  | "restaurante"
  | "barberia"
  | "tattoo"
  | "fisio"
  | "urgencias"
  | "tienda";

export type NavLink = {
  href: string;
  label: string;
};

export type SectionCopy = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export type BookingFieldType =
  | "text"
  | "tel"
  | "email"
  | "date"
  | "time"
  | "number"
  | "select"
  | "textarea";

/** Campo del formulario. El WhatsApp se arma con label + valor. */
export type BookingField = {
  name: string;
  label: string;
  type: BookingFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  half?: boolean;
};

export type BookingConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  submitLabel: string;
  successMessage: string;
  /** Primera línea del mensaje que llega al WhatsApp del local. */
  whatsappIntro: string;
  fields: BookingField[];
  /** Si eligen una opción, el aviso sale al WhatsApp de ese local. */
  whatsappByOption?: {
    field: string;
    numbers: Record<string, string>;
  };
};

export type ShopLocation = {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  mapsUrl: string;
  note: string;
  rating?: string;
};

export type ProductCategory = {
  id: string;
  label: string;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  /** Plato destacado para CRO (badge “El de la casa”). */
  featured?: boolean;
  tags?: string[];
};

/** Adjunto de Airtable (el CMS solo usa la primera foto). */
export type AirtableAttachment = {
  id?: string;
  url: string;
  filename?: string;
  thumbnails?: {
    small?: { url: string };
    large?: { url: string };
  };
};

/**
 * Campos de la tabla `Platos` en Airtable.
 * Los nombres deben coincidir con las columnas (se aceptan variantes sin tilde).
 */
export type AirtablePlatoFields = {
  Nombre?: string;
  Categoría?: string;
  Categoria?: string;
  Precio?: number | string;
  Descripción?: string;
  Descripcion?: string;
  Agotado?: boolean;
  Oculto?: boolean;
  Foto?: AirtableAttachment[];
  Orden?: number | string;
};

export type AirtableRecord<T> = {
  id: string;
  createdTime?: string;
  fields: T;
};

export type AirtableListResponse<T> = {
  records: AirtableRecord<T>[];
  offset?: string;
};

/**
 * Servicio que pinta la carta pública.
 * Sale del panel o, si nadie ha guardado todavía, de `config/business.ts`.
 */
export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  /** true = se muestra en la carta con badge “Agotado”. */
  agotado: boolean;
  image: string;
  order?: number;
  featured?: boolean;
  tags?: string[];
};

export type Review = {
  id: string;
  author: string;
  avatarInitials: string;
  rating: number;
  date: string;
  source: "Google";
  text: string;
};

export type ThemeTokens = {
  ink: string;
  cream: string;
  sand: string;
  terracotta: string;
  gold: string;
  olive: string;
  foam: string;
};

export type HeroContent = {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export type AiSentiment = {
  positive: number;
  neutral: number;
  negative: number;
  summary: string;
  keywords: string[];
};

export type StockPrediction = {
  productName: string;
  daysOfCover: number;
  risk: "bajo" | "medio" | "alto";
  recommendation: string;
};

export type PeakHour = {
  day: string;
  hour: string;
  occupancy: number;
};

export type AiInsights = {
  generatedAt: string;
  sentiment: AiSentiment;
  stock: StockPrediction[];
  peakHours: PeakHour[];
  weeklyRevenueHint: string;
};

export type BusinessConfig = {
  id: string;
  sector: Sector;
  name: string;
  legalName: string;
  city: string;
  neighborhood: string;
  tagline: string;
  description: string;
  /** Gate del módulo de IA. false = overlay premium bloqueado. */
  hasAiSubscription: boolean;
  theme: ThemeTokens;
  contact: {
    phone: string;
    phoneHref: string;
    whatsapp: string;
    whatsappHref: string;
    email: string;
    address: string;
    postalCode: string;
    mapsUrl: string;
    /** Bbox + marker para el iframe de OpenStreetMap. */
    mapEmbedSrc: string;
    instagram?: string;
  };
  geo: {
    lat: number;
    lng: number;
  };
  hours: DaySchedule[];
  nav: NavLink[];
  /** Texto corto del botón de cita en la cabecera y en la barra móvil. */
  mobileCta: { call: string; whatsapp: string; book: string };
  hero: HeroContent;
  menuSection: SectionCopy & { featuredLabel: string };
  reviewsSection: SectionCopy;
  contactSection: SectionCopy & { mapCaption: string };
  locations: ShopLocation[];
  booking: BookingConfig;
  categories: ProductCategory[];
  products: Product[];
  reviews: Review[];
  googleRating: {
    score: number;
    count: number;
    url: string;
  };
  seo: {
    title: string;
    description: string;
    website: string;
  };
  support: {
    agencyName: string;
    whatsappHref: string;
    email: string;
    aiPriceMonthly: number;
  };
  aiInsights: AiInsights;
};
