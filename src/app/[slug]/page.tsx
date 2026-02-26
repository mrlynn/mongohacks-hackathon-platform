import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
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

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Cache the DB lookup so generateMetadata and the page component share one call
const getCachedLandingPage = cache(
  async (slug: string, preview: boolean) => {
    await connectToDatabase();

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

    const serialized = serializeDoc(event);

    // Map partner prizes into a flat format for the template
    (serialized as any).partnerPrizes = partnerPrizes.map((p: any) => ({
      title: p.title,
      description: p.description,
      value: p.value,
      category: p.category,
      partnerName: p.partnerId?.name || "Partner",
      partnerLogo: p.partnerId?.logo,
    }));

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
    (event as any).landingPage?.customContent?.hero?.headline ||
    (event as any).name;
  const heroSubheadline =
    (event as any).landingPage?.customContent?.hero?.subheadline ||
    (event as any).description ||
    "";
  const description = heroSubheadline.slice(0, 160);
  const isPublished = (event as any).landingPage?.published === true;
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
      siteName: "MongoHacks",
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
  const templateSlug = (event as any).landingPage?.template || "modern";

  // Try to find a TemplateConfig for dynamic rendering
  await connectToDatabase();
  const templateConfig = await TemplateConfigModel.findOne({
    slug: templateSlug,
  }).lean();

  if (templateConfig) {
    const serializedConfig = serializeDoc(templateConfig);
    return (
      <DynamicTemplate
        config={serializedConfig as any}
        event={event as any}
      />
    );
  }

  // Fallback to legacy hardcoded templates
  switch (templateSlug) {
    case "modern":
      return <ModernTemplate event={event as any} />;
    case "bold":
      return <BoldTemplate event={event as any} />;
    case "tech":
      return <TechTemplate event={event as any} />;
    case "leafy":
      return <LeafyTemplate event={event as any} />;
    case "atlas":
      return <AtlasTemplate event={event as any} />;
    case "community":
      return <CommunityTemplate event={event as any} />;
    default:
      return <ModernTemplate event={event as any} />;
  }
}
