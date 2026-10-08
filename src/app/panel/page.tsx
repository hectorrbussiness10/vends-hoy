import type { Metadata } from "next";
import { LoginForm } from "@/components/panel/LoginForm";
import { PanelApp } from "@/components/panel/PanelApp";
import { isDemoPanel } from "@/lib/demo-panel";
import { isPanelAuthed, panelPassword } from "@/lib/panel-auth";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return {
    title: `Panel · ${content.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function PanelPage() {
  if (isDemoPanel()) {
    const content = await getSiteContent();
    return <PanelApp initial={content} readOnly />;
  }

  if (!panelPassword()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-4 text-center">
        <p className="max-w-md text-ink">Falta la contraseña del panel en el servidor.</p>
      </main>
    );
  }

  if (!(await isPanelAuthed())) {
    const content = await getSiteContent();
    return <LoginForm businessName={content.name} />;
  }

  const content = await getSiteContent();
  return <PanelApp initial={content} />;
}
