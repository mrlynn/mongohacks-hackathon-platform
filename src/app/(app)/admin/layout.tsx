import { requireAdmin } from "@/lib/admin-guard";
import AdminLayout from "./AdminLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect entire admin section
  await requireAdmin();

  return <AdminLayout>{children}</AdminLayout>;
}
