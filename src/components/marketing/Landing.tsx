import Link from "next/link";
import { ComputerScroll } from "@/components/marketing/ComputerScroll";
import { APP_NAME } from "@/lib/brand";
import { isCreatorEmail } from "@/lib/creators";
import type { Profile } from "@/lib/models";

const STEPS = [
  {
    n: "1",
    title: "Cree su cuenta e inicie sesión",
    text: "La prueba de un día no empieza al visitar la web. Empieza cuando entra con su email y publica el negocio. Así sabemos de quién es cada web.",
  },
  {
    n: "2",
    title: "Cuéntenos el oficio",
    text: "Pegue Google Maps, un brief o fotos del local. Componemos la misma estructura que un estudio serio: portada, catálogo, reseñas, horarios, locales y reserva.",
  },
  {
    n: "3",
    title: "Diríjalo desde el panel",
    text: "Productos, citas, opiniones y contraseña viven en el panel. La web pública no lleva claves. Tiene 24 horas para usarlo todo. Luego, 150 € al mes.",
  },
];

export function Landing({ user }: { user: Profile | null }) {
  const creator = isCreatorEmail(user?.email);
  const crearHref = user ? "/crear" : "/entrar?next=/crear";

  return (
    <div className="bg-paper text-ink">
      <header className="sticky top-0 z-50 border-b border-ink/[0.06] bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-2xl tracking-tight">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-4 text-sm text-ink/70">
            <a href="#como" className="hidden md:inline hover:text-ink">
              Cómo funciona
            </a>
            <a href="#precio" className="hidden md:inline hover:text-ink">
              Precio
            </a>
            {creator && (
              <Link href="/estudio" className="font-medium text-terracotta">
                Estudio
              </Link>
            )}
            {user ? (
              <Link href="/cuenta" className="hover:text-ink">
                Cuenta
              </Link>
            ) : (
              <Link href="/entrar" className="hover:text-ink">
                Entrar
              </Link>
            )}
            <Link href={crearHref} className="rounded-full bg-ink px-4 py-2 font-semibold text-paper">
              Crear la web
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pt-28">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Estudio digital para negocios locales</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.02] md:text-7xl">
            Su negocio, en internet, con la seriedad de un local físico.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
            {APP_NAME} le entrega una web con catálogo, reseñas, reservas y un panel para dirigirla. No hace falta un
            técnico. Usted trae Maps, fotos o un brief. Nosotros publicamos.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/60">
            La cortesía de 24 horas <strong className="font-semibold text-ink">solo se activa si inicia sesión</strong> y
            crea la web. Sin cuenta, no hay prueba. Después, 150 € al mes. Si invita a otro negocio y ese negocio paga,
            el mes siguiente se descuentan 50 €, un mes solamente.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={crearHref} className="rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white">
              {user ? "Crear mi web" : "Entrar y empezar la prueba"}
            </Link>
            <a href="#como" className="rounded-full px-6 py-3 text-sm font-semibold ring-1 ring-ink/15">
              Ver el método
            </a>
          </div>
        </div>
        <aside className="rounded-[28px] border border-ink/[0.08] bg-white p-7 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">Qué incluye</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink/75">
            <li>Web pública con portada, catálogo, opiniones, horarios y reserva.</li>
            <li>Panel del dueño: fotos, textos, citas y contraseña.</li>
            <li>Cinco cambios diarios por escrito, con vista previa antes de aplicar.</li>
            <li>Vuelta a la versión inicial y a las dos últimas.</li>
            <li>Nada de claves en la web del cliente. Lo sensible vive en el panel.</li>
          </ul>
        </aside>
      </section>

      <ComputerScroll />

      <section id="como" className="mx-auto max-w-6xl px-4 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Método</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl md:text-5xl">Tres pasos. Una web en el aire.</h2>
        <p className="mt-4 max-w-2xl text-ink/65">
          No vendemos una plantilla vacía. Adaptamos la arquitectura de un estudio real —la de Martin Tattoo— al oficio
          que usted traiga: mueble, salón, restaurante o clínica.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.n} className="rounded-[28px] border border-ink/[0.08] bg-white p-7">
              <p className="font-display text-4xl text-terracotta">{step.n}</p>
              <h3 className="mt-4 font-display text-2xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Qué recibe</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">La misma página, vestida para su oficio.</h2>
            <p className="mt-5 leading-relaxed text-ink/65">
              Si pega el Maps de una carpintería, no verá un tatuador. Verá piezas, presupuestos y el mismo orden:
              portada, catálogo, opiniones de más de cuatro estrellas, locales y reserva. Si no hay reseñas públicas, se
              presenta con cinco estrellas hasta que el panel incorpore las reales.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              "Catálogo de productos o servicios, con las fotos que usted suba.",
              "Reservas que llegan al panel y, si hay teléfono, a WhatsApp.",
              "Cinco ediciones diarias por escrito. Antes de aplicar, ve el cambio.",
              "Vuelta a la versión inicial y a las dos últimas, por si se equivoca.",
              "Contraseña del panel cambiada en el primer acceso.",
              "La web pública no lleva API keys ni datos de cobro.",
            ].map((item) => (
              <li key={item} className="rounded-2xl border border-ink/[0.08] bg-paper px-5 py-4 text-ink/80">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="precio" className="mx-auto max-w-6xl px-4 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Honorarios</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Un día de prueba. Luego 150 € al mes.</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink/65">
          La prueba no es anónima: hay que iniciar sesión. Es única, de veinticuatro horas, para usar la web, el panel y
          cinco cambios por prompt. Después se suscribe con tarjeta. Si invita a otro negocio y ese negocio se
          suscribe, el mes siguiente se descuentan 50 €, solo un mes, por cada invitado que pague.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="rounded-[32px] border border-ink/[0.08] bg-white p-8">
            <p className="text-sm uppercase tracking-widest text-terracotta">Cortesía</p>
            <p className="mt-2 font-display text-5xl">1 día</p>
            <p className="mt-3 text-ink/65">Solo con sesión iniciada. Web en el aire, panel, reservas y cinco ediciones. Una sola vez.</p>
          </article>
          <article className="rounded-[32px] bg-ink p-8 text-paper">
            <p className="text-sm uppercase tracking-widest text-gold">Suscripción</p>
            <p className="mt-2 font-display text-5xl">150 € / mes</p>
            <p className="mt-3 text-paper/70">
              Alojamiento, panel y ediciones. Enlace de invitación: −50 € el mes siguiente por cada negocio que se
              suscriba, durante un mes.
            </p>
            <Link href={crearHref} className="mt-8 inline-flex rounded-full bg-paper px-6 py-3 text-sm font-semibold text-ink">
              {user ? "Publicar ahora" : "Iniciar sesión para la prueba"}
            </Link>
          </article>
        </div>
      </section>

      <footer className="border-t border-ink/[0.06] px-4 py-10 text-sm text-ink/50">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4">
          <p>
            {APP_NAME} · Webs de negocio
          </p>
          <p>Madrid · España</p>
        </div>
      </footer>
    </div>
  );
}
