import { requirePartner } from "@/lib/admin-guard";
import PartnerLayout from "./PartnerLayout";
import type { UserRole } from "@/lib/admin-guard";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePartner();
  const userRole = ((session.user as { role?: string }).role ?? "participant") as UserRole;
  const partnerId = (session.user as { partnerId?: string }).partnerId;

  return (
    <PartnerLayout userRole={userRole} partnerId={partnerId}>
      {children}
    </PartnerLayout>
  );
}
