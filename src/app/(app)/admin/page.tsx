import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { EventModel } from "@/lib/db/models/Event";
import { ProjectModel } from "@/lib/db/models/Project";
import AdminDashboard from "./AdminDashboard";

async function getAdminStats() {
  await connectToDatabase();

  const [totalUsers, totalEvents, totalProjects, activeEvents] = await Promise.all([
    UserModel.countDocuments(),
    EventModel.countDocuments(),
    ProjectModel.countDocuments(),
    EventModel.countDocuments({ status: { $in: ["open", "in_progress"] } }),
  ]);

  const usersByRole = await UserModel.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  const roleMap = usersByRole.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalUsers,
    totalEvents,
    totalProjects,
    activeEvents,
    judges: roleMap.judge || 0,
    organizers: roleMap.organizer || 0,
    participants: roleMap.participant || 0,
    admins: roleMap.admin || 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  return <AdminDashboard stats={stats} />;
}
