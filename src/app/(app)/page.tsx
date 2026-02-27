import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import "@/lib/db/models/Team";
import "@/lib/db/models/Event";
import { serializeDocs } from "@/lib/utils/serialize";
import HomePageClient from "./HomePageClient";

async function getFeaturedProjects() {
  try {
    await connectToDatabase();
    const projects = await ProjectModel.find({
      featured: true,
      status: { $in: ["submitted", "judged"] },
    })
      .populate("teamId", "name")
      .populate("eventId", "name")
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean();
    return serializeDocs(projects);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [session, featuredProjects] = await Promise.all([
    auth(),
    getFeaturedProjects(),
  ]);

  const user = session?.user
    ? {
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        role: (session.user as any).role,
      }
    : null;

  return <HomePageClient user={user} featuredProjects={featuredProjects} />;
}
