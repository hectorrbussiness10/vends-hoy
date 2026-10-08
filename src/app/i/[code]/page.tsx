import { redirect } from "next/navigation";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  redirect(`/entrar?next=${encodeURIComponent(`/crear?invite=${code}`)}`);
}
