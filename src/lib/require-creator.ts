import { currentUser } from "@/lib/auth";
import { isCreatorEmail } from "@/lib/creators";

export async function requireCreator() {
  const user = await currentUser();
  if (!user || !isCreatorEmail(user.email)) return null;
  return user;
}
