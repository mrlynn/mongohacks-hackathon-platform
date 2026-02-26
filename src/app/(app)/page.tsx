import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { SiteSettingsModel } from "@/lib/db/models/SiteSettings";
import HomePageClient from "./HomePageClient";

async function getHeroBackground(): Promise<string | null> {
  try {
    await connectToDatabase();
    const settings = await SiteSettingsModel.findOne({ key: "global" }).lean();
    return settings?.heroBackground ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [session, heroBackground] = await Promise.all([
    auth(),
    getHeroBackground(),
  ]);

  const user = session?.user
    ? {
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        role: (session.user as any).role,
      }
    : null;

  return <HomePageClient user={user} heroBackground={heroBackground} />;
}
