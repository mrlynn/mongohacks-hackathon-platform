import { connectToDatabase } from "@/lib/db/connection";
import { SiteSettingsModel } from "@/lib/db/models/SiteSettings";
import { apiLogger } from "@/lib/logger";

/**
 * Resolves the Unsplash access key: DB override first, then env fallback.
 */
export async function getUnsplashAccessKey(): Promise<string | null> {
  try {
    await connectToDatabase();
    const settings = await SiteSettingsModel.findOne({ key: "global" })
      .select("unsplashAccessKey")
      .lean();

    if (settings?.unsplashAccessKey) {
      return settings.unsplashAccessKey as string;
    }
  } catch (error) {
    apiLogger.error({ err: error }, "Failed to fetch Unsplash key from DB, falling back to env");
  }

  return process.env.UNSPLASH_ACCESS_KEY ?? null;
}
