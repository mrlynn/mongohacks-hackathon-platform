import { connectToDatabase } from "@/lib/db/connection";
import { NotificationModel, NotificationType } from "@/lib/db/models/Notification";
import { UserModel } from "@/lib/db/models/User";
import { sendEmail } from "@/lib/email/email-service";
import { notificationEmail } from "@/lib/email/templates";

// Maps notification types to preference keys
const typeToPreference: Record<NotificationType, string | null> = {
  registration_confirmed: "eventReminders",
  event_reminder: "eventReminders",
  team_member_joined: "teamInvites",
  team_member_left: "teamInvites",
  team_invite: "teamInvites",
  project_submitted: "projectUpdates",
  registration_closed: "eventReminders",
  results_published: "eventReminders",
  judging_started: "eventReminders",
  judge_assigned: "eventReminders",
  score_received: "projectUpdates",
  general: null, // always send
};

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEvent?: string;
  relatedTeam?: string;
  relatedProject?: string;
  actionUrl?: string;
}

async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await connectToDatabase();

    // Always create in-app notification
    await NotificationModel.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedEvent: params.relatedEvent,
      relatedTeam: params.relatedTeam,
      relatedProject: params.relatedProject,
      actionUrl: params.actionUrl,
    });

    // Check if email should be sent
    const user = await UserModel.findById(params.userId).select(
      "email name notificationPreferences"
    );
    if (!user) return;

    const prefs = user.notificationPreferences || {};
    if (!prefs.emailNotifications) return;

    const prefKey = typeToPreference[params.type];
    if (prefKey && !(prefs as Record<string, boolean>)[prefKey]) return;

    // Send email (fire-and-forget within this async context)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const actionUrl = params.actionUrl
      ? `${baseUrl}${params.actionUrl}`
      : undefined;
    const template = notificationEmail(user.name, params.title, params.message, actionUrl);
    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    console.error("Notification service error:", error);
  }
}

// Fire-and-forget wrapper — callers don't need to await
function fireAndForget(fn: () => Promise<void>): void {
  fn().catch((err) => console.error("Notification fire-and-forget error:", err));
}

// --- Convenience methods ---

export function notifyRegistrationConfirmed(
  userId: string,
  eventName: string,
  eventId: string
): void {
  fireAndForget(() =>
    createNotification({
      userId,
      type: "registration_confirmed",
      title: "Registration Confirmed",
      message: `You have been registered for ${eventName}.`,
      relatedEvent: eventId,
      actionUrl: `/events/${eventId}/hub`,
    })
  );
}

export function notifyTeamMemberJoined(
  teamMemberIds: string[],
  memberName: string,
  teamName: string,
  eventId: string
): void {
  for (const userId of teamMemberIds) {
    fireAndForget(() =>
      createNotification({
        userId,
        type: "team_member_joined",
        title: "New Team Member",
        message: `${memberName} has joined team "${teamName}".`,
        relatedEvent: eventId,
        actionUrl: `/events/${eventId}/hub`,
      })
    );
  }
}

export function notifyTeamMemberLeft(
  teamMemberIds: string[],
  memberName: string,
  teamName: string,
  eventId: string
): void {
  for (const userId of teamMemberIds) {
    fireAndForget(() =>
      createNotification({
        userId,
        type: "team_member_left",
        title: "Team Member Left",
        message: `${memberName} has left team "${teamName}".`,
        relatedEvent: eventId,
        actionUrl: `/events/${eventId}/hub`,
      })
    );
  }
}

export function notifyProjectSubmitted(
  teamMemberIds: string[],
  projectName: string,
  eventId: string,
  projectId: string
): void {
  for (const userId of teamMemberIds) {
    fireAndForget(() =>
      createNotification({
        userId,
        type: "project_submitted",
        title: "Project Submitted",
        message: `Your project "${projectName}" has been submitted.`,
        relatedEvent: eventId,
        relatedProject: projectId,
        actionUrl: `/events/${eventId}/projects/${projectId}`,
      })
    );
  }
}

export function notifyResultsPublished(
  participantUserIds: string[],
  eventName: string,
  eventId: string
): void {
  for (const userId of participantUserIds) {
    fireAndForget(() =>
      createNotification({
        userId,
        type: "results_published",
        title: "Results Published",
        message: `Results for ${eventName} are now available!`,
        relatedEvent: eventId,
        actionUrl: `/events/${eventId}/hub`,
      })
    );
  }
}

export function notifyJudgeAssigned(
  judgeUserId: string,
  eventName: string,
  eventId: string
): void {
  fireAndForget(() =>
    createNotification({
      userId: judgeUserId,
      type: "judge_assigned",
      title: "Judge Assignment",
      message: `You have been assigned to judge projects for ${eventName}.`,
      relatedEvent: eventId,
      actionUrl: `/judging/${eventId}`,
    })
  );
}

export function notifyScoreReceived(
  teamMemberIds: string[],
  projectName: string,
  eventId: string,
  projectId: string
): void {
  for (const userId of teamMemberIds) {
    fireAndForget(() =>
      createNotification({
        userId,
        type: "score_received",
        title: "New Score Received",
        message: `Your project "${projectName}" has received a new score.`,
        relatedEvent: eventId,
        relatedProject: projectId,
        actionUrl: `/events/${eventId}/projects/${projectId}`,
      })
    );
  }
}

export function notifyTeamNotePosted(
  teamMemberIds: string[],
  authorName: string,
  teamName: string,
  eventId: string
): void {
  for (const userId of teamMemberIds) {
    fireAndForget(() =>
      createNotification({
        userId,
        type: "team_member_joined", // reuse team-related type
        title: "New Team Note",
        message: `${authorName} posted a note in team "${teamName}".`,
        relatedEvent: eventId,
        actionUrl: `/events/${eventId}/teams`,
      })
    );
  }
}
