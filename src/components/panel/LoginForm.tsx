"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ businessName }: { businessName: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/panel/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "No se pudo entrar.");
      return;
    }
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">{businessName}</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Panel de la web</h1>
        <p className="mt-2 text-sm text-ink/70">Entra para cambiar textos, precios y fotos.</p>
        <label className="mt-6 block text-sm font-medium text-ink">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-sand bg-cream px-4 py-3 outline-none ring-terracotta focus:ring-2"
            autoFocus
          />
        </label>
        {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink text-sm font-semibold text-cream disabled:opacity-50"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
