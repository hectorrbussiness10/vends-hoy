"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export function CreateWizard({
  email,
  invite,
  hasAccount,
}: {
  email: string;
  invite: string;
  hasAccount: boolean;
}) {
  const [mapsUrl, setMapsUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<{ slug: string; panelPassword: string; url: string; panel: string } | null>(null);

  useEffect(() => {
    setReady(true);
  }, []);

  async function onFile(file: File) {
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/upload", { method: "POST", body });
    const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!response.ok || !payload?.url) {
      setStatus(payload?.error || "No se pudo subir la foto.");
      return;
    }
    setPhotos((current) => [...current, payload.url!].slice(0, 8));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/sites/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapsUrl, prompt, photos, businessName }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; slug?: string; panelPassword?: string; url?: string; panel?: string }
        | null;
      if (!response.ok || !payload?.slug || !payload.panelPassword) {
        setStatus(payload?.error || "No se pudo crear la web.");
        setBusy(false);
        return;
      }
      setResult({
        slug: payload.slug,
        panelPassword: payload.panelPassword,
        url: payload.url || `/s/${payload.slug}`,
        panel: payload.panel || `/s/${payload.slug}/panel`,
      });
    } catch {
      setStatus("Ha fallado la generación. Pulse de nuevo si lo desea.");
    }
    setBusy(false);
  }

  const field =
    "mt-1.5 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none ring-terracotta/40 focus:ring-2";

  if (!hasAccount) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24">
        <h1 className="font-display text-4xl">Inicie sesión para la prueba</h1>
        <p className="mt-4 text-ink/65">La cortesía de un día solo se activa con una cuenta. {invite ? "Llega con invitación." : ""}</p>
        <Link href={`/entrar?next=${encodeURIComponent("/crear")}`} className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper">
          Entrar
        </Link>
      </main>
    );
  }

  if (result) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20">
        <div className="rounded-[32px] border border-ink/[0.08] bg-white p-8 shadow-card">
          <p className="text-xs uppercase tracking-[0.22em] text-terracotta">Web lista</p>
          <h1 className="mt-3 font-display text-5xl">Ya puede entrar.</h1>
          <p className="mt-4 leading-relaxed text-ink/65">
            Guarde esta contraseña del panel. En el primer acceso deberá cambiarla. Tiene 24 horas de cortesía —porque
            ha iniciado sesión— y cinco ediciones por escrito al día. Sesión: {email}.
          </p>
          <p className="mt-6 rounded-2xl bg-paper px-4 py-3 font-mono text-sm">{result.panelPassword}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={result.url} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper">
              Ver la web
            </Link>
            <Link href={result.panel} className="rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-white">
              Abrir el panel
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="px-4 py-24">
        <p className="mx-auto max-w-2xl text-ink/50">Cargando el formulario…</p>
      </main>
    );
  }

  return (
    <main className="px-4 py-16">
      <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
        <p className="text-xs uppercase tracking-[0.22em] text-terracotta">Alta · {email}</p>
        <h1 className="font-display text-5xl">Cree la web de su negocio</h1>
        <p className="leading-relaxed text-ink/65">
          Pegue Google Maps, describa el oficio y, si quiere, adjunte fotos. Publicamos con catálogo, reseñas, locales y
          reservas. Esta acción inicia su prueba de 24 horas.
        </p>
        <label className="block text-sm">
          Nombre del negocio
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={field} placeholder="Casa Lumen" />
        </label>
        <label className="block text-sm">
          Enlace de Google Maps (opcional)
          <input
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            className={field}
            placeholder="Pegue aquí el enlace de Google Maps"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm">
          Brief o estilo de negocio
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className={field}
            placeholder="Tienda de muebles a medida en Madrid. Madera de roble, piezas de salón y comedor. Quiero presupuesto por WhatsApp."
          />
        </label>
        <div className="text-sm">
          <p>Fotos del local o de las piezas</p>
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onFile(file);
            }}
          />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {photos.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-20 w-full rounded-xl object-cover" />
            ))}
          </div>
        </div>
        {status && <p className="text-sm text-terracotta">{status}</p>}
        <button disabled={busy} className="rounded-full bg-ink px-7 py-3 text-sm font-semibold text-paper disabled:opacity-50">
          {busy ? "Componiendo la web…" : "Generar y publicar"}
        </button>
        <p className="text-xs text-ink/45">
          Un día de prueba ligado a esta sesión. Luego 150 € al mes. {invite ? "Llega con invitación: el anfitrión recibirá 50 € el mes siguiente si usted se suscribe." : ""}
        </p>
      </form>
    </main>
  );
}
