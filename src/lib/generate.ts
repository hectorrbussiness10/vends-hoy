import OpenAI from "openai";
import type { Sector, SiteContent } from "@/lib/content-types";
import { SECTOR_LABELS } from "@/lib/content-types";
import { osmEmbed, phoneDigits, sanitizeSiteContent, seedFromMartin } from "@/lib/site-content";
import { lookupPlace } from "@/lib/places";

const SYSTEM = `Eres el generador de Vends Hoy. Devuelves SOLO JSON válido con el contrato SiteContent.
Reglas:
- Partes de la plantilla Martin Tattoo (misma estructura: portada, catálogo, reseñas, locales, horario, reserva, colores).
- Adaptas textos, categorías y tono al oficio del cliente. Si es una tienda de muebles, habla de piezas y presupuestos, no de tatuajes.
- Toda la información sensible (teléfono, WhatsApp, precios, catálogo, reseñas, reservas, horario) se gestiona luego en el panel. NUNCA pidas claves API ni servicios externos al cliente.
- features: catalog, reviews, booking, hours, locations = true salvo que el oficio no tenga sentido (sigue true por defecto).
- Reseñas: solo incluye las que te pasen con 4 o 5 estrellas. No inventes nombres reales. Si no hay reseñas, reviews = [] y googleRating.score = 5.
- googleRating.score nunca baja de 4. Si no hay dato, 5.
- Usa las fotos del cliente en hero.image y products[].image, en orden. Si faltan, deja cadena vacía.
- Colores coherentes con el oficio, paleta de 7: ink, cream, sand, terracotta, gold, olive, foam (hex).
- nav: #carta, #opiniones, #contacto. CTAs apuntan a #reservar y #contacto.
- Español de España, formal, comercial, sin emojis.
- sector uno de: restaurante, barberia, tattoo, fisio, urgencias, tienda, muebles, salon, otro.`;

function client(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

const SECTOR_PHOTOS: Record<Sector, string[]> = {
  muebles: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1616628182501-bfb4c7b8cc1d?auto=format&fit=crop&w=900&q=80",
  ],
  restaurante: [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  ],
  barberia: [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3ea?auto=format&fit=crop&w=2000&q=80",
  ],
  tattoo: [
    "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=2000&q=80",
  ],
  fisio: [
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=80",
  ],
  salon: [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=80",
  ],
  tienda: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80",
  ],
  urgencias: [
    "https://images.unsplash.com/photo-1516574187841-cb34fcffc8e3?auto=format&fit=crop&w=2000&q=80",
  ],
  otro: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80",
  ],
};

function cityFromText(text: string): string {
  const match = text.match(/\ben\s+([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ]+)/);
  return match?.[1] || "";
}

function guessSector(text: string): Sector {
  const t = text.toLowerCase();
  if (/tatu|ink|piercing/.test(t)) return "tattoo";
  if (/mueble|carpinter|sofá|sofa|mesa/.test(t)) return "muebles";
  if (/restau|bar |cafeter|tapas|cocina/.test(t)) return "restaurante";
  if (/barber|pelo|peluqu/.test(t)) return "barberia";
  if (/fisio|rehab|osteop/.test(t)) return "fisio";
  if (/vet|urgen|clinic/.test(t)) return "urgencias";
  if (/salon|estetica|uñas|unas/.test(t)) return "salon";
  if (/tienda|shop|boutique/.test(t)) return "tienda";
  return "otro";
}

