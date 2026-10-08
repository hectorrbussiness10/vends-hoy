"use client";

import { useEffect, useRef, useState } from "react";

export function ComputerScroll() {
  const stage = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = stage.current;
    if (!node) return;

    const onScroll = () => {
      const rect = node.getBoundingClientRect();
      const total = node.offsetHeight - window.innerHeight;
      const passed = Math.min(total, Math.max(0, -rect.top));
      setProgress(total > 0 ? passed / total : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const zoom = 1 + progress * 3.4;
  const screenFill = Math.min(1, Math.max(0, (progress - 0.55) / 0.35));
  const roomOpacity = 1 - progress * 0.85;
  const lid = Math.min(1, progress * 1.4);
  const glow = 0.15 + progress * 0.55;

  return (
    <section ref={stage} className="relative h-[280vh] bg-paper">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{ opacity: roomOpacity }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(196,92,62,0.08),_transparent_55%)]" />
          <div className="absolute bottom-0 h-1/3 w-full bg-gradient-to-t from-paper to-transparent" />
        </div>
        <p
          className="absolute top-16 z-10 px-6 text-center font-display text-3xl text-ink/80 md:text-5xl"
          style={{ opacity: 1 - progress * 1.6 }}
        >
          Deslice. Entre en el ordenador.
        </p>
        <div
          className="relative"
          style={{
            transform: `translateY(${(1 - lid) * 40}px) scale(${zoom})`,
            transformOrigin: "50% 42%",
          }}
        >
          <div className="mx-auto w-[min(92vw,720px)]">
            <div className="rounded-[28px] bg-[#2a2723] p-3 computer-glow" style={{ boxShadow: `0 40px 120px rgba(26,24,20,0.28), 0 0 80px rgba(196,92,62,${glow * 0.35})` }}>
              <div className="relative overflow-hidden rounded-[18px] bg-[#f7f2eb]" style={{ aspectRatio: "16 / 10" }}>
                <LaptopSite fill={screenFill} />
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_30%)]"
                  style={{ opacity: 1 - screenFill }}
                />
              </div>
              <div className="mx-auto mt-3 h-2 w-2 rounded-full bg-gold/70" style={{ opacity: 1 - screenFill }} />
            </div>
            <div
              className="mx-auto h-8 w-[220px] rounded-b-2xl bg-[#3a3632]"
              style={{ opacity: 1 - screenFill, transform: `scaleX(${1 - screenFill * 0.4})` }}
            />
            <div className="mx-auto h-2 w-[280px] rounded-full bg-[#cfc6ba]" style={{ opacity: 1 - screenFill }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function LaptopSite({ fill }: { fill: number }) {
  return (
    <div className="flex h-full flex-col text-[#14110f]" style={{ fontSize: fill > 0.7 ? 14 : 10 }}>
      <div className="flex items-center justify-between border-b border-[#e6d8c8] px-4 py-2">
        <span className="font-display text-lg">Casa Lumen</span>
        <span className="rounded-full bg-[#9c3b2e] px-3 py-1 text-[10px] font-semibold text-[#f7f2eb]">Pedir presupuesto</span>
      </div>
      <div className="relative min-h-0 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/10" />
        <div className="absolute bottom-6 left-6 right-6 text-[#f7f2eb]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c6a15b]">Muebles a medida · Madrid</p>
          <p className="font-display text-3xl leading-tight">Mesas, librerías y piezas, hechas para la casa.</p>
          <p className="mt-2 max-w-md text-[11px] text-white/80">
            Misma plantilla que un estudio de tatuaje: catálogo, reseñas reales y reservas. El dueño lo dirige desde el panel.
          </p>
        </div>
      </div>
    </div>
  );
}
