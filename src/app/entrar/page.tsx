"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_NAME } from "@/lib/brand";

export default function EntrarPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/cuenta";
  const invite = useMemo(() => {
    try {
      const url = new URL(next, "https://ideia.builders");
      return url.searchParams.get("invite") || "";
    } catch {
      return "";
    }
  }, [next]);
  const [mode, setMode] = useState<"entrar" | "crear">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const endpoint = mode === "crear" ? "/api/auth/register" : "/api/auth/login";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, invite }),
    });
    setBusy(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "No se pudo continuar.");
      return;
    }
    router.push(next.startsWith("/") ? next : "/cuenta");
    router.refresh();
  }

  const field = "mt-1.5 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none ring-terracotta/40 focus:ring-2";

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[32px] border border-ink/[0.08] bg-white p-8 shadow-card">
        <p className="text-xs uppercase tracking-[0.22em] text-terracotta">{APP_NAME}</p>
        <h1 className="mt-2 font-display text-4xl">{mode === "entrar" ? "Entrar" : "Crear cuenta"}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">
          La prueba de un día empieza al iniciar sesión y publicar la web. Sin cuenta no hay cortesía ni panel.
        </p>
        <div className="mt-5 grid grid-cols-2 rounded-full bg-paper p-1 text-sm">
          <button type="button" onClick={() => setMode("entrar")} className={`rounded-full py-2 ${mode === "entrar" ? "bg-white font-semibold shadow-sm" : "text-ink/60"}`}>
            Ya tengo cuenta
          </button>
          <button type="button" onClick={() => setMode("crear")} className={`rounded-full py-2 ${mode === "crear" ? "bg-white font-semibold shadow-sm" : "text-ink/60"}`}>
            Soy nuevo
          </button>
        </div>
        {mode === "crear" && (
          <label className="mt-6 block text-sm">
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
          </label>
        )}
        <label className={`${mode === "crear" ? "mt-4" : "mt-6"} block text-sm`}>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </label>
        <label className="mt-4 block text-sm">
          Contraseña
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </label>
        {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
        <button disabled={busy} className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-50">
          {busy ? "Un momento…" : mode === "entrar" ? "Entrar" : "Crear cuenta y continuar"}
        </button>
        <p className="mt-4 text-sm text-ink/50">
          Después podrá generar la web con Maps, fotos o un brief.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/" className="text-terracotta">
            Volver al inicio
          </Link>
        </p>
      </form>
    </main>
  );
}
