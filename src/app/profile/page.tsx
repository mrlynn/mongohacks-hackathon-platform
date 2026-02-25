import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { ParticipantModel } from "@/lib/db/models/Participant";
import ProfileClient from "./ProfileClient";

async function getUserProfile(userId: string) {
  await connectToDatabase();
  
  const user = await UserModel.findById(userId).select("-passwordHash").lean();
  const participant = await ParticipantModel.findOne({ userId }).lean();

  if (!user) return null;

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    },
    participant: participant ? {
      _id: participant._id.toString(),
      bio: participant.bio || "",
      skills: participant.skills || [],
      interests: participant.interests || [],
      experience_level: participant.experience_level || "beginner",
    } : null,
  };
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as any).id;
  const profile = await getUserProfile(userId);

  if (!profile) {
    return (
      <div>User not found</div>
    );
  }

  return <ProfileClient profile={profile} />;
}
