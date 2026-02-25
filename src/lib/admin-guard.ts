import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

type UserRole =
  | "super_admin"
  | "admin"
  | "organizer"
  | "judge"
  | "participant";

const ADMIN_ROLES: UserRole[] = ["super_admin", "admin"];

/**
 * Admin Guard - Server-side protection for admin routes
 * Accepts both "admin" and "super_admin" roles
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role as UserRole;

  if (!ADMIN_ROLES.includes(userRole)) {
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

  const userRole = (session.user as { role?: string }).role;

  if (userRole !== "super_admin") {
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

  const userRole = (session.user as { role?: string }).role as UserRole;
  return ADMIN_ROLES.includes(userRole);
}

/**
 * Check if user is super admin (without redirect)
 */
export async function isUserSuperAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const userRole = (session.user as { role?: string }).role;
  return userRole === "super_admin";
}

/**
 * Check if user has specific role
 */
export async function hasRole(
  ...roles: UserRole[]
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const userRole = (session.user as { role?: string }).role;
  return roles.includes(userRole as UserRole);
}
