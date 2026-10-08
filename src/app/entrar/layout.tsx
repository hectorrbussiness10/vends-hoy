import { AppChrome } from "@/components/marketing/AppChrome";
import { Suspense } from "react";

export default function EntrarLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppChrome>
      <Suspense fallback={<main className="px-4 py-24 text-ink/50">Cargando…</main>}>{children}</Suspense>
    </AppChrome>
  );
}
