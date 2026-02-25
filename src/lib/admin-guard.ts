import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Admin Guard - Server-side protection for admin routes
 * Usage: await requireAdmin() at the top of admin pages/API routes
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role;

  if (userRole !== "admin") {
    redirect("/dashboard"); // Redirect non-admins to regular dashboard
  }

  return session;
}

/**
 * Check if user is admin (without redirect)
 * Usage: const isAdmin = await isUserAdmin()
 */
export async function isUserAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const userRole = (session.user as { role?: string }).role;
  return userRole === "admin";
}

/**
 * Check if user has specific role
 */
export async function hasRole(
  ...roles: ("admin" | "organizer" | "judge" | "participant")[]
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const userRole = (session.user as { role?: string }).role;
  return roles.includes(userRole as any);
}
