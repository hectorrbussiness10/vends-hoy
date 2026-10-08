import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { CreateWizard } from "@/components/marketing/CreateWizard";
import { AppChrome } from "@/components/marketing/AppChrome";

export const dynamic = "force-dynamic";

export default async function CrearPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const user = await currentUser();
  const { invite } = await searchParams;
  if (!user) {
    const next = invite ? `/crear?invite=${encodeURIComponent(invite)}` : "/crear";
    redirect(`/entrar?next=${encodeURIComponent(next)}`);
  }
  return (
    <AppChrome>
      <CreateWizard email={user.email} invite={invite ?? ""} hasAccount />
    </AppChrome>
  );
}
