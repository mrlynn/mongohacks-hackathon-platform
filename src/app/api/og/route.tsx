import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug parameter", { status: 400 });
  }

  try {
    await connectToDatabase();
    const event = await EventModel.findOne({ "landingPage.slug": slug }).lean();

    const title =
      (event as any)?.landingPage?.customContent?.hero?.headline ||
      (event as any)?.name ||
      "Hackathon Event";
    const subtitle =
      (event as any)?.landingPage?.customContent?.hero?.subheadline ||
      (event as any)?.description ||
      "";
    const startDate = (event as any)?.startDate
      ? new Date((event as any).startDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px",
            background: "linear-gradient(135deg, #001E2B 0%, #00684A 50%, #13AA52 100%)",
            color: "white",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* MongoDB Hackathons branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "40px",
              fontSize: "24px",
              fontWeight: 600,
              opacity: 0.9,
              letterSpacing: "0.05em",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "#13AA52",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "16px",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              M
            </div>
            MONGOHACKS
          </div>

          {/* Event title */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "20px",
              maxWidth: "900px",
            }}
          >
            {title.length > 60 ? title.slice(0, 57) + "..." : title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: "24px",
                lineHeight: 1.4,
                opacity: 0.85,
                marginBottom: "30px",
                maxWidth: "800px",
              }}
            >
              {subtitle.length > 120
                ? subtitle.slice(0, 117) + "..."
                : subtitle}
            </div>
          )}

          {/* Date */}
          {startDate && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "20px",
                opacity: 0.8,
                marginTop: "auto",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "20px",
                  padding: "8px 24px",
                  fontSize: "18px",
                }}
              >
                {startDate}
              </div>
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image error:", error);
    // Fallback — generic branded card
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #001E2B 0%, #00684A 100%)",
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: "48px", fontWeight: 800 }}>MongoDB Hackathons</div>
          <div style={{ fontSize: "24px", opacity: 0.8, marginTop: "16px" }}>
            Hackathon Management Platform
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
