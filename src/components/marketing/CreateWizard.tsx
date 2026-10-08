"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export function CreateWizard({
  email: initialEmail,
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
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<{ slug: string; panelPassword: string; url: string; panel: string } | null>(null);

  useEffect(() => {
    setReady(true);
  }, []);

  async function onFile(file: File) {
    const body = new FormData();
    if (!hasAccount && !email) {
      setStatus("Cree antes la cuenta (email y contraseña) para subir fotos.");
      return;
    }
    if (!hasAccount) {
      if (!email || password.length < 8) {
        setStatus("Escriba email y contraseña de la cuenta antes de subir fotos.");
        return;
      }
      const registered = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, invite }),
      });
      if (!registered.ok && registered.status !== 409) {
        const payload = (await registered.json().catch(() => null)) as { error?: string } | null;
        setStatus(payload?.error || "No se pudo crear la cuenta para subir fotos.");
        return;
      }
      if (registered.status === 409) {
        const login = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!login.ok) {
          setStatus("Ese email ya existe. Entre con la contraseña o use otro.");
          return;
        }
      }
    }
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
      if (!hasAccount) {
        const registered = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, invite }),
        });
        if (!registered.ok && registered.status !== 409) {
          const payload = (await registered.json().catch(() => null)) as { error?: string } | null;
          setStatus(payload?.error || "No se pudo crear la cuenta.");
          setBusy(false);
          return;
        }
        if (registered.status === 409) {
          const login = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!login.ok) {
            setStatus("Ese email ya existe. Entre con la contraseña correcta.");
            setBusy(false);
            return;
          }
        }
      }

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
      setStatus("Ha fallado la generación. No se ha reintentado en bucle: pulse de nuevo si lo desea.");
    }
    setBusy(false);
  }

  if (result) {
    return (
      <main className="min-h-screen bg-[#07080c] px-4 py-24 text-cream">
        <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Web lista</p>
          <h1 className="mt-3 font-display text-5xl">Ya puede entrar.</h1>
          <p className="mt-4 text-cream/75">
            Guarde esta contraseña del panel. En el primer acceso deberá cambiarla. Tiene 24 horas de cortesía y cinco
            ediciones por escrito al día.
          </p>
          <p className="mt-6 rounded-2xl bg-white/5 px-4 py-3 font-mono text-sm">{result.panelPassword}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={result.url} className="rounded-full bg-cream px-5 py-3 text-sm font-semibold text-night">
              Ver la web
            </Link>
            <Link href={result.panel} className="rounded-full bg-terracotta px-5 py-3 text-sm font-semibold">
              Abrir el panel
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const field = "mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-gold focus:ring-2";

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#07080c] px-4 py-24 text-cream">
        <p className="mx-auto max-w-2xl text-cream/60">Cargando el formulario…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07080c] px-4 py-24 text-cream">
      <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Alta</p>
        <h1 className="font-display text-5xl">Cree la web de su negocio</h1>
        <p className="text-cream/70">
          Pegue Google Maps, describa el oficio y, si quiere, adjunte fotos. Usamos la plantilla de Martin: catálogo,
          reseñas, locales y reservas, vestida para su estilo.
        </p>

        {!hasAccount && (
          <div className="grid gap-4 rounded-[28px] border border-white/10 p-6 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              Nombre
              <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
            </label>
            <label className="text-sm">
              Email
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            </label>
            <label className="text-sm">
              Contraseña de la cuenta
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
            </label>
          </div>
        )}

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
        <button disabled={busy} className="rounded-full bg-cream px-7 py-3 text-sm font-semibold text-night disabled:opacity-50">
          {busy ? "Componiendo la web…" : "Generar y publicar"}
        </button>
        <p className="text-xs text-cream/50">
          Un día de prueba. Luego 150 € al mes. {invite ? "Llega con invitación: el anfitrión recibirá 50 € el mes siguiente si usted se suscribe." : ""}
        </p>
        <p className="text-sm text-cream/50">
          ¿Ya tiene cuenta? <Link href="/entrar" className="text-gold">Entre</Link>
        </p>
      </form>
    </main>
  );
}
