import { Landing } from "@/components/marketing/Landing";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await currentUser();
  return <Landing user={user} />;
}
