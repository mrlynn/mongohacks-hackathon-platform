import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/admin-guard";
import type { UserRole } from "@/lib/admin-guard";

const ADMIN_PARTNER_COOKIE = "admin_selected_partner";

/**
 * Resolves the effective partnerId for the current user.
 *
 * - For partner-role users: returns their session partnerId.
 * - For admin/super_admin: returns the cookie-stored selection (set when
 *   admin picks a partner from the picker), or null if none selected.
 */
export async function getEffectivePartnerId(): Promise<string | null> {
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

/**
 * Whether the current user is an admin (may or may not have a partnerId).
 */
export async function isAdminViewer(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  const role = ((session.user as { role?: string }).role ?? "participant") as UserRole;
  return ADMIN_ROLES.includes(role);
}
