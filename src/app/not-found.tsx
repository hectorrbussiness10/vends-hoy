import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
      <div className="text-center">
        <h1 className="font-display text-5xl">No está esta página</h1>
        <Link href="/" className="mt-6 inline-block text-terracotta">
          Volver a Ideia Builders
        </Link>
      </div>
    </main>
  );
}