function fallbackContent(input: {
  name: string;
  sector: Sector;
  city: string;
  address: string;
  phone: string;
  mapsUrl: string;
  lat: number | null;
  lng: number | null;
  prompt: string;
  photos: string[];
  reviews: SiteContent["reviews"];
  rating: number;
  reviewCount: number;
}): SiteContent {
  const seed = seedFromMartin();
  const labels = SECTOR_LABELS[input.sector];
  const stock = SECTOR_PHOTOS[input.sector] ?? SECTOR_PHOTOS.otro;
  const photo = input.photos[0] || stock[0] || seed.hero.image;
  const productPhotos = input.photos.length > 1 ? input.photos.slice(1) : stock.slice(1);
  const themes: Record<Sector, SiteContent["theme"]> = {
    tattoo: seed.theme,
    muebles: { ink: "#2A241C", cream: "#F4EFE6", sand: "#DDD0BC", terracotta: "#8A5A3A", gold: "#B0894A", olive: "#4A5344", foam: "#EBE4D8" },
    restaurante: { ink: "#1C1410", cream: "#F8F1E4", sand: "#E7D3B0", terracotta: "#A33B24", gold: "#C4A35A", olive: "#3F4A38", foam: "#F0E6D4" },
    barberia: { ink: "#121212", cream: "#F5F1EA", sand: "#D9D0C4", terracotta: "#7A1F1F", gold: "#C9A227", olive: "#2F2F2F", foam: "#EDE7DC" },
    fisio: { ink: "#1A2422", cream: "#F3F6F4", sand: "#D7E2DC", terracotta: "#2F6F62", gold: "#A7C4B5", olive: "#355E57", foam: "#E8F0EC" },
    urgencias: { ink: "#15202B", cream: "#F4F7FA", sand: "#D5DEE8", terracotta: "#C0392B", gold: "#4A90A4", olive: "#2C3E50", foam: "#EAF1F6" },
    tienda: { ink: "#1B1714", cream: "#F7F3EE", sand: "#E4D8CC", terracotta: "#9C4A2E", gold: "#C2A36B", olive: "#445046", foam: "#EFE8DF" },
    salon: { ink: "#2A1F24", cream: "#FBF6F4", sand: "#EBD7D4", terracotta: "#B76E79", gold: "#D4B483", olive: "#5C4B51", foam: "#F4EAE8" },
    otro: seed.theme,
  };

  const categories = {
    muebles: ["Salón", "Comedor", "Dormitorio", "A medida"],
    restaurante: ["Entrantes", "Principales", "Postres", "Bebidas"],
    barberia: ["Corte", "Barba", "Color", "Cuidado"],
    tattoo: ["Tiny / fine line", "Piezas", "Piercing", "Tienda"],
    fisio: ["Consulta", "Rehabilitación", "Deportiva", "Bonos"],
    salon: ["Cabello", "Uñas", "Estética", "Packs"],
    tienda: ["Destacados", "Novedades", "A medida", "Cuidado"],
    urgencias: ["Urgencias", "Consulta", "Vacunas", "Cirugía"],
    otro: ["Servicios", "Productos", "Packs", "Otros"],
  }[input.sector];

  const products = categories.map((category, index) => ({
    id: `p-${index + 1}`,
    name: `${category} ${index === 0 ? "destacado" : "de la casa"}`,
    category,
    price: 0,
    description: input.prompt
      ? `${input.prompt.slice(0, 140)}`
      : `${labels.item} de ${input.name}. Precio y detalle se editan en el panel.`,
    agotado: false,
    image: productPhotos[index] || photo,
    order: index + 1,
    featured: index === 0,
    tags: index === 0 ? ["Destacado"] : [],
  }));

  const wa = phoneDigits(input.phone);
  const lat = input.lat ?? 40.4168;
  const lng = input.lng ?? -3.7038;

  return sanitizeSiteContent({
    ...seed,
    name: input.name,
    legalName: input.name,
    sector: input.sector,
    city: input.city || seed.city,
    neighborhood: input.city ? "" : seed.neighborhood,
    tagline: `${labels.catalog} y ${labels.book.toLowerCase()} en ${input.city || "su ciudad"}`,
    description: input.prompt || `${input.name} en ${input.city || "España"}. Web lista para vender, con catálogo, reseñas y reservas gestionadas desde el panel.`,
    theme: themes[input.sector],
    contact: {
      ...seed.contact,
      phone: input.phone,
      phoneHref: input.phone ? `tel:+${wa}` : "",
      whatsapp: input.phone,
      whatsappHref: wa ? `https://wa.me/${wa}` : "",
      address: input.address,
      mapsUrl: input.mapsUrl,
      mapEmbedSrc: osmEmbed(lat, lng),
    },
    nav: [
      { href: "#carta", label: labels.catalog },
      { href: "#opiniones", label: "Opiniones" },
      { href: "#contacto", label: "Local" },
    ],
    mobileCta: { call: "Llamar", whatsapp: "WhatsApp", book: labels.book },
    hero: {
      eyebrow: `${input.city || "España"} · ${labels.catalog}`,
      title: `${input.name},`,
      highlight: "listo para recibir clientes",
      subtitle: input.prompt || `Catálogo, opiniones y ${labels.book.toLowerCase()} en la misma plantilla que usan estudios y tiendas locales.`,
      image: photo,
      imageAlt: input.name,
      primaryCta: { label: labels.book, href: "#reservar" },
      secondaryCta: { label: `Ver ${labels.catalog.toLowerCase()}`, href: "#carta" },
    },
    menuSection: {
      eyebrow: labels.catalog,
      title: "Todo se dirige desde el panel",
      subtitle: "Precios, fotos y disponibilidad los edita el dueño. El cliente final no necesita claves.",
      featuredLabel: "Destacado",
    },
    reviewsSection: {
      eyebrow: "Opiniones",
      title: input.reviews.length ? "Lo que ya dicen de ellos" : "Cinco estrellas para empezar",
    },
    contactSection: {
      eyebrow: "Local",
      title: input.address || input.name,
      subtitle: "Horario, mapa y teléfono se corrigen en el panel en un minuto.",
      mapCaption: input.address || "Mapa del local",
    },
    locations: [
      {
        id: "local",
        name: input.name,
        address: input.address || "Dirección en el panel",
        postalCode: input.city,
        phone: input.phone || "600 000 000",
        phoneHref: input.phone ? `tel:+${wa}` : "tel:+34600000000",
        whatsapp: input.phone || "600 000 000",
        mapsUrl: input.mapsUrl,
        note: "El dueño confirma horario y teléfono en su primer acceso al panel.",
        rating: `${input.rating.toFixed(1).replace(".", ",")} en Google`,
      },
    ],
    booking: {
      ...seed.booking,
      eyebrow: "Agenda",
      title: labels.book,
      subtitle: "Nombre, fecha y el detalle llegan al panel. Si hay WhatsApp, también se abre el mensaje al local.",
      submitLabel: labels.book,
      successMessage: "La solicitud ha llegado al panel del negocio.",
      serviceOptions: categories,
      whatsappIntro: `Nueva solicitud para ${input.name}`,
      notesLabel: "Notas",
      notesPlaceholder: "Medidas, madera, fecha aproximada o lo que necesite el local.",
    },
    products,
    reviews: input.reviews,
    googleRating: {
      score: input.rating,
      count: input.reviewCount,
      url: input.mapsUrl,
    },
    seo: {
      title: `${input.name} | ${input.city || "España"}`,
      description: input.prompt?.slice(0, 160) || `${input.name}: ${labels.catalog.toLowerCase()} y ${labels.book.toLowerCase()}.`,
      website: "",
    },
  });
}

