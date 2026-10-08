import type { BusinessConfig } from "./types";

/**
 * Copia de la ficha de Martin Tattoo extraída de config/business.ts.
 * Solo el negocio martin-tattoo. Editar este archivo no cambia la web publicada.
 */

/**
 * Martin Tattoo: dos locales reales en el centro de Málaga.
 * Los textos, precios y fotos que ve el cliente se cambian en /panel.
 *
 * Horario de Calle San Juan según fichas públicas (10:00–22:00; domingo 11:00–18:00).
 * Otras fichas cierran el domingo: conviene confirmarlo por WhatsApp.
 */
const martinTattoo: BusinessConfig = {
  id: "martin-tattoo",
  sector: "tattoo",
  name: "Martin Tattoo",
  legalName: "Martin Tattoo Shop Málaga",
  city: "Málaga",
  neighborhood: "Centro",
  tagline: "Tiny tattoos en Puerta del Mar y estudio en Calle San Juan",
  description:
    "Dos locales de Martin en el centro de Málaga: Tiny Tattoos by Martin en Puerta del Mar y Martin Tattoo Studio en Calle San Juan. Tatuaje, piercing y tienda.",
  hasAiSubscription: false,
  theme: {
    ink: "#14110F",
    cream: "#F7F2EB",
    sand: "#E6D8C8",
    terracotta: "#9C3B2E",
    gold: "#C6A15B",
    olive: "#3E463C",
    foam: "#EFE6DA",
  },
  contact: {
    phone: "640 85 83 98",
    phoneHref: "tel:+34640858398",
    whatsapp: "640 85 83 98",
    whatsappHref:
      "https://wa.me/34640858398?text=Hola%2C%20quiero%20pedir%20cita%20en%20Martin%20Tattoo%20Studio%20(Calle%20San%20Juan)",
    email: "",
    address: "Calle San Juan, 33",
    postalCode: "29005 Málaga",
    mapsUrl: "https://maps.google.com/?q=Calle+San+Juan+33+M%C3%A1laga",
    mapEmbedSrc:
      "https://www.openstreetmap.org/export/embed.html?bbox=-4.4320%2C36.7152%2C-4.4146%2C36.7238&layer=mapnik&marker=36.719505%2C-4.423333",
  },
  geo: { lat: 36.719505, lng: -4.423333 },
  hours: [
    { day: "lunes", label: "Lunes", lunch: { open: "10:00", close: "22:00" }, dinner: { open: null, close: null }, closed: false },
    { day: "martes", label: "Martes", lunch: { open: "10:00", close: "22:00" }, dinner: { open: null, close: null }, closed: false },
    { day: "miercoles", label: "Miércoles", lunch: { open: "10:00", close: "22:00" }, dinner: { open: null, close: null }, closed: false },
    { day: "jueves", label: "Jueves", lunch: { open: "10:00", close: "22:00" }, dinner: { open: null, close: null }, closed: false },
    { day: "viernes", label: "Viernes", lunch: { open: "10:00", close: "22:00" }, dinner: { open: null, close: null }, closed: false },
    { day: "sabado", label: "Sábado", lunch: { open: "10:00", close: "22:00" }, dinner: { open: null, close: null }, closed: false },
    { day: "domingo", label: "Domingo", lunch: { open: "11:00", close: "18:00" }, dinner: { open: null, close: null }, closed: false },
  ],
  nav: [
    { href: "#carta", label: "Servicios" },
    { href: "#opiniones", label: "Opiniones" },
    { href: "#contacto", label: "Locales" },
  ],
  mobileCta: { call: "Llamar", whatsapp: "WhatsApp", book: "Pedir cita" },
  hero: {
    eyebrow: "Centro de Málaga · Dos locales",
    title: "Tiny tattoos y el estudio,",
    highlight: "los dos de Martin",
    subtitle:
      "Tiny Tattoos by Martin en Puerta del Mar, 6. Martin Tattoo Studio en Calle San Juan, 33. Si hay hueco te atienden al momento. Si no, deja la cita por WhatsApp.",
    image:
      "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "Detalle de una máquina de tatuar sobre la piel",
    primaryCta: { label: "Pedir cita por WhatsApp", href: "#reservar" },
    secondaryCta: { label: "Ver locales", href: "#contacto" },
  },
  menuSection: {
    eyebrow: "Qué se hace en los dos locales",
    title: "Fine line, piezas, piercing y tienda",
    subtitle:
      "El precio depende del tamaño. Desde el panel se cambian los servicios, las fotos y lo que cuesta cada uno.",
    featuredLabel: "Lo más pedido",
  },
  reviewsSection: {
    eyebrow: "Reseñas públicas de Google",
    title: "Entran de paso y salen con el tatuaje hecho",
  },
  contactSection: {
    eyebrow: "Dos puertas en el centro",
    title: "Puerta del Mar para los tiny. San Juan para el estudio.",
    subtitle:
      "Horario orientativo del estudio de Calle San Juan. Algunas fichas cierran el domingo: confírmalo al escribir. El de Puerta del Mar no publica horario fijo.",
    mapCaption: "Mapa · Martin Tattoo Studio, Calle San Juan 33",
  },
  locations: [
    {
      id: "tiny",
      name: "Tiny Tattoos by Martin",
      address: "Calle Puerta del Mar, 6",
      postalCode: "Málaga",
      phone: "656 41 98 82",
      phoneHref: "tel:+34656419882",
      whatsapp: "656 41 98 82",
      mapsUrl: "https://maps.google.com/?q=Calle+Puerta+del+Mar+6+M%C3%A1laga",
      note: "Mini tatuajes y piercing, junto al puerto. Valoración pública 5,0. Horario: pregúntalo por WhatsApp.",
      rating: "5,0 en Google",
    },
    {
      id: "studio",
      name: "Martin Tattoo Studio",
      address: "Calle San Juan, 33",
      postalCode: "29005 Málaga",
      phone: "640 85 83 98",
      phoneHref: "tel:+34640858398",
      whatsapp: "640 85 83 98",
      mapsUrl: "https://maps.google.com/?q=Calle+San+Juan+33+M%C3%A1laga",
      note: "Estudio y tienda en el centro. Piezas, piercing y walk-in si hay hueco. 4,9 en Google.",
      rating: "4,9 en Google",
    },
  ],
  booking: {
    eyebrow: "Agenda",
    title: "Elige local. El WhatsApp llega al teléfono de ese sitio.",
    subtitle:
      "Tiny Tattoos escribe a Puerta del Mar. El estudio, a Calle San Juan. Nombre, servicio y día van en el mensaje.",
    submitLabel: "Pedir cita por WhatsApp",
    successMessage: "Se ha abierto WhatsApp con la cita lista para enviar al local que elegiste.",
    whatsappIntro: "Nueva cita para Martin Tattoo",
    whatsappByOption: {
      field: "local",
      numbers: {
        "Tiny Tattoos · Puerta del Mar": "656419882",
        "Estudio · Calle San Juan": "640858398",
      },
    },
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true, placeholder: "Ana García", half: true },
      {
        name: "local",
        label: "Local",
        type: "select",
        required: true,
        half: true,
        options: ["Tiny Tattoos · Puerta del Mar", "Estudio · Calle San Juan"],
      },
      {
        name: "servicio",
        label: "Servicio",
        type: "select",
        required: true,
        half: true,
        options: ["Tiny tattoo / fine line", "Pieza mediana", "Piercing", "Joyería o tienda"],
      },
      { name: "fecha", label: "Fecha", type: "date", required: true, half: true },
      { name: "hora", label: "Hora", type: "time", required: true, half: true, defaultValue: "17:00" },
      {
        name: "notas",
        label: "Zona y referencia",
        type: "textarea",
        placeholder: "Muñeca, fine line pequeño. Puedo ir sin cita si hay hueco.",
      },
    ],
  },
  categories: [
    { id: "tiny", label: "Tiny / fine line" },
    { id: "piezas", label: "Piezas" },
    { id: "piercing", label: "Piercing" },
    { id: "tienda", label: "Tienda" },
  ],
  products: [
    {
      id: "tiny-line",
      categoryId: "tiny",
      name: "Tiny tattoo",
      description: "Motivo pequeño, el sello de Puerta del Mar. Precio según el tamaño, no hay tarifa colgada.",
      price: 0,
      image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80",
      featured: true,
      tags: ["Puerta del Mar"],
    },
    {
      id: "fine",
      categoryId: "tiny",
      name: "Fine line",
      description: "Línea fina a una aguja. Trae referencia o cuéntasela a Martin en el WhatsApp.",
      price: 0,
      image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=900&q=80",
      tags: ["Consultar"],
    },
    {
      id: "lettering",
      categoryId: "tiny",
      name: "Lettering corto",
      description: "Una palabra o una fecha. Se cierra el diseño antes de sentarte.",
      price: 0,
      image: "https://images.unsplash.com/photo-1612459284970-e8f027596582?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "media",
      categoryId: "piezas",
      name: "Pieza mediana",
      description: "Brazo, pierna o espalda parcial. Sesión en el estudio de Calle San Juan.",
      price: 0,
      image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=900&q=80",
      featured: true,
      tags: ["San Juan"],
    },
    {
      id: "walkin",
      categoryId: "piezas",
      name: "Walk-in si hay hueco",
      description: "Muchas reseñas entran sin cita y salen tatuadas el mismo día. Depende de la agenda.",
      price: 0,
      image: "https://images.unsplash.com/photo-1477511801984-4ad318ed9846?auto=format&fit=crop&w=900&q=80",
      tags: ["Mismo día"],
    },
    {
      id: "oreja",
      categoryId: "piercing",
      name: "Oreja",
      description: "Lóbulo, helix y más. En el estudio también perfora el equipo, no solo Martin.",
      price: 0,
      image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "ombligo",
      categoryId: "piercing",
      name: "Ombligo o septum",
      description: "Pregunta el material de la joyería antes de comprarla. La de primera puesta se explica en el momento.",
      price: 0,
      image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "joyeria",
      categoryId: "tienda",
      name: "Joyería de piercing",
      description: "La venden en el estudio de San Juan. Pide el material por escrito si te importa.",
      price: 0,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
      tags: ["Tienda"],
    },
    {
      id: "ropa",
      categoryId: "tienda",
      name: "Ropa y accesorios",
      description: "El local de San Juan tiene tienda además del estudio. Se puede pasar a mirar sin cita.",
      price: 0,
      image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=80",
    },
  ],
  reviews: [
    {
      id: "r1",
      author: "Aoife Moloney",
      avatarInitials: "AM",
      rating: 5,
      date: "reseña pública",
      source: "Google",
      text: "Me sentí cómoda todo el rato y me tranquilizó. Volvería al volver a Málaga.",
    },
    {
      id: "r2",
      author: "Alison Carlotti",
      avatarInitials: "AC",
      rating: 5,
      date: "reseña pública",
      source: "Google",
      text: "Primer tatuaje con Martin, profesional. Después el piercing de ombligo, también bien.",
    },
    {
      id: "r3",
      author: "Valentin Blondiau",
      avatarInitials: "VB",
      rating: 5,
      date: "reseña pública",
      source: "Google",
      text: "Dos piercings en la oreja. El equipo acoge y Luana explica el cuidado con calma.",
    },
    {
      id: "r4",
      author: "Sito Game",
      avatarInitials: "SG",
      rating: 5,
      date: "reseña pública",
      source: "Google",
      text: "Muy atento y organizado mientras esperas. Volverá. Gracias Martín.",
    },
    {
      id: "r5",
      author: "Federica Vero",
      avatarInitials: "FV",
      rating: 5,
      date: "reseña pública",
      source: "Google",
      text: "Entró sin pensarlo, le dieron hora una hora después. Martin habla italiano y pone a gusto.",
    },
    {
      id: "r6",
      author: "Grace Holmes",
      avatarInitials: "GH",
      rating: 5,
      date: "reseña pública",
      source: "Google",
      text: "Primera vez tatuándose. La atendieron sin cita y salió contenta con el resultado.",
    },
  ],
  googleRating: {
    score: 4.9,
    count: 282,
    url: "https://maps.google.com/?q=Martin+Tattoo+Shop+Calle+San+Juan+33+M%C3%A1laga",
  },
  seo: {
    title: "Martin Tattoo Málaga | Tiny Tattoos en Puerta del Mar y estudio en San Juan",
    description:
      "Pide cita en Tiny Tattoos by Martin (Puerta del Mar, 6) o en Martin Tattoo Studio (Calle San Juan, 33). Tatuaje, piercing y tienda en el centro de Málaga.",
    website: "https://martin-tattoo-malaga.vercel.app",
  },
  support: {
    agencyName: "Vends Hoy Webs",
    whatsappHref:
      "https://wa.me/34600000000?text=Quiero%20activar%20el%20m%C3%B3dulo%20de%20IA%20de%20Martin%20Tattoo",
    email: "soporte@vendshoywebs.es",
    aiPriceMonthly: 50,
  },
  aiInsights: {
    generatedAt: "2026-10-03T17:20:00+02:00",
    sentiment: {
      positive: 86,
      neutral: 8,
      negative: 6,
      summary:
        "Las reseñas públicas destacan el trato, el walk-in y la limpieza. El roce que se repite es la joyería: conviene decir el material antes de venderla.",
      keywords: ["trato", "walk-in", "piercing", "limpio", "joyería"],
    },
    stock: [
      {
        productName: "Agujas de línea fina",
        daysOfCover: 5,
        risk: "medio",
        recommendation: "Reponer antes del finde. Los tiny de Puerta del Mar tiran de este calibre.",
      },
      {
        productName: "Joyería de titanio",
        daysOfCover: 3,
        risk: "alto",
        recommendation: "Separar en tienda la de titanio y etiquetar el material. Es la queja que más se repite.",
      },
    ],
    peakHours: [
      { day: "Sáb", hour: "17:00", occupancy: 94 },
      { day: "Vie", hour: "19:00", occupancy: 88 },
      { day: "Dom", hour: "13:00", occupancy: 70 },
    ],
    weeklyRevenueHint:
      "Los walk-in del centro convierten mejor si el WhatsApp responde con el local que tiene hueco ese día.",
  },
};

function applyRuntimeFlags(config: BusinessConfig): BusinessConfig {
  const flag = process.env.NEXT_PUBLIC_HAS_AI_SUBSCRIPTION;
  if (flag === "true") return { ...config, hasAiSubscription: true };
  if (flag === "false") return { ...config, hasAiSubscription: false };
  return config;
}

export function resolveBusiness(): BusinessConfig {
  return applyRuntimeFlags(martinTattoo);
}

export const business = resolveBusiness();
