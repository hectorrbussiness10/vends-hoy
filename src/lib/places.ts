type PlaceFacts = {
  name: string;
  address: string;
  city: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  mapsUrl: string;
  rating: number | null;
  reviewCount: number | null;
  reviews: { author: string; rating: number; text: string }[];
  website: string;
  hoursText: string;
};

function parseMapsQuery(input: string): string {
  try {
    const url = new URL(input);
    return (
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      decodeURIComponent(url.pathname.split("/place/")[1]?.split("/")[0] || "") ||
      input
    ).replace(/\+/g, " ");
  } catch {
    return input;
  }
}

async function nominatim(query: string): Promise<Partial<PlaceFacts> | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`,
    { headers: { "User-Agent": "VendsHoy/1.0" }, next: { revalidate: 0 } },
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
    address?: { city?: string; town?: string; village?: string; road?: string; house_number?: string };
  }>;
  const first = rows[0];
  if (!first) return null;
  const city = first.address?.city || first.address?.town || first.address?.village || "";
  const address = [first.address?.road, first.address?.house_number].filter(Boolean).join(" ") || first.display_name;
  return {
    address,
    city,
    lat: Number(first.lat),
    lng: Number(first.lon),
  };
}

async function googlePlace(query: string): Promise<Partial<PlaceFacts> | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  const find = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name&key=${key}`,
  );
  if (!find.ok) return null;
  const found = (await find.json()) as { candidates?: { place_id: string; name: string }[] };
  const placeId = found.candidates?.[0]?.place_id;
  if (!placeId) return null;
  const detail = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,geometry,url,rating,user_ratings_total,reviews,website,opening_hours&key=${key}`,
  );
  if (!detail.ok) return null;
  const body = (await detail.json()) as {
    result?: {
      name?: string;
      formatted_address?: string;
      formatted_phone_number?: string;
      geometry?: { location?: { lat: number; lng: number } };
      url?: string;
      rating?: number;
      user_ratings_total?: number;
      website?: string;
      opening_hours?: { weekday_text?: string[] };
      reviews?: { author_name?: string; rating?: number; text?: string }[];
    };
  };
  const result = body.result;
  if (!result) return null;
  const city = result.formatted_address?.split(",").slice(-2, -1)[0]?.trim() || "";
  return {
    name: result.name,
    address: result.formatted_address,
    city,
    phone: result.formatted_phone_number,
    lat: result.geometry?.location?.lat ?? null,
    lng: result.geometry?.location?.lng ?? null,
    mapsUrl: result.url,
    rating: result.rating ?? null,
    reviewCount: result.user_ratings_total ?? null,
    website: result.website ?? "",
    hoursText: result.opening_hours?.weekday_text?.join(" · ") ?? "",
    reviews: (result.reviews ?? [])
      .filter((item) => (item.rating ?? 0) >= 4 && item.text)
      .map((item) => ({
        author: item.author_name || "Cliente",
        rating: item.rating || 5,
        text: item.text || "",
      })),
  };
}

export async function lookupPlace(mapsOrName: string): Promise<PlaceFacts> {
  const query = parseMapsQuery(mapsOrName).trim();
  const mapsUrl = mapsOrName.startsWith("http") ? mapsOrName : `https://maps.google.com/?q=${encodeURIComponent(query)}`;
  let facts: PlaceFacts = {
    name: query.split(",")[0] || "Negocio",
    address: "",
    city: "",
    phone: "",
    lat: null,
    lng: null,
    mapsUrl,
    rating: null,
    reviewCount: null,
    reviews: [],
    website: "",
    hoursText: "",
  };

  try {
    const google = await googlePlace(query);
    if (google) facts = { ...facts, ...google, mapsUrl: google.mapsUrl || mapsUrl };
  } catch {
    /* una sola pasada: si Places falla, Nominatim */
  }

  if (!facts.lat || !facts.address) {
    try {
      const osm = await nominatim(query);
      if (osm) facts = { ...facts, ...osm };
    } catch {
      /* sin bucle */
    }
  }

  return facts;
}
