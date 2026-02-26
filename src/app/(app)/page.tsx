import { auth } from "@/lib/auth";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const session = await auth();

  const user = session?.user
    ? {
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        role: (session.user as any).role,
      }
    : null;

  return <HomePageClient user={user} />;
}
