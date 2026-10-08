"use client";

import { FormEvent, useMemo, useState } from "react";
import type { SiteContent } from "@/lib/content-types";
import { SECTOR_LABELS } from "@/lib/content-types";

function formatPrice(price: number) {
  if (!price) return "Consultar";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(price);
}

function stars(score: number) {
  const full = Math.round(Math.min(5, Math.max(4, score)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

export function BusinessSite({
  content,
  slug,
  paused,
}: {
  content: SiteContent;
  slug: string;
  paused?: boolean;
}) {
  const labels = SECTOR_LABELS[content.sector];
  const [sent, setSent] = useState("");
  const [busy, setBusy] = useState(false);
  const theme = content.theme;
  const style = useMemo(
    () =>
      ({
        "--ink": theme.ink,
        "--cream": theme.cream,
        "--sand": theme.sand,
        "--terracotta": theme.terracotta,
        "--gold": theme.gold,
        "--olive": theme.olive,
        "--foam": theme.foam,
      }) as React.CSSProperties,
    [theme],
  );

  async function onBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSent("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`/api/sites/${slug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
    setBusy(false);
    if (!response.ok) {
      setSent(body?.error || "No se pudo enviar. Inténtelo de nuevo.");
      return;
    }
    setSent(content.booking.successMessage);
    const wa = content.contact.whatsappHref;
    if (wa) {
      const text = [
        content.booking.whatsappIntro,
        `Nombre: ${payload.nombre || ""}`,
        `Servicio: ${payload.servicio || ""}`,
        `Fecha: ${payload.fecha || ""} ${payload.hora || ""}`,
        payload.notas ? `Notas: ${payload.notas}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      window.open(`${wa}${wa.includes("?") ? "&" : "?"}text=${encodeURIComponent(text)}`, "_blank");
    }
  }

  return (
    <div className="site-shell min-h-screen" style={style}>
      {paused && (
        <div className="bg-ink px-4 py-3 text-center text-sm text-cream">
          Esta web está en pausa. El titular puede reactivarla desde el panel suscribiéndose.
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-sand/80 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a href="#inicio" className="font-display text-2xl tracking-tight">
            {content.name}
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {content.nav.map((link) => (
              <a key={link.href} href={link.href} className="text-ink/70 hover:text-ink">
                {link.label}
              </a>
            ))}
            <a href="#reservar" className="rounded-full bg-terracotta px-4 py-2 font-semibold text-cream">
              {content.mobileCta.book}
            </a>
          </nav>
        </div>
      </header>

      <section id="inicio" className="relative overflow-hidden">
        <div className="absolute inset-0">
          {content.hero.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.hero.image} alt={content.hero.imageAlt} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-sand" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/55 to-ink/20" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-24 text-cream md:grid-cols-[1.2fr_0.8fr] md:py-32">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{content.hero.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl leading-tight md:text-7xl">
              {content.hero.title}{" "}
              <em className="not-italic text-gold">{content.hero.highlight}</em>
            </h1>
            <p className="mt-5 max-w-xl text-base text-cream/85 md:text-lg">{content.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={content.hero.primaryCta.href} className="rounded-full bg-terracotta px-6 py-3 text-sm font-semibold">
                {content.hero.primaryCta.label}
              </a>
              <a href={content.hero.secondaryCta.href} className="rounded-full bg-cream/10 px-6 py-3 text-sm font-semibold ring-1 ring-cream/30">
                {content.hero.secondaryCta.label}
              </a>
            </div>
          </div>
          <aside className="self-end rounded-3xl bg-cream/95 p-6 text-ink shadow-card">
            <p className="stars text-lg">{stars(content.googleRating.score)}</p>
            <p className="mt-1 font-display text-4xl">{content.googleRating.score.toFixed(1).replace(".", ",")}</p>
            <p className="text-sm text-olive">
              {content.googleRating.count
                ? `${content.googleRating.count} opiniones · ${content.neighborhood || content.city}`
                : `5 estrellas · ${content.city || "Google"}`}
            </p>
            {content.contact.address && <p className="mt-3 text-sm">{content.contact.address}</p>}
          </aside>
        </div>
      </section>

      {content.features.catalog && (
        <section id="carta" className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">{content.menuSection.eyebrow}</p>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">{content.menuSection.title}</h2>
          {content.menuSection.subtitle && <p className="mt-3 max-w-2xl text-ink/70">{content.menuSection.subtitle}</p>}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-3xl bg-white shadow-card">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt="" className="h-48 w-full object-cover" />
                ) : (
                  <div className="h-48 bg-sand" />
                )}
                <div className="space-y-2 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-olive">{product.category}</p>
                      <h3 className="font-display text-2xl">{product.name}</h3>
                    </div>
                    <p className="text-sm font-semibold text-terracotta">{formatPrice(product.price)}</p>
                  </div>
                  <p className="text-sm text-ink/70">{product.description}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {product.featured && (
                      <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold">{content.menuSection.featuredLabel}</span>
                    )}
                    {product.agotado && <span className="rounded-full bg-sand px-3 py-1 text-xs">Agotado</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {content.features.reviews && (
        <section id="opiniones" className="bg-foam">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">{content.reviewsSection.eyebrow}</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">{content.reviewsSection.title}</h2>
            <p className="mt-2 text-olive">
              {stars(content.googleRating.score)} {content.googleRating.score.toFixed(1)} ·{" "}
              {content.googleRating.count ? `${content.googleRating.count} opiniones` : "5 estrellas del negocio"}
            </p>
            {content.reviews.length ? (
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {content.reviews.map((review) => (
                  <blockquote key={review.id} className="rounded-3xl bg-white p-6 shadow-card">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-xs font-semibold text-cream">
                        {review.avatarInitials}
                      </span>
                      <div>
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-xs text-olive">
                          {review.source} · {stars(review.rating)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-ink/80">“{review.text}”</p>
                  </blockquote>
                ))}
              </div>
            ) : (
              <p className="mt-8 max-w-xl text-sm text-olive">
                Aún no hay reseñas públicas con más de cuatro estrellas. El negocio se presenta con cinco estrellas hasta
                que el panel incorpore opiniones reales.
              </p>
            )}
          </div>
        </section>
      )}

      {content.features.locations && (
        <section id="contacto" className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">{content.contactSection.eyebrow}</p>
            <h2 className="mt-2 font-display text-4xl">{content.contactSection.title}</h2>
            <p className="mt-3 text-ink/70">{content.contactSection.subtitle}</p>
            <div className="mt-8 space-y-4">
              {content.locations.map((shop) => (
                <article key={shop.id} className="rounded-3xl bg-white p-5 shadow-card">
                  <h3 className="font-display text-2xl">{shop.name}</h3>
                  <p className="text-sm text-ink/70">
                    {shop.address} {shop.postalCode ? `· ${shop.postalCode}` : ""}
                  </p>
                  <p className="mt-2 text-sm">{shop.note}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-terracotta">
                    <a href={shop.phoneHref}>Llamar {shop.phone}</a>
                    <a href={shop.mapsUrl} target="_blank" rel="noreferrer">
                      Mapa
                    </a>
                  </div>
                </article>
              ))}
            </div>
            {content.features.hours && (
              <ul className="mt-8 divide-y divide-sand rounded-3xl bg-white px-5 shadow-card">
                {content.hours.map((day) => (
                  <li key={day.day} className="flex justify-between py-3 text-sm">
                    <span>{day.label}</span>
                    <span className="text-olive">
                      {day.closed ? "Cerrado" : `${day.lunch.open ?? "—"} – ${day.lunch.close ?? "—"}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="overflow-hidden rounded-3xl bg-sand shadow-card">
            {content.contact.mapEmbedSrc ? (
              <iframe title="Mapa" src={content.contact.mapEmbedSrc} className="h-[420px] w-full border-0" />
            ) : (
              <div className="grid h-[420px] place-items-center text-sm text-olive">Mapa en el panel</div>
            )}
            <p className="px-4 py-3 text-xs text-olive">{content.contactSection.mapCaption}</p>
          </div>
        </section>
      )}

      {content.features.booking && (
        <section id="reservar" className="bg-ink py-20 text-cream">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{content.booking.eyebrow}</p>
              <h2 className="mt-2 font-display text-4xl">{content.booking.title}</h2>
              <p className="mt-3 text-cream/75">{content.booking.subtitle}</p>
            </div>
            <form onSubmit={onBook} className="space-y-4 rounded-3xl bg-cream p-6 text-ink">
              <label className="block text-sm font-medium">
                Nombre
                <input name="nombre" required className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Teléfono
                  <input name="telefono" className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
                </label>
                <label className="block text-sm font-medium">
                  {labels.item}
                  <select name="servicio" className="mt-1 w-full rounded-2xl border border-sand px-4 py-3">
                    {content.booking.serviceOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Fecha
                  <input name="fecha" type="date" required className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
                </label>
                <label className="block text-sm font-medium">
                  Hora
                  <input
                    name="hora"
                    type="time"
                    defaultValue={content.booking.hourDefault}
                    className="mt-1 w-full rounded-2xl border border-sand px-4 py-3"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium">
                {content.booking.notesLabel}
                <textarea name="notas" rows={3} placeholder={content.booking.notesPlaceholder} className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
              </label>
              {sent && <p className="text-sm text-olive">{sent}</p>}
              <button
                disabled={busy || paused}
                className="w-full rounded-full bg-terracotta py-3 text-sm font-semibold text-cream disabled:opacity-50"
              >
                {busy ? "Enviando…" : content.booking.submitLabel}
              </button>
            </form>
          </div>
        </section>
      )}

      <footer className="border-t border-sand bg-cream px-4 py-10 text-sm text-olive">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p>
            {content.legalName} · {content.city}
          </p>
          <p>Web alojada por Ideia Builders</p>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-px bg-ink p-2 md:hidden">
        <a href={content.contact.phoneHref} className="rounded-full bg-cream py-3 text-center text-xs font-semibold text-ink">
          {content.mobileCta.call}
        </a>
        <a href={content.contact.whatsappHref} className="rounded-full bg-cream py-3 text-center text-xs font-semibold text-ink">
          {content.mobileCta.whatsapp}
        </a>
        <a href="#reservar" className="rounded-full bg-terracotta py-3 text-center text-xs font-semibold text-cream">
          {content.mobileCta.book}
        </a>
      </div>
    </div>
  );
}
