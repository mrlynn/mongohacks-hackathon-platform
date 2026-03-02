/**
 * Serialized data types for the Event Hub.
 * These represent the shapes returned by the hub API/page after
 * Mongoose .lean() + serializeDoc() — plain objects with string IDs.
 */

/** Serialized team member (populated from User) */
export interface HubMember {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

/** Serialized team leader (populated from User) */
export interface HubLeader {
  _id: string;
  name: string;
  email?: string;
}

/** Serialized team for hub display */
export interface HubTeam {
  _id: string;
  name: string;
  description?: string;
  members: HubMember[];
  leaderId: HubLeader | string;
  maxMembers: number;
  lookingForMembers: boolean;
  desiredSkills?: string[];
  requiredSkills?: string[];
  status: "forming" | "active" | "inactive";
  discordChannelUrl?: string;
  slackChannelUrl?: string;
  otherCommunicationUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** Serialized project for hub display */
export interface HubProject {
  _id: string;
  name: string;
  description: string;
  category: string;
  technologies: string[];
  repoUrl: string;
  demoUrl?: string;
  videoUrl?: string;
  docsUrl?: string;
  documentationUrl?: string;
  thumbnailUrl?: string;
  featured: boolean;
  status: "draft" | "submitted" | "under_review" | "judged";
  track?: string;
  submittedAt?: string;
  aiSummary?: string;
  aiFeedback?: string;
  githubUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** Schedule item from event */
export interface ScheduleItem {
  _id?: string;
  title: string;
  description?: string;
  start?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  location?: string;
  required?: boolean;
}

/** Serialized event for hub display */
export interface HubEvent {
  _id: string;
  name: string;
  description: string;
  theme: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  submissionDeadline?: string;
  status: "draft" | "open" | "in_progress" | "concluded";
  location?: string | {
    type?: "in-person" | "virtual" | "hybrid";
    venue?: string;
    address?: string;
    city?: string;
    virtualLink?: string;
  };
  resources?: {
    discordLink?: string;
    slackLink?: string;
    documentationUrl?: string;
    faqUrl?: string;
    rules?: string;
  };
  schedule?: ScheduleItem[];
  landingPage?: {
    template?: string;
    slug?: string;
    published?: boolean;
    backgroundImage?: string;
    customContent?: {
      hero?: {
        headline?: string;
        subheadline?: string;
        ctaText?: string;
        backgroundImage?: string;
      };
      about?: string;
      prizes?: Array<{ name: string; description?: string; value?: string }>;
      schedule?: ScheduleItem[];
      faq?: Array<{ question: string; answer: string }>;
    };
  };
}

/** Serialized participant for hub display */
export interface HubParticipant {
  _id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  skills: string[];
  interests: string[];
  experience_level: "beginner" | "intermediate" | "advanced";
  teamId: string | null;
  registeredEvents: Array<{
    eventId: string;
    registrationDate: string;
    status: "registered" | "attended" | "no_show";
  }>;
}

/** Next milestone calculated for participant */
export interface NextMilestone {
  title: string;
  description: string;
  deadline: string | Date | null;
  action: string;
  priority: string;
  icon: string;
}

/** Current event phase */
export interface EventPhase {
  name: string;
  progress: number;
  color: string;
}

/** Participant status flags */
export interface ParticipantStatus {
  registered: boolean;
  hasTeam: boolean;
  hasProject: boolean;
  projectSubmitted: boolean;
}

/** Full hub data returned by getHubData / hub API */
export interface EventHubData {
  event: HubEvent;
  participant: HubParticipant;
  team: HubTeam | null;
  project: HubProject | null;
  recommendedTeams: HubTeam[];
  nextMilestone: NextMilestone;
  upcomingSchedule: ScheduleItem[];
  currentPhase: EventPhase;
  participantStatus: ParticipantStatus;
}

/**
 * MUI Chip color type — the valid color values MUI accepts.
 * Use this instead of `as any` when passing dynamic colors to MUI Chip.
 */
export type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";
