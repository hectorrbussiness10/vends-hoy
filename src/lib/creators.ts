export const CREATOR_EMAILS = ["hectorrbussiness@gmail.com", "hectorgomez@ideia.builders"] as const;

export function isCreatorEmail(email?: string | null): boolean {
  if (!email) return false;
  return CREATOR_EMAILS.includes(email.trim().toLowerCase() as (typeof CREATOR_EMAILS)[number]);
}
