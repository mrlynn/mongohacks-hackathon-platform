import { requireSuperAdmin } from "@/lib/admin-guard";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();
  return <>{children}</>;
}
