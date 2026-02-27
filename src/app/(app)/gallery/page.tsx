import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import "@/lib/db/models/Team";
import "@/lib/db/models/Event";
import { serializeDocs } from "@/lib/utils/serialize";
import GalleryClient from "./GalleryClient";

async function getFeaturedProjects() {
  await connectToDatabase();
  const projects = await ProjectModel.find({
    featured: true,
    status: { $in: ["submitted", "judged"] },
  })
    .populate("teamId", "name")
    .populate("eventId", "name")
    .sort({ updatedAt: -1 })
    .lean();
  return serializeDocs(projects);
}

export default async function GalleryPage() {
  const projects = await getFeaturedProjects();
  return <GalleryClient projects={projects} />;
}
