import Link from "next/link";
import { ComputerScroll } from "@/components/marketing/ComputerScroll";

const STEPS = [
  {
    n: "01",
    title: "Traiga el local",
    text: "Pegue Google Maps, un brief del oficio o las fotos del taller. No hace falta un técnico.",
  },
  {
    n: "02",
    title: "Sale la plantilla Martin",
    text: "La misma arquitectura que un estudio de tatuaje: portada, catálogo, reseñas, locales, horario y reserva. Adaptada al mueble, al salón o al restaurante.",
  },
  {
    n: "03",
    title: "El panel manda",
    text: "Productos, citas, opiniones y contraseña viven en el panel del negocio. La web pública no lleva claves.",
  },
];

export function Landing() {
  return (
    <div className="bg-[#07080c] text-cream">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#07080c]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-2xl">
            Vends Hoy
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <a href="#oficio" className="hidden text-cream/70 md:inline">
              El oficio
            </a>
            <a href="#precio" className="hidden text-cream/70 md:inline">
              Honorarios
            </a>
            <Link href="/entrar" className="text-cream/70">
              Entrar
            </Link>
            <Link href="/crear" className="rounded-full bg-cream px-4 py-2 font-semibold text-night">
              Crear la web
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-end px-4 pb-24 pt-32">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Atelier digital para negocios locales</p>
        <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl lg:text-8xl">
          Una web que vende.
          <span className="block text-gold">Lista el mismo día.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-cream/75">
          Vends Hoy entrega un establecimiento en internet con la seriedad de un local físico: catálogo, reseñas,
          reservas y un panel para dirigirlo. Un día de cortesía. Después, 150 euros al mes.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/crear" className="rounded-full bg-terracotta px-7 py-3 text-sm font-semibold">
            Empezar con Maps, fotos o un brief
          </Link>
          <a href="#oficio" className="rounded-full px-7 py-3 text-sm font-semibold ring-1 ring-cream/25">
            Ver el método
          </a>
        </div>
      </section>

      <ComputerScroll />

      <section id="oficio" className="mx-auto max-w-6xl px-4 py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Método</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-6xl">Tres gestos. Una web en producción.</h2>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.n} className="rounded-[28px] border border-white/10 bg-steel/60 p-8">
              <p className="font-display text-4xl text-gold">{step.n}</p>
              <h3 className="mt-4 font-display text-3xl">{step.title}</h3>
              <p className="mt-3 text-cream/70">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#0d1018] py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Qué recibe</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">La plantilla de Martin, vestida para su oficio.</h2>
            <p className="mt-5 text-cream/70">
              Si pega el Maps de una carpintería, no verá un tatuador. Verá piezas, presupuestos y el mismo orden de
              página: portada, catálogo, opiniones de más de cuatro estrellas, locales y reserva. Si no hay reseñas
              públicas, el negocio se presenta con cinco estrellas hasta que el panel incorpore las reales.
            </p>
          </div>
          <ul className="space-y-4 text-sm">
            {[
              "Catálogo de productos o servicios, con fotos del cliente.",
              "Reservas que llegan al panel y, si hay teléfono, a WhatsApp.",
              "Cinco ediciones diarias por escrito. Antes de aplicar, ve el cambio.",
              "Vuelta a la versión inicial y a las dos últimas, por si se equivoca.",
              "Contraseña del panel cambiada en el primer acceso.",
              "Nada de claves en la web pública. Lo sensible vive en el panel.",
            ].map((item) => (
              <li key={item} className="rounded-2xl border border-white/10 px-5 py-4 text-cream/85">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="precio" className="mx-auto max-w-6xl px-4 py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Honorarios</p>
        <h2 className="mt-4 font-display text-5xl">Un día. Luego, 150 € al mes.</h2>
        <p className="mt-4 max-w-2xl text-cream/70">
          La prueba es única: veinticuatro horas para usar la web, el panel y cinco cambios por prompt. Después se
          suscribe. Si invita a otro negocio y ese negocio se suscribe, el mes siguiente se descuentan 50 euros, un
          mes solamente, por cada invitado que pague.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="rounded-[32px] border border-white/10 p-8">
            <p className="text-sm uppercase tracking-widest text-gold">Cortesía</p>
            <p className="mt-2 font-display text-5xl">1 día</p>
            <p className="mt-3 text-cream/70">Web en el aire, panel, reservas y cinco ediciones. Una sola vez.</p>
          </article>
          <article className="rounded-[32px] bg-cream p-8 text-night">
            <p className="text-sm uppercase tracking-widest text-terracotta">Suscripción</p>
            <p className="mt-2 font-display text-5xl">150 € / mes</p>
            <p className="mt-3 text-olive">
              Alojamiento, panel y ediciones. Enlace de invitación: −50 € el mes siguiente por cada negocio que se
              suscriba, durante un mes.
            </p>
            <Link href="/crear" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream">
              Crear mi web ahora
            </Link>
          </article>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 text-sm text-cream/50">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4">
          <p>Vends Hoy · Webs de negocio</p>
          <p>Madrid · España</p>
        </div>
      </footer>
    </div>
  );
}
