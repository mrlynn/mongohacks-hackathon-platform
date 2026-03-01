import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { ProjectModel } from "@/lib/db/models/Project";
import { ScoreModel } from "@/lib/db/models/Score";
import { EventModel } from "@/lib/db/models/Event";
import "@/lib/db/models/Team";

/**
 * GET /api/user/onboarding
 * Returns onboarding progress + auto-detected step completions.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const role = (session.user as any).role || "participant";

    const user = await UserModel.findById(userId)
      .select("onboardingProgress bio githubUsername")
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const progress = user.onboardingProgress || {
      completedSteps: [],
      tourCompleted: false,
      firstLoginSeen: false,
    };

    // Auto-detect completed steps based on role
    const autoDetected: string[] = [];

    if (role === "participant") {
      // Profile complete?
      if (user.bio && user.bio.length > 0) {
        autoDetected.push("participant.complete-profile");
      }

      // Registered for an event?
      const participant = await ParticipantModel.findOne({ userId }).lean();
      if (participant && (participant as any).registeredEvents?.length > 0) {
        autoDetected.push("participant.browse-events", "participant.register-event");
      }

      // On a team?
      if (participant) {
        const { TeamModel } = await import("@/lib/db/models/Team");
        const team = await TeamModel.findOne({
          members: userId,
        }).lean();
        if (team) {
          autoDetected.push("participant.join-team");

          // Has a project?
          const project = await ProjectModel.findOne({
            teamId: team._id,
          }).lean();
          if (project) {
            autoDetected.push("participant.create-project");
            if ((project as any).status === "submitted" || (project as any).status === "judged") {
              autoDetected.push("participant.submit-project");
            }
          }
        }
      }
    }

    if (role === "judge") {
      const scoreCount = await ScoreModel.countDocuments({ judgeId: userId });
      if (scoreCount > 0) {
        autoDetected.push("judge.view-events", "judge.score-first");
      }
    }

    if (role === "organizer" || role === "admin" || role === "super_admin") {
      const eventCount = await EventModel.countDocuments();
      if (eventCount > 0 && (role === "admin" || role === "super_admin")) {
        autoDetected.push("admin.manage-users");
      }
    }

    return NextResponse.json({
      success: true,
      progress,
      autoDetected,
    });
  } catch (error) {
    console.error("GET /api/user/onboarding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch onboarding progress" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/onboarding
 * Updates onboarding progress.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const body = await request.json();

    const updateOps: any = {};

    if (body.completeStep) {
      updateOps.$addToSet = {
        "onboardingProgress.completedSteps": body.completeStep,
      };
      updateOps.$set = {
        "onboardingProgress.lastStepCompletedAt": new Date(),
      };
    }

    if (body.dismiss === true) {
      updateOps.$set = {
        ...updateOps.$set,
        "onboardingProgress.dismissedAt": new Date(),
      };
    }

    if (body.tourCompleted === true) {
      updateOps.$set = {
        ...updateOps.$set,
        "onboardingProgress.tourCompleted": true,
      };
    }

    if (body.firstLoginSeen === true) {
      updateOps.$set = {
        ...updateOps.$set,
        "onboardingProgress.firstLoginSeen": true,
      };
    }

    if (body.resetDismiss === true) {
      updateOps.$unset = {
        "onboardingProgress.dismissedAt": "",
      };
    }

    if (Object.keys(updateOps).length === 0) {
      return NextResponse.json({ success: false, error: "No update provided" }, { status: 400 });
    }

    await UserModel.findByIdAndUpdate(userId, updateOps);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/user/onboarding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update onboarding progress" },
      { status: 500 }
    );
  }
}
