"use client";

import type { MenuItem, Review, ShopLocation } from "@config/types";
import type { SiteContent } from "@/lib/content-types";
import type { Booking } from "@/lib/models";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubscribeButton } from "@/components/account/AccountClient";

type SectionId =
  | "ia"
  | "reservas"
  | "portada"
  | "servicios"
  | "opiniones"
  | "locales"
  | "horario"
  | "cita"
  | "textos"
  | "colores"
  | "versiones";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "ia", label: "Editar por escrito" },
  { id: "reservas", label: "Reservas" },
  { id: "portada", label: "Portada" },
  { id: "servicios", label: "Catálogo" },
  { id: "opiniones", label: "Opiniones" },
  { id: "locales", label: "Locales" },
  { id: "horario", label: "Horario" },
  { id: "cita", label: "Cita" },
  { id: "textos", label: "Textos" },
  { id: "colores", label: "Colores" },
  { id: "versiones", label: "Versiones" },
];

const fieldClass =
  "mt-1.5 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none ring-terracotta focus:ring-2";

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className={fieldClass} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
      )}
    </label>
  );
}

function PhotoField({
  label,
  value,
  onChange,
  slug,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  slug: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File) {
    setBusy(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch(`/api/sites/${slug}/panel/upload`, { method: "POST", body });
    const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
    setBusy(false);
    if (!response.ok || !payload?.url) {
      setError(payload?.error || "No se pudo subir la foto.");
      return;
    }
    onChange(payload.url);
  }

  return (
    <div className="text-sm font-medium text-ink">
      <p>{label}</p>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-2 h-32 w-full rounded-2xl object-cover" />
      ) : null}
      <input
        type="file"
        accept="image/*"
        className="mt-2 block w-full text-sm"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
        }}
      />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="O pega el enlace" className={fieldClass} />
      {busy && <p className="mt-1 text-xs text-ink/60">Subiendo foto…</p>}
      {error && <p className="mt-1 text-xs text-terracotta">{error}</p>}
    </div>
  );
}

