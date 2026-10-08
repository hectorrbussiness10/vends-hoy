"use client";

import { useState } from "react";

export function AccountClient({ inviteUrl, rewards }: { inviteUrl: string; rewards: number }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-8 rounded-[28px] border border-ink/[0.08] bg-white p-6">
      <p className="text-sm leading-relaxed text-ink/65">
        Enlace de invitación. Si el negocio invitado se suscribe, usted recibe 50 € de descuento el mes siguiente, solo
        durante un mes, por cada invitado que pague. Créditos pendientes: {rewards}.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <code className="rounded-2xl bg-paper px-4 py-3 text-xs">{inviteUrl}</code>
        <button
          type="button"
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper"
          onClick={async () => {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
          }}
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

export function SubscribeButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
    setBusy(false);
    if (!response.ok || !payload?.url) {
      setError(payload?.error || "No se pudo abrir el pago.");
      return;
    }
    window.location.href = payload.url;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void pay()}
        disabled={busy}
        className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
      >
        {busy ? "Abriendo…" : "Suscribirse 150 €"}
      </button>
      {error && <p className="mt-2 text-xs text-terracotta">{error}</p>}
    </div>
  );
}
