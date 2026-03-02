import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import GuidesClient from "./GuidesClient";

export default async function GuidesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { role?: string };

  return <GuidesClient userRole={user.role || "participant"} />;
}
