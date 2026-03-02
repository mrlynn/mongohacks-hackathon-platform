import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { SiteSettingsModel } from "@/lib/db/models/SiteSettings";
import { apiLogger } from "@/lib/logger";

function maskKey(key: string): string {
  if (key.length <= 4) return "****";
  return "..." + key.slice(-4);
}

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const settings = await SiteSettingsModel.findOne({ key: "global" })
      .select("unsplashAccessKey unsplashSecretKey")
      .lean();

    const dbAccessKey = settings?.unsplashAccessKey as string | null;
    const dbSecretKey = settings?.unsplashSecretKey as string | null;
    const envAccessKey = process.env.UNSPLASH_ACCESS_KEY ?? null;
    const envSecretKey = process.env.UNSPLASH_SECRET_KEY ?? null;

    return NextResponse.json({
      accessKey: {
        source: dbAccessKey ? "database" : envAccessKey ? "environment" : null,
        hint: dbAccessKey
          ? maskKey(dbAccessKey)
          : envAccessKey
            ? maskKey(envAccessKey)
            : null,
      },
      secretKey: {
        source: dbSecretKey ? "database" : envSecretKey ? "environment" : null,
        hint: dbSecretKey
          ? maskKey(dbSecretKey)
          : envSecretKey
            ? maskKey(envSecretKey)
            : null,
      },
    });
  } catch (error) {
    apiLogger.error({ err: error }, "GET /api/admin/settings/unsplash error");
    return NextResponse.json(
      { error: "Failed to fetch Unsplash settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { accessKey, secretKey } = await request.json();

    const update: Record<string, string | null> = {};

    if (typeof accessKey === "string") {
      update.unsplashAccessKey = accessKey.trim() || null;
    }
    if (typeof secretKey === "string") {
      update.unsplashSecretKey = secretKey.trim() || null;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    await SiteSettingsModel.findOneAndUpdate(
      { key: "global" },
      { $set: update },
      { upsert: true }
    );

    return NextResponse.json({ updated: true });
  } catch (error) {
    apiLogger.error({ err: error }, "PUT /api/admin/settings/unsplash error");
    return NextResponse.json(
      { error: "Failed to update Unsplash settings" },
      { status: 500 }
    );
  }
}
