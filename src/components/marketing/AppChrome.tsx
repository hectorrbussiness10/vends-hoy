import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { isCreatorEmail } from "@/lib/creators";
import { currentUser } from "@/lib/auth";

export async function AppChrome({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const creator = isCreatorEmail(user?.email);
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-50 border-b border-ink/[0.06] bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-2xl tracking-tight">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-4 text-sm text-ink/70">
            <a href="/#como" className="hidden md:inline hover:text-ink">
              Cómo funciona
            </a>
            <a href="/#precio" className="hidden md:inline hover:text-ink">
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
            <Link
              href={user ? "/crear" : "/entrar?next=/crear"}
              className="rounded-full bg-ink px-4 py-2 font-semibold text-paper"
            >
              Crear la web
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-ink/[0.06] px-4 py-10 text-sm text-ink/50">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4">
          <p>
            {APP_NAME} · Madrid
          </p>
          <p>Un día de prueba con sesión. Luego 150 € al mes.</p>
        </div>
      </footer>
    </div>
  );
}
