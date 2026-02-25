import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import ModernTemplate from "@/components/landing-pages/ModernTemplate";
import BoldTemplate from "@/components/landing-pages/BoldTemplate";
import TechTemplate from "@/components/landing-pages/TechTemplate";

async function getLandingPage(slug: string, preview = false) {
  await connectToDatabase();
  
  // For preview mode, allow viewing unpublished pages
  const query: any = { "landingPage.slug": slug };
  if (!preview) {
    query["landingPage.published"] = true;
  }
  
  const event = await EventModel.findOne(query).lean();

  if (!event) return null;

  return {
    ...event,
    _id: event._id.toString(),
    startDate: event.startDate?.toISOString() || new Date().toISOString(),
    endDate: event.endDate?.toISOString() || new Date().toISOString(),
    registrationDeadline:
      event.registrationDeadline?.toISOString() || new Date().toISOString(),
    createdAt: event.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: event.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

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
  
  const event = await getLandingPage(slug, isPreview);

  if (!event) {
    notFound();
  }

  // Render template based on event.landingPage.template
  const template = event.landingPage?.template || "modern";

  switch (template) {
    case "modern":
      return <ModernTemplate event={event as any} />;
    case "bold":
      return <BoldTemplate event={event as any} />;
    case "tech":
      return <TechTemplate event={event as any} />;
    default:
      return <ModernTemplate event={event as any} />;
  }
}
