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

  // Get user ID from session - try multiple possible locations
  const userId = (session.user as any).id || (session.user as any).sub;
  
  if (!userId) {
    console.error('[Profile] No user ID in session:', session.user);
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Session Error</h2>
        <p>User ID not found in session. Please try logging out and back in.</p>
        <pre>{JSON.stringify(session.user, null, 2)}</pre>
      </div>
    );
  }

  const profile = await getUserProfile(userId);

  if (!profile) {
    console.error('[Profile] User not found in database:', userId);
    return (
      <div style={{ padding: '2rem' }}>
        <h2>User Not Found</h2>
        <p>User ID: {userId}</p>
        <p>This user does not exist in the database. Please try logging out and registering again.</p>
      </div>
    );
  }

  return <ProfileClient profile={profile} />;
}
