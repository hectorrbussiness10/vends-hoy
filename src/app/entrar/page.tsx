"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "No se pudo entrar.");
      return;
    }
    router.push("/cuenta");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07080c] px-4 text-cream">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-[32px] border border-white/10 p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Vends Hoy</p>
        <h1 className="mt-2 font-display text-4xl">Entrar</h1>
        <label className="mt-6 block text-sm">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-2xl bg-white/5 px-4 py-3" />
        </label>
        <label className="mt-4 block text-sm">
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-2xl bg-white/5 px-4 py-3" />
        </label>
        {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
        <button disabled={busy} className="mt-6 w-full rounded-full bg-cream py-3 text-sm font-semibold text-night">
          {busy ? "Entrando…" : "Entrar"}
        </button>
        <p className="mt-4 text-sm text-cream/50">
          ¿Aún no tiene web? <Link href="/crear" className="text-gold">Créela</Link>
        </p>
      </form>
    </main>
  );
}
