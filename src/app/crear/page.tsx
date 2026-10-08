import { currentUser } from "@/lib/auth";
import { CreateWizard } from "@/components/marketing/CreateWizard";

export const dynamic = "force-dynamic";

export default async function CrearPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const user = await currentUser();
  const { invite } = await searchParams;
  return <CreateWizard email={user?.email ?? ""} invite={invite ?? ""} hasAccount={Boolean(user)} />;
}
