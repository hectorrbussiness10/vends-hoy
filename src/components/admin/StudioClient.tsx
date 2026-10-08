"use client";

import { FormEvent, useMemo, useState } from "react";

type Stats = {
  accounts: number;
  loginsUnique: number;
  loginsTotal: number;
  trialsStarted: number;
  sitesConfigured: number;
  paying: number;
  recentLogins: { email: string; at: string }[];
  sites: { slug: string; name: string; email: string; plan: string; configured: boolean; createdAt: string }[];
};

type ChatTurn = { role: "user" | "assistant"; content: string };

export function StudioClient({ initial }: { initial: Stats }) {
  const [stats, setStats] = useState(initial);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const cards = useMemo(
    () => [
      { label: "Cuentas creadas", value: stats.accounts, hint: "Gente que se registró" },
      { label: "Han iniciado sesión", value: stats.loginsUnique, hint: `${stats.loginsTotal} entradas en total` },
      { label: "Prueba + web", value: stats.trialsStarted, hint: "Publicaron un negocio" },
      { label: "Configuraron el panel", value: stats.sitesConfigured, hint: "Cambiaron clave o aplicaron un prompt" },
      { label: "Pagan", value: stats.paying, hint: "Suscripción activa" },
    ],
    [stats],
  );

  async function ask(event: FormEvent) {
    event.preventDefault();
    const message = question.trim();
    if (!message) return;
    setBusy(true);
    setError("");
    setQuestion("");
    const nextChat = [...chat, { role: "user" as const, content: message }];
    setChat(nextChat);
    const response = await fetch("/api/admin/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: nextChat }),
    });
    const payload = (await response.json().catch(() => null)) as { reply?: string; error?: string; stats?: Stats } | null;
    setBusy(false);
    if (!response.ok || !payload?.reply) {
      setError(payload?.error || "No se pudo consultar.");
      return;
    }
    setChat([...nextChat, { role: "assistant", content: payload.reply }]);
    if (payload.stats) setStats(payload.stats);
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <article key={card.label} className="rounded-[24px] border border-ink/[0.08] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/45">{card.label}</p>
            <p className="mt-2 font-display text-4xl">{card.value}</p>
            <p className="mt-2 text-xs text-ink/50">{card.hint}</p>
          </article>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-ink/[0.08] bg-white p-6">
          <h2 className="font-display text-2xl">Webs publicadas</h2>
          <div className="mt-4 space-y-3 text-sm">
            {stats.sites.length === 0 && <p className="text-ink/50">Aún no hay negocios.</p>}
            {stats.sites.map((site) => (
              <div key={site.slug} className="flex flex-wrap justify-between gap-2 rounded-2xl bg-paper px-4 py-3">
                <div>
                  <p className="font-medium">{site.name}</p>
                  <p className="text-xs text-ink/50">{site.email} · /s/{site.slug}</p>
                </div>
                <p className="text-xs uppercase tracking-wide text-ink/45">
                  {site.plan}
                  {site.configured ? " · panel tocado" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-ink/[0.08] bg-white p-6">
          <h2 className="font-display text-2xl">Preguntar a la IA</h2>
          <p className="mt-2 text-sm text-ink/55">
            Pregunte por sesiones, pruebas o pagos. La respuesta usa los números de ahora mismo, no un informe viejo.
          </p>
          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto text-sm">
            {chat.length === 0 && <p className="text-ink/40">Ejemplo: «¿cuánta gente ha activado la prueba esta semana?»</p>}
            {chat.map((turn, index) => (
              <p key={`${turn.role}-${index}`} className={turn.role === "user" ? "text-ink" : "rounded-2xl bg-paper px-3 py-2 text-ink/80"}>
                {turn.role === "user" ? `Usted: ${turn.content}` : turn.content}
              </p>
            ))}
          </div>
          <form onSubmit={(event) => void ask(event)} className="mt-4 flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 rounded-full border border-ink/10 px-4 py-2 text-sm outline-none ring-terracotta/30 focus:ring-2"
              placeholder="Pregunte por la app…"
            />
            <button disabled={busy} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
              {busy ? "…" : "Enviar"}
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-terracotta">{error}</p>}
        </div>
      </section>
    </div>
  );
}
