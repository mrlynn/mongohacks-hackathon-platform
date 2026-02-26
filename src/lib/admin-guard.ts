import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type UserRole =
  | "super_admin"
  | "admin"
  | "organizer"
  | "judge"
  | "participant";

const ADMIN_ROLES: UserRole[] = ["super_admin", "admin"];

/**
 * Returns true if the current request is an admin-initiated impersonation.
 * Reads the httpOnly cookie directly — reliable in server components, route
 * handlers, server actions, and middleware (unlike reading it via the
 * NextAuth session callback where cookies() may not have request context).
 */
async function isImpersonationActive(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return !!cookieStore.get("impersonate_user_id")?.value;
  } catch {
    return false;
  }
}

/** Returns the effective role for authorization checks.
 * When impersonating, the real admin's role is used so they retain admin access. */
function effectiveRole(user: { role?: string; realAdminRole?: string; isImpersonating?: boolean }): UserRole {
  return ((user.isImpersonating ? user.realAdminRole : user.role) ?? user.role ?? "") as UserRole;
}

/**
 * Admin Guard - Server-side protection for admin routes
 * Accepts both "admin" and "super_admin" roles
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = effectiveRole(session.user as { role?: string; realAdminRole?: string; isImpersonating?: boolean });

  if (!ADMIN_ROLES.includes(role) && !(await isImpersonationActive())) {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Super Admin Guard - Server-side protection for platform-level features
 * Only accepts "super_admin" role
 */
export async function requireSuperAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = effectiveRole(session.user as { role?: string; realAdminRole?: string; isImpersonating?: boolean });

  if (role !== "super_admin") {
    redirect("/admin");
  }

  return session;
}

/**
 * Check if user is admin (without redirect)
 */
export async function isUserAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // First check via session (works in page contexts where impersonation cookie
  // is reliably propagated into the session object)
  const role = effectiveRole(session.user as { role?: string; realAdminRole?: string; isImpersonating?: boolean });
  if (ADMIN_ROLES.includes(role)) return true;

  // Fallback: if the session shows a non-admin role but the impersonation cookie
  // exists, the real user must be an admin (only admins can start impersonation)
  return isImpersonationActive();
}

/**
 * Check if user is super admin (without redirect)
 */
export async function isUserSuperAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const role = effectiveRole(session.user as { role?: string; realAdminRole?: string; isImpersonating?: boolean });
  return role === "super_admin";
}

/**
 * Check if user has specific role
 */
export async function hasRole(
  ...roles: UserRole[]
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const role = effectiveRole(session.user as { role?: string; realAdminRole?: string; isImpersonating?: boolean });
  return roles.includes(role);
}