export type GenerateInput = {
  mapsUrl?: string;
  prompt?: string;
  photos?: string[];
  businessName?: string;
};

export async function generateSiteContent(input: GenerateInput): Promise<SiteContent> {
  const source = [input.mapsUrl, input.prompt, input.businessName].filter(Boolean).join(" ");
  const place = input.mapsUrl ? await lookupPlace(input.mapsUrl) : null;
  const sector = guessSector(source);
  const guessedCity = place?.city || cityFromText(source);
  const reviews = (place?.reviews ?? [])
    .filter((item) => item.rating >= 4)
    .slice(0, 8)
    .map((item, index) => ({
      id: `r-${index + 1}`,
      author: item.author,
      avatarInitials: item.author
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join(""),
      rating: item.rating,
      date: "reseña pública",
      source: "Google" as const,
      text: item.text,
    }));
  const rating = place?.rating && place.rating >= 4 ? place.rating : 5;
  const photos = (input.photos ?? []).filter(Boolean);

  const heuristic = fallbackContent({
    name: input.businessName || place?.name || "Su negocio",
    sector,
    city: guessedCity,
    address: place?.address || "",
    phone: place?.phone || "",
    mapsUrl: place?.mapsUrl || input.mapsUrl || "",
    lat: place?.lat ?? null,
    lng: place?.lng ?? null,
    prompt: input.prompt || "",
    photos,
    reviews,
    rating,
    reviewCount: place?.reviewCount || reviews.length || 0,
  });

  const ai = client();
  if (!ai) return heuristic;

  try {
    const completion = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: JSON.stringify({
            plantilla_martin: heuristic,
            maps: input.mapsUrl,
            prompt: input.prompt,
            fotos: photos,
            datos_lugar: place,
            instrucciones:
              "Adapta la plantilla Martin a este negocio. Conserva la estructura. Sustituye textos, colores, catálogo y reservas. Usa fotos del cliente. No inventes reseñas si el array viene vacío.",
          }),
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return heuristic;
    return sanitizeSiteContent(JSON.parse(raw), heuristic);
  } catch {
    return heuristic;
  }
}

export async function previewPromptEdit(current: SiteContent, prompt: string): Promise<{ summary: string; next: SiteContent }> {
  const ai = client();
  const fallbackSummary = `Se aplicará el cambio «${prompt}» sobre textos, catálogo, colores o módulos de la plantilla. No se pedirán claves. Todo se seguirá editando desde el panel.`;
  if (!ai) {
    const next = sanitizeSiteContent(
      {
        ...current,
        tagline: prompt.slice(0, 120) || current.tagline,
      },
      current,
    );
    return { summary: fallbackSummary, next };
  }

  try {
    const completion = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${SYSTEM}

El usuario pide un cambio por prompt. Devuelve JSON: { "summary": "texto claro en español de qué va a cambiar y qué NO (nunca claves, Stripe, ni backends ajenos)", "content": { ...SiteContent completo } }.
Solo puedes:
- cambiar estilo, textos, colores, fotos, orden, catálogo, reseñas, horario, locales, reservas
- activar o desactivar features de la plantilla (catalog, reviews, booking, hours, locations)
- añadir funciones de front que se alimenten del panel (filtros de catálogo, destacados, aviso de agotado, formulario de reserva)
Prohibido: pedir API keys, webhooks de terceros en el cliente, analytics con secretos, pagos con Stripe en la web del negocio (los pagos de Vends Hoy son de la plataforma).`,
        },
        {
          role: "user",
          content: JSON.stringify({ contenido_actual: current, prompt }),
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { summary: fallbackSummary, next: current };
    const parsed = JSON.parse(raw) as { summary?: string; content?: unknown };
    return {
      summary: parsed.summary || fallbackSummary,
      next: sanitizeSiteContent(parsed.content ?? current, current),
    };
  } catch {
    return { summary: fallbackSummary, next: current };
  }
}
