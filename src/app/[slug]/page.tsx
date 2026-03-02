import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { PartnerModel } from "@/lib/db/models/Partner";
import { PrizeModel } from "@/lib/db/models/Prize";
import { TemplateConfigModel } from "@/lib/db/models/TemplateConfig";
import { serializeDoc } from "@/lib/utils/serialize";
import DynamicTemplate from "@/components/landing-pages/DynamicTemplate";
import ModernTemplate from "@/components/landing-pages/ModernTemplate";
import BoldTemplate from "@/components/landing-pages/BoldTemplate";
import TechTemplate from "@/components/landing-pages/TechTemplate";
import LeafyTemplate from "@/components/landing-pages/LeafyTemplate";
import AtlasTemplate from "@/components/landing-pages/AtlasTemplate";
import CommunityTemplate from "@/components/landing-pages/CommunityTemplate";
import type { TemplateRenderProps, LandingPagePartnerPrize } from "@/lib/types/template";

/** Serialized landing-page event -- extends the template render shape with
 *  fields needed for metadata generation and template selection. */
type SerializedLandingPageEvent = TemplateRenderProps["event"] & {
  landingPage?: TemplateRenderProps["event"]["landingPage"] & {
    template?: string;
    slug?: string;
    published?: boolean;
  };
};

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Cache the DB lookup so generateMetadata and the page component share one call
const getCachedLandingPage = cache(
  async (slug: string, preview: boolean) => {
    await connectToDatabase();
    
    // Force model registration (Turbopack caching workaround)
    PartnerModel;

    const query: Record<string, unknown> = { "landingPage.slug": slug };
    if (!preview) {
      query["landingPage.published"] = true;
    }

    const event = await EventModel.findOne(query)
      .populate("partners", "name description logo website tier industry")
      .lean();
    if (!event) return null;

    // Fetch partner-sponsored prizes for this event
    const partnerPrizes = await PrizeModel.find({
      eventId: event._id,
      partnerId: { $exists: true, $ne: null },
      isActive: true,
    })
      .populate("partnerId", "name logo")
      .sort({ displayOrder: 1 })
      .lean();

    const serialized = serializeDoc(event) as SerializedLandingPageEvent;

    // Map partner prizes into a flat format for the template
    serialized.partnerPrizes = partnerPrizes.map((p: Record<string, unknown>) => ({
      title: p.title as string,
      description: p.description as string,
      value: p.value as string | undefined,
      category: p.category as string,
      partnerName: (p.partnerId as { name?: string })?.name || "Partner",
      partnerLogo: (p.partnerId as { logo?: string })?.logo,
    })) as LandingPagePartnerPrize[];

    return serialized;
  }
);

// --------------- SEO Metadata ---------------
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const event = await getCachedLandingPage(slug, isPreview);

  if (!event) {
    return { title: "Page Not Found" };
  }

  const heroHeadline =
    event.landingPage?.customContent?.hero?.headline ||
    event.name;
  const heroSubheadline =
    event.landingPage?.customContent?.hero?.subheadline ||
    event.description ||
    "";
  const description = heroSubheadline.slice(0, 160);
  const isPublished = event.landingPage?.published === true;
  const ogImageUrl = `${BASE_URL}/api/og?slug=${encodeURIComponent(slug)}`;

  return {
    title: heroHeadline,
    description,
    alternates: {
      canonical: `${BASE_URL}/${slug}`,
    },
    robots: isPublished
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: heroHeadline,
      description,
      url: `${BASE_URL}/${slug}`,
      siteName: "MongoDB Hackathons",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: heroHeadline,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: heroHeadline,
      description,
      images: [ogImageUrl],
    },
  };
}

// --------------- Page Component ---------------
export default async function LandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const event = await getCachedLandingPage(slug, isPreview);

  if (!event) {
    notFound();
  }

  // Render template based on event.landingPage.template
  const templateSlug = event.landingPage?.template || "modern";
  // The serialized event matches TemplateRenderProps["event"], but legacy
  // templates expect IEvent (Mongoose Document). We cast through unknown
  // because the shapes overlap at runtime (plain object from lean+serialize).
  const templateEvent = event as unknown as import("@/lib/db/models/Event").IEvent & TemplateRenderProps["event"];

  // Try to find a TemplateConfig for dynamic rendering
  await connectToDatabase();
  const templateConfig = await TemplateConfigModel.findOne({
    slug: templateSlug,
  }).lean();

  if (templateConfig) {
    const serializedConfig = serializeDoc(templateConfig) as unknown as TemplateRenderProps["config"];
    return (
      <DynamicTemplate
        config={serializedConfig}
        event={event}
      />
    );
  }

  // Fallback to legacy hardcoded templates
  switch (templateSlug) {
    case "modern":
      return <ModernTemplate event={templateEvent} />;
    case "bold":
      return <BoldTemplate event={templateEvent} />;
    case "tech":
      return <TechTemplate event={templateEvent} />;
    case "leafy":
      return <LeafyTemplate event={templateEvent} />;
    case "atlas":
      return <AtlasTemplate event={templateEvent} />;
    case "community":
      return <CommunityTemplate event={templateEvent} />;
    default:
      return <ModernTemplate event={templateEvent} />;
  }
}
