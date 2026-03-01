import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/admin-guard";
import type { UserRole } from "@/lib/admin-guard";
import { cookies } from "next/headers";

const ADMIN_PARTNER_COOKIE = "admin_selected_partner";

/**
 * Resolves the effective partnerId for API route handlers.
 * Returns the partnerId from session for partner-role users,
 * or from the admin selection cookie for admin users.
 */
export async function getEffectivePartnerIdForApi(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user as { partnerId?: string; role?: string };

  // Partner users always use their own partnerId
  if (user.partnerId) return user.partnerId;

  // Admins can view any partner via cookie
  const role = (user.role ?? "participant") as UserRole;
  if (ADMIN_ROLES.includes(role)) {
    try {
      const cookieStore = await cookies();
      return cookieStore.get(ADMIN_PARTNER_COOKIE)?.value || null;
    } catch {
      return null;
    }
  }

  return null;
}
