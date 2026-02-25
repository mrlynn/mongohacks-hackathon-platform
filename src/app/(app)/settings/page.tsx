import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = {
    _id: (session.user as any).id,
    name: session.user.name || "",
    email: session.user.email || "",
    role: (session.user as any).role || "participant",
  };

  return <SettingsClient user={user} />;
}