export function TenantPanel({
  slug,
  initial,
  bookings,
  mustChangePassword,
  remainingPrompts,
  versions,
  plan,
  trialEndsAt,
  inviteUrl,
}: {
  slug: string;
  initial: SiteContent;
  bookings: Booking[];
  mustChangePassword: boolean;
  remainingPrompts: number;
  versions: string[];
  plan: string;
  trialEndsAt: string;
  inviteUrl: string;
}) {
  const router = useRouter();
  const [section, setSection] = useState<SectionId>("ia");
  const [content, setContent] = useState(initial);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [locked, setLocked] = useState(mustChangePassword);
  const [prompt, setPrompt] = useState("");
  const [preview, setPreview] = useState<{ id: string; summary: string; preview: SiteContent; remaining: number } | null>(null);
  const [left, setLeft] = useState(remainingPrompts);

  function patch(partial: Partial<SiteContent>) {
    setContent((current) => ({ ...current, ...partial }));
  }

  async function save() {
    setBusy(true);
    setStatus("");
    const response = await fetch(`/api/sites/${slug}/panel/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const payload = (await response.json().catch(() => null)) as (SiteContent & { error?: string }) | null;
    setBusy(false);
    if (!response.ok || !payload || "error" in payload) {
      setStatus((payload as { error?: string })?.error || "No se pudo guardar.");
      return;
    }
    setContent(payload);
    setStatus("Guardado.");
    router.refresh();
  }

  async function changePassword() {
    setBusy(true);
    const response = await fetch(`/api/sites/${slug}/panel/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(payload?.error || "No se pudo cambiar.");
      return;
    }
    setLocked(false);
    setStatus("Contraseña actualizada.");
  }

  async function askPrompt() {
    setBusy(true);
    setStatus("");
    const response = await fetch(`/api/sites/${slug}/panel/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; id?: string; summary?: string; preview?: SiteContent; remaining?: number }
      | null;
    setBusy(false);
    if (!response.ok || !payload?.id || !payload.preview || !payload.summary) {
      setStatus(payload?.error || "No se pudo preparar el cambio.");
      return;
    }
    setPreview({
      id: payload.id,
      summary: payload.summary,
      preview: payload.preview,
      remaining: payload.remaining ?? left,
    });
    setLeft(payload.remaining ?? left);
  }

  async function applyPrompt() {
    if (!preview) return;
    setBusy(true);
    const response = await fetch(`/api/sites/${slug}/panel/prompt`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: preview.id, preview: preview.preview }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; content?: SiteContent } | null;
    setBusy(false);
    if (!response.ok || !payload?.content) {
      setStatus(payload?.error || "No se aplicó el cambio.");
      return;
    }
    setContent(payload.content);
    setPreview(null);
    setPrompt("");
    setStatus("Cambio aplicado. Puede volver a la versión inicial o a las dos últimas.");
    router.refresh();
  }

  async function restore(label: "initial" | "v1" | "v2") {
    setBusy(true);
    const response = await fetch(`/api/sites/${slug}/panel/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; content?: SiteContent } | null;
    setBusy(false);
    if (!response.ok || !payload?.content) {
      setStatus(payload?.error || "No hay esa versión.");
      return;
    }
    setContent(payload.content);
    setStatus("Versión restaurada.");
    router.refresh();
  }

  if (locked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-4 text-ink">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
          <h1 className="font-display text-4xl">Cambie la contraseña</h1>
          <p className="mt-2 text-sm text-ink/70">Es el primer acceso. Elija una clave de al menos 8 caracteres. La web pública no la usa.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${fieldClass} mt-4`}
          />
          {status && <p className="mt-3 text-sm text-terracotta">{status}</p>}
          <button
            type="button"
            disabled={busy || password.length < 8}
            onClick={() => void changePassword()}
            className="mt-5 w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream disabled:opacity-50"
          >
            Guardar y entrar
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-20 border-b border-sand bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">Panel</p>
            <p className="font-display text-2xl">{content.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/s/${slug}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-sand">
              Ver la web
            </a>
            {plan !== "active" && <SubscribeButton slug={slug} />}
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-cream disabled:opacity-50"
            >
              {busy ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
        {status && <p className="mx-auto max-w-6xl px-4 pb-3 text-sm text-olive">{status}</p>}
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[210px_1fr]">
        <nav className="flex gap-2 overflow-auto md:flex-col">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`rounded-full px-4 py-2 text-left text-sm font-semibold ${
                section === item.id ? "bg-ink text-cream" : "bg-white text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-5 rounded-3xl bg-white p-5 shadow-card md:p-8">
          {section === "ia" && (
            <>
              <p className="text-sm text-olive">
                {left} ediciones restantes hoy. Antes de aplicar verá qué cambia. Solo se toca estilo, catálogo, reseñas,
                reservas y módulos de la plantilla. No se piden claves.
              </p>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} className={fieldClass} placeholder="Ejemplo: paleta más clara, filtro por categoría en el catálogo y el botón de reserva más visible." />
              <button type="button" disabled={busy || !prompt} onClick={() => void askPrompt()} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream disabled:opacity-50">
                Preparar el cambio
              </button>
              {preview && (
                <div className="space-y-3 rounded-2xl bg-foam p-5">
                  <p className="font-semibold">Esto es lo que se va a hacer</p>
                  <p className="text-sm leading-relaxed">{preview.summary}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void applyPrompt()} className="rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-cream">
                      Aplicar
                    </button>
                    <button type="button" onClick={() => setPreview(null)} className="rounded-full px-5 py-2 text-sm">
                      Descartar
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-olive">Prueba hasta {new Date(trialEndsAt).toLocaleString("es-ES")}. Plan: {plan}.</p>
              <p className="text-xs text-olive">Invite a otro negocio: {inviteUrl}</p>
            </>
          )}

          {section === "reservas" && (
            <div className="space-y-4">
              {!bookings.length && <p className="text-sm text-olive">Aún no hay reservas. Llegan aquí y, si hay WhatsApp, también al teléfono del local.</p>}
              {bookings.map((item) => (
                <article key={item.id} className="rounded-2xl bg-cream p-4 text-sm">
                  <p className="font-semibold">{item.name}</p>
                  <p>
                    {item.service} · {item.date} {item.time}
                  </p>
                  <p className="text-olive">{item.phone} {item.notes}</p>
                </article>
              ))}
            </div>
          )}

          {section === "portada" && (
            <>
              <Field label="Nombre del negocio" value={content.name} onChange={(name) => patch({ name })} />
              <Field label="Frase corta" value={content.tagline} onChange={(tagline) => patch({ tagline })} />
              <Field label="Antetítulo" value={content.hero.eyebrow} onChange={(eyebrow) => patch({ hero: { ...content.hero, eyebrow } })} />
              <Field label="Título" value={content.hero.title} onChange={(title) => patch({ hero: { ...content.hero, title } })} />
              <Field label="Palabra destacada" value={content.hero.highlight} onChange={(highlight) => patch({ hero: { ...content.hero, highlight } })} />
              <Field label="Texto de la portada" value={content.hero.subtitle} textarea onChange={(subtitle) => patch({ hero: { ...content.hero, subtitle } })} />
              <PhotoField slug={slug} label="Foto grande" value={content.hero.image} onChange={(image) => patch({ hero: { ...content.hero, image } })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ciudad" value={content.city} onChange={(city) => patch({ city })} />
                <Field label="Barrio" value={content.neighborhood} onChange={(neighborhood) => patch({ neighborhood })} />
              </div>
            </>
          )}

          {section === "servicios" && (
            <>
              <Field label="Título de la sección" value={content.menuSection.title} onChange={(title) => patch({ menuSection: { ...content.menuSection, title } })} />
              {content.products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  slug={slug}
                  product={product}
                  onChange={(next) => {
                    const products = content.products.slice();
                    products[index] = next;
                    patch({ products });
                  }}
                  onDelete={() => patch({ products: content.products.filter((item) => item.id !== product.id) })}
                />
              ))}
              <button
                type="button"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream"
                onClick={() =>
                  patch({
                    products: [
                      ...content.products,
                      {
                        id: `srv-${Date.now()}`,
                        name: "Nuevo ítem",
                        category: "Catálogo",
                        price: 0,
                        description: "",
                        agotado: false,
                        image: "",
                        order: content.products.length + 1,
                        featured: false,
                        tags: [],
                      },
                    ],
                  })
                }
              >
                Añadir al catálogo
              </button>
            </>
          )}

          {section === "opiniones" && (
            <>
              <Field label="Título" value={content.reviewsSection.title} onChange={(title) => patch({ reviewsSection: { ...content.reviewsSection, title } })} />
              {content.reviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onChange={(next) => {
                    const reviews = content.reviews.slice();
                    reviews[index] = next;
                    patch({ reviews });
                  }}
                  onDelete={() => patch({ reviews: content.reviews.filter((item) => item.id !== review.id) })}
                />
              ))}
            </>
          )}

          {section === "locales" &&
            content.locations.map((shop, index) => (
              <LocationCard
                key={shop.id}
                shop={shop}
                onChange={(next) => {
                  const locations = content.locations.slice();
                  locations[index] = next;
                  patch({ locations });
                }}
                onDelete={() => patch({ locations: content.locations.filter((item) => item.id !== shop.id) })}
              />
            ))}

          {section === "horario" &&
            content.hours.map((day, index) => (
              <div key={day.day} className="grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_8rem_8rem_auto]">
                <Field
                  label="Día"
                  value={day.label}
                  onChange={(label) => {
                    const hours = content.hours.slice();
                    hours[index] = { ...day, label };
                    patch({ hours });
                  }}
                />
                <Field
                  label="Abre"
                  value={day.lunch.open || ""}
                  onChange={(open) => {
                    const hours = content.hours.slice();
                    hours[index] = { ...day, lunch: { ...day.lunch, open } };
                    patch({ hours });
                  }}
                />
                <Field
                  label="Cierra"
                  value={day.lunch.close || ""}
                  onChange={(close) => {
                    const hours = content.hours.slice();
                    hours[index] = { ...day, lunch: { ...day.lunch, close } };
                    patch({ hours });
                  }}
                />
                <label className="flex items-end gap-2 pb-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={day.closed}
                    onChange={(event) => {
                      const hours = content.hours.slice();
                      hours[index] = { ...day, closed: event.target.checked };
                      patch({ hours });
                    }}
                  />
                  Cerrado
                </label>
              </div>
            ))}

          {section === "cita" && (
            <>
              <Field label="Título" value={content.booking.title} onChange={(title) => patch({ booking: { ...content.booking, title } })} />
              <Field
                label="Servicios del desplegable, uno por línea"
                value={content.booking.serviceOptions.join("\n")}
                textarea
                onChange={(value) =>
                  patch({
                    booking: {
                      ...content.booking,
                      serviceOptions: value.split("\n").map((item) => item.trim()).filter(Boolean),
                    },
                  })
                }
              />
              <Field label="WhatsApp" value={content.contact.whatsapp} onChange={(whatsapp) => patch({ contact: { ...content.contact, whatsapp } })} />
            </>
          )}

          {section === "textos" && (
            <>
              <Field label="Descripción" value={content.description} textarea onChange={(description) => patch({ description })} />
              <Field label="Teléfono" value={content.contact.phone} onChange={(phone) => patch({ contact: { ...content.contact, phone } })} />
              <Field label="Email" value={content.contact.email} onChange={(email) => patch({ contact: { ...content.contact, email } })} />
            </>
          )}

          {section === "colores" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["ink", "Tinta"],
                  ["cream", "Crema"],
                  ["sand", "Arena"],
                  ["terracotta", "Terracota"],
                  ["gold", "Oro"],
                  ["olive", "Oliva"],
                  ["foam", "Espuma"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="text-sm font-medium">
                  {label}
                  <input
                    type="color"
                    value={content.theme[key]}
                    onChange={(event) => patch({ theme: { ...content.theme, [key]: event.target.value } })}
                    className="mt-1.5 h-12 w-full rounded-2xl border border-sand bg-white"
                  />
                </label>
              ))}
            </div>
          )}

          {section === "versiones" && (
            <div className="space-y-3">
              <p className="text-sm text-olive">Puede volver a la web recién generada y a las dos últimas ediciones por escrito.</p>
              <button type="button" onClick={() => void restore("initial")} className="mr-2 rounded-full bg-ink px-5 py-2 text-sm text-cream">
                Versión inicial
              </button>
              {versions.includes("v2") && (
                <button type="button" onClick={() => void restore("v2")} className="mr-2 rounded-full bg-white px-5 py-2 text-sm ring-1 ring-sand">
                  Última
                </button>
              )}
              {versions.includes("v1") && (
                <button type="button" onClick={() => void restore("v1")} className="rounded-full bg-white px-5 py-2 text-sm ring-1 ring-sand">
                  Anterior
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onChange,
  onDelete,
  slug,
}: {
  product: MenuItem;
  onChange: (product: MenuItem) => void;
  onDelete: () => void;
  slug: string;
}) {
  return (
    <article className="space-y-3 rounded-2xl bg-cream p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" value={product.name} onChange={(name) => onChange({ ...product, name })} />
        <Field label="Categoría" value={product.category} onChange={(category) => onChange({ ...product, category })} />
        <Field
          label="Precio (0 = consultar)"
          value={String(product.price)}
          onChange={(price) => onChange({ ...product, price: Number(price.replace(",", ".")) || 0 })}
        />
      </div>
      <Field label="Descripción" value={product.description} textarea onChange={(description) => onChange({ ...product, description })} />
      <PhotoField slug={slug} label="Foto" value={product.image} onChange={(image) => onChange({ ...product, image })} />
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={Boolean(product.featured)} onChange={(e) => onChange({ ...product, featured: e.target.checked })} />
          Destacado
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={product.agotado} onChange={(e) => onChange({ ...product, agotado: e.target.checked })} />
          Agotado
        </label>
        <button type="button" onClick={onDelete} className="text-terracotta">
          Quitar
        </button>
      </div>
    </article>
  );
}

function ReviewCard({
  review,
  onChange,
  onDelete,
}: {
  review: Review;
  onChange: (review: Review) => void;
  onDelete: () => void;
}) {
  return (
    <article className="space-y-3 rounded-2xl bg-cream p-4">
      <Field label="Nombre" value={review.author} onChange={(author) => onChange({ ...review, author })} />
      <Field label="Texto" value={review.text} textarea onChange={(text) => onChange({ ...review, text })} />
      <button type="button" onClick={onDelete} className="text-sm text-terracotta">
        Quitar
      </button>
    </article>
  );
}

function LocationCard({
  shop,
  onChange,
  onDelete,
}: {
  shop: ShopLocation;
  onChange: (shop: ShopLocation) => void;
  onDelete: () => void;
}) {
  return (
    <article className="space-y-3 rounded-2xl bg-cream p-4">
      <Field label="Nombre" value={shop.name} onChange={(name) => onChange({ ...shop, name })} />
      <Field label="Dirección" value={shop.address} onChange={(address) => onChange({ ...shop, address })} />
      <Field label="Teléfono" value={shop.phone} onChange={(phone) => onChange({ ...shop, phone })} />
      <Field label="Nota" value={shop.note} textarea onChange={(note) => onChange({ ...shop, note })} />
      <button type="button" onClick={onDelete} className="text-sm text-terracotta">
        Quitar
      </button>
    </article>
  );
}
