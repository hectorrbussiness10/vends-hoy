"use client";

import type { MenuItem, Review, ShopLocation } from "@config/types";
import type { SiteContent } from "@/lib/site-content";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SectionId =
  | "portada"
  | "servicios"
  | "opiniones"
  | "locales"
  | "horario"
  | "cita"
  | "textos"
  | "colores";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "portada", label: "Portada" },
  { id: "servicios", label: "Servicios" },
  { id: "opiniones", label: "Opiniones" },
  { id: "locales", label: "Locales" },
  { id: "horario", label: "Horario" },
  { id: "cita", label: "Cita" },
  { id: "textos", label: "Textos" },
  { id: "colores", label: "Colores" },
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File) {
    setBusy(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/panel/upload", { method: "POST", body });
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
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="O pega el enlace de una foto"
        className={fieldClass}
      />
      {busy && <p className="mt-1 text-xs text-ink/60">Subiendo foto…</p>}
      {error && <p className="mt-1 text-xs text-terracotta">{error}</p>}
    </div>
  );
}

export function PanelApp({ initial, readOnly = false }: { initial: SiteContent; readOnly?: boolean }) {
  const router = useRouter();
  const [section, setSection] = useState<SectionId>("portada");
  const [content, setContent] = useState(initial);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function patch(partial: Partial<SiteContent>) {
    setContent((current) => ({ ...current, ...partial }));
  }

  async function save() {
    if (readOnly) {
      setStatus("Esta vista es de prueba. No se guarda ningún cambio.");
      return;
    }
    setBusy(true);
    setStatus("");
    const response = await fetch("/api/panel/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const payload = (await response.json().catch(() => null)) as (SiteContent & { error?: string }) | null;
    setBusy(false);
    if (!response.ok || !payload || payload.error) {
      setStatus(payload?.error || "No se pudo guardar.");
      return;
    }
    setContent(payload);
    setStatus("Guardado. Recarga la web para verlo.");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/panel/logout", { method: "POST" });
    router.refresh();
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
            <a href="/" className="rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-sand">
              Ver la web
            </a>
            {!readOnly && (
              <button type="button" onClick={() => void logout()} className="rounded-full px-4 py-2 text-sm text-ink/70">
                Salir
              </button>
            )}
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy || readOnly}
              className="rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-cream disabled:opacity-50"
            >
              {readOnly ? "Solo vista" : busy ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
        {readOnly && (
          <p className="mx-auto max-w-6xl px-4 pb-3 text-sm text-olive">
            Vista de prueba de {content.name}. Se puede recorrer el panel para ver cómo funcionaría. Desde aquí no se cambia nada.
          </p>
        )}
        {status && <p className="mx-auto max-w-6xl px-4 pb-3 text-sm text-olive">{status}</p>}
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[200px_1fr]">
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

        <fieldset disabled={readOnly} className="min-w-0 space-y-5 rounded-3xl bg-white p-5 shadow-card disabled:opacity-95 md:p-8">
          {section === "portada" && (
            <>
              <Field label="Nombre del negocio" value={content.name} onChange={(name) => patch({ name })} />
              <Field label="Frase corta" value={content.tagline} onChange={(tagline) => patch({ tagline })} />
              <Field
                label="Antetítulo"
                value={content.hero.eyebrow}
                onChange={(eyebrow) => patch({ hero: { ...content.hero, eyebrow } })}
              />
              <Field
                label="Título"
                value={content.hero.title}
                onChange={(title) => patch({ hero: { ...content.hero, title } })}
              />
              <Field
                label="Palabra destacada"
                value={content.hero.highlight}
                onChange={(highlight) => patch({ hero: { ...content.hero, highlight } })}
              />
              <Field
                label="Texto de la portada"
                value={content.hero.subtitle}
                textarea
                onChange={(subtitle) => patch({ hero: { ...content.hero, subtitle } })}
              />
              <Field
                label="Botón principal"
                value={content.hero.primaryCta.label}
                onChange={(label) =>
                  patch({ hero: { ...content.hero, primaryCta: { ...content.hero.primaryCta, label } } })
                }
              />
              <Field
                label="Botón secundario"
                value={content.hero.secondaryCta.label}
                onChange={(label) =>
                  patch({ hero: { ...content.hero, secondaryCta: { ...content.hero.secondaryCta, label } } })
                }
              />
              <PhotoField
                label="Foto grande"
                value={content.hero.image}
                onChange={(image) => patch({ hero: { ...content.hero, image } })}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Barrio"
                  value={content.neighborhood}
                  onChange={(neighborhood) => patch({ neighborhood })}
                />
                <Field label="Ciudad" value={content.city} onChange={(city) => patch({ city })} />
                <Field
                  label="Nota de Google"
                  value={String(content.googleRating.score)}
                  onChange={(score) =>
                    patch({ googleRating: { ...content.googleRating, score: Number(score) || 0 } })
                  }
                />
              </div>
            </>
          )}

          {section === "servicios" && (
            <>
              <Field
                label="Antetítulo de la sección"
                value={content.menuSection.eyebrow}
                onChange={(eyebrow) => patch({ menuSection: { ...content.menuSection, eyebrow } })}
              />
              <Field
                label="Título"
                value={content.menuSection.title}
                onChange={(title) => patch({ menuSection: { ...content.menuSection, title } })}
              />
              <Field
                label="Texto"
                value={content.menuSection.subtitle || ""}
                textarea
                onChange={(subtitle) => patch({ menuSection: { ...content.menuSection, subtitle } })}
              />
              <Field
                label="Etiqueta del destacado"
                value={content.menuSection.featuredLabel}
                onChange={(featuredLabel) => patch({ menuSection: { ...content.menuSection, featuredLabel } })}
              />
              {content.products.map((product, index) => (
                <ProductCard
                  key={product.id}
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
                        name: "Nuevo servicio",
                        category: "Servicios",
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
                Añadir servicio
              </button>
            </>
          )}

          {section === "opiniones" && (
            <>
              <Field
                label="Antetítulo"
                value={content.reviewsSection.eyebrow}
                onChange={(eyebrow) => patch({ reviewsSection: { ...content.reviewsSection, eyebrow } })}
              />
              <Field
                label="Título"
                value={content.reviewsSection.title}
                onChange={(title) => patch({ reviewsSection: { ...content.reviewsSection, title } })}
              />
              <Field
                label="Número de reseñas"
                value={String(content.googleRating.count)}
                onChange={(count) =>
                  patch({ googleRating: { ...content.googleRating, count: Number(count) || 0 } })
                }
              />
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
              <button
                type="button"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream"
                onClick={() =>
                  patch({
                    reviews: [
                      ...content.reviews,
                      {
                        id: `r-${Date.now()}`,
                        author: "Nombre",
                        avatarInitials: "NN",
                        rating: 5,
                        date: "reseña pública",
                        source: "Google",
                        text: "",
                      },
                    ],
                  })
                }
              >
                Añadir opinión
              </button>
            </>
          )}

          {section === "locales" && (
            <>
              <Field
                label="Antetítulo"
                value={content.contactSection.eyebrow}
                onChange={(eyebrow) => patch({ contactSection: { ...content.contactSection, eyebrow } })}
              />
              <Field
                label="Título"
                value={content.contactSection.title}
                onChange={(title) => patch({ contactSection: { ...content.contactSection, title } })}
              />
              <Field
                label="Texto"
                value={content.contactSection.subtitle || ""}
                textarea
                onChange={(subtitle) => patch({ contactSection: { ...content.contactSection, subtitle } })}
              />
              <Field
                label="Pie del mapa"
                value={content.contactSection.mapCaption}
                onChange={(mapCaption) => patch({ contactSection: { ...content.contactSection, mapCaption } })}
              />
              {content.locations.map((shop, index) => (
                <LocationCard
                  key={shop.id}
                  shop={shop}
                  onChange={(next) => {
                    const locations = content.locations.slice();
                    locations[index] = next;
                    patch({ locations });
                  }}
                  onDelete={() =>
                    patch({ locations: content.locations.filter((item) => item.id !== shop.id) })
                  }
                />
              ))}
              <button
                type="button"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream"
                onClick={() =>
                  patch({
                    locations: [
                      ...content.locations,
                      {
                        id: `local-${Date.now()}`,
                        name: "Nuevo local",
                        address: "Calle",
                        postalCode: "",
                        phone: "600000000",
                        phoneHref: "tel:+34600000000",
                        whatsapp: "600000000",
                        mapsUrl: "",
                        note: "",
                      },
                    ],
                  })
                }
              >
                Añadir local
              </button>
            </>
          )}

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
              <Field
                label="Antetítulo"
                value={content.booking.eyebrow}
                onChange={(eyebrow) => patch({ booking: { ...content.booking, eyebrow } })}
              />
              <Field
                label="Título"
                value={content.booking.title}
                onChange={(title) => patch({ booking: { ...content.booking, title } })}
              />
              <Field
                label="Texto"
                value={content.booking.subtitle}
                textarea
                onChange={(subtitle) => patch({ booking: { ...content.booking, subtitle } })}
              />
              <Field
                label="Botón"
                value={content.booking.submitLabel}
                onChange={(submitLabel) => patch({ booking: { ...content.booking, submitLabel } })}
              />
              <Field
                label="Mensaje al enviar"
                value={content.booking.successMessage}
                onChange={(successMessage) => patch({ booking: { ...content.booking, successMessage } })}
              />
              <Field
                label="Primera línea del WhatsApp"
                value={content.booking.whatsappIntro}
                onChange={(whatsappIntro) => patch({ booking: { ...content.booking, whatsappIntro } })}
              />
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
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Botón llamar"
                  value={content.mobileCta.call}
                  onChange={(call) => patch({ mobileCta: { ...content.mobileCta, call } })}
                />
                <Field
                  label="Botón WhatsApp"
                  value={content.mobileCta.whatsapp}
                  onChange={(whatsapp) => patch({ mobileCta: { ...content.mobileCta, whatsapp } })}
                />
                <Field
                  label="Botón cita"
                  value={content.mobileCta.book}
                  onChange={(book) => patch({ mobileCta: { ...content.mobileCta, book } })}
                />
              </div>
            </>
          )}

          {section === "textos" && (
            <>
              <Field
                label="Descripción del pie"
                value={content.description}
                textarea
                onChange={(description) => patch({ description })}
              />
              <Field
                label="Nombre legal"
                value={content.legalName}
                onChange={(legalName) => patch({ legalName })}
              />
              <Field
                label="Teléfono principal"
                value={content.contact.phone}
                onChange={(phone) => patch({ contact: { ...content.contact, phone } })}
              />
              <Field
                label="WhatsApp principal"
                value={content.contact.whatsapp}
                onChange={(whatsapp) => patch({ contact: { ...content.contact, whatsapp } })}
              />
              <Field
                label="Email"
                value={content.contact.email}
                onChange={(email) => patch({ contact: { ...content.contact, email } })}
              />
              <Field
                label="Instagram"
                value={content.contact.instagram || ""}
                onChange={(instagram) => patch({ contact: { ...content.contact, instagram } })}
              />
              <Field
                label="Título de Google"
                value={content.seo.title}
                onChange={(title) => patch({ seo: { ...content.seo, title } })}
              />
              <Field
                label="Descripción de Google"
                value={content.seo.description}
                textarea
                onChange={(description) => patch({ seo: { ...content.seo, description } })}
              />
              {content.nav.map((link, index) => (
                <Field
                  key={link.href}
                  label={`Menú ${index + 1}`}
                  value={link.label}
                  onChange={(label) => {
                    const nav = content.nav.slice();
                    nav[index] = { ...link, label };
                    patch({ nav });
                  }}
                />
              ))}
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
        </fieldset>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onChange,
  onDelete,
}: {
  product: MenuItem;
  onChange: (product: MenuItem) => void;
  onDelete: () => void;
}) {
  return (
    <article className="space-y-3 rounded-2xl bg-cream p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" value={product.name} onChange={(name) => onChange({ ...product, name })} />
        <Field label="Categoría" value={product.category} onChange={(category) => onChange({ ...product, category })} />
        <Field
          label="Precio (0 = a consultar)"
          value={String(product.price)}
          onChange={(price) => onChange({ ...product, price: Number(price.replace(",", ".")) || 0 })}
        />
        <Field
          label="Orden"
          value={String(product.order ?? "")}
          onChange={(order) => onChange({ ...product, order: Number(order) || 0 })}
        />
      </div>
      <Field
        label="Descripción"
        value={product.description}
        textarea
        onChange={(description) => onChange({ ...product, description })}
      />
      <PhotoField label="Foto" value={product.image} onChange={(image) => onChange({ ...product, image })} />
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(product.featured)}
            onChange={(event) => onChange({ ...product, featured: event.target.checked })}
          />
          Destacado
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={product.agotado}
            onChange={(event) => onChange({ ...product, agotado: event.target.checked })}
          />
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
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" value={review.author} onChange={(author) => onChange({ ...review, author })} />
        <Field
          label="Estrellas (1-5)"
          value={String(review.rating)}
          onChange={(rating) => onChange({ ...review, rating: Number(rating) || 5 })}
        />
      </div>
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
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Teléfono" value={shop.phone} onChange={(phone) => onChange({ ...shop, phone })} />
        <Field label="WhatsApp" value={shop.whatsapp} onChange={(whatsapp) => onChange({ ...shop, whatsapp })} />
      </div>
      <Field label="Nota" value={shop.note} textarea onChange={(note) => onChange({ ...shop, note })} />
      <Field label="Valoración" value={shop.rating || ""} onChange={(rating) => onChange({ ...shop, rating })} />
      <Field label="Enlace del mapa" value={shop.mapsUrl} onChange={(mapsUrl) => onChange({ ...shop, mapsUrl })} />
      <button type="button" onClick={onDelete} className="text-sm text-terracotta">
        Quitar
      </button>
    </article>
  );
}
