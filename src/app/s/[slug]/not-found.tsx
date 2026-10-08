import Link from "next/link";

export default function SiteNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 text-ink">
      <div className="text-center">
        <h1 className="font-display text-4xl">Esta web aún no existe</h1>
        <Link href="/crear" className="mt-6 inline-block text-terracotta">
          Crear una en Ideia Builders
        </Link>
      </div>
    </main>
  );
}
