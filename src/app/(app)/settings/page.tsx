import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = {
    _id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    role: session.user.role || "participant",
  };

  return <SettingsClient user={user} />;
}
