import { requireAdminPanel } from "@/lib/admin-guard";
import AdminLayout from "./AdminLayout";
import type { UserRole } from "@/lib/admin-guard";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect entire admin section — allows super_admin, admin, organizer, marketer
  const session = await requireAdminPanel();
  const userRole = ((session.user as { role?: string }).role ?? "participant") as UserRole;

  return <AdminLayout userRole={userRole}>{children}</AdminLayout>;
}
