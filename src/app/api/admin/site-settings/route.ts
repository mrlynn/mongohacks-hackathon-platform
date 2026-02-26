import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { SiteSettingsModel } from "@/lib/db/models/SiteSettings";

// Valid backgrounds served from /public/backgrounds/
const VALID_BACKGROUNDS = [
  "collaboration.jpg",
  "corporate.jpg",
  "fishbowl.jpg",
  "hackathon.jpg",
  "illustrated.jpg",
  "startup-office.jpg",
  "teamwork.jpg",
];

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SiteSettingsModel.findOne({ key: "global" }).lean();
    return NextResponse.json({
      heroBackground: settings?.heroBackground ?? null,
    });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json({ heroBackground: null });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const body = await request.json();
    const { heroBackground } = body;

    // null clears the background; otherwise must be a known file
    if (heroBackground !== null && !VALID_BACKGROUNDS.includes(heroBackground)) {
      return NextResponse.json(
        { error: "Invalid background filename" },
        { status: 400 }
      );
    }

    const settings = await SiteSettingsModel.findOneAndUpdate(
      { key: "global" },
      { heroBackground },
      { upsert: true, new: true }
    );

    return NextResponse.json({ heroBackground: settings.heroBackground });
  } catch (error) {
    console.error("Error updating site settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
