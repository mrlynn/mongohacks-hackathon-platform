import type { UserRole } from "@/lib/admin-guard";

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  href?: string;
  icon: string; // MUI icon name
  tourAnchorSelector?: string; // CSS selector for Shepherd.js
  tourText?: string;
}

export interface JourneyMap {
  role: UserRole;
  welcomeMessage: string;
  steps: JourneyStep[];
}

export const journeyMaps: Partial<Record<UserRole, JourneyMap>> = {
  participant: {
    role: "participant",
    welcomeMessage:
      "Welcome to MongoDB Hackathons! Let's get you started on your hackathon journey.",
    steps: [
      {
        id: "participant.complete-profile",
        title: "Complete Your Profile",
        description:
          "Fill in your bio on the Profile page — this step is marked complete once your bio is saved.",
        href: "/profile",
        icon: "Person",
        tourAnchorSelector: "[data-tour='profile-link']",
        tourText:
          "Head to your profile and add a bio to complete this step. Teams will use it to find you.",
      },
      {
        id: "participant.browse-events",
        title: "Browse Events",
        description: "Explore upcoming hackathon events and find one that excites you.",
        href: "/events",
        icon: "EmojiEvents",
        tourAnchorSelector: "[data-tour='events-link']",
        tourText: "Browse available hackathon events here.",
      },
      {
        id: "participant.register-event",
        title: "Register for an Event",
        description: "Sign up for a hackathon that interests you.",
        href: "/events",
        icon: "HowToReg",
      },
      {
        id: "participant.join-team",
        title: "Create or Join a Team",
        description:
          "Team up with other participants to build something great together.",
        href: "/dashboard",
        icon: "Groups",
        tourAnchorSelector: "[data-tour='dashboard-link']",
        tourText:
          "Head to your dashboard to find and join a team, or create your own.",
      },
      {
        id: "participant.create-project",
        title: "Create a Project",
        description: "Start building your hackathon project with your team.",
        href: "/dashboard",
        icon: "Code",
      },
      {
        id: "participant.submit-project",
        title: "Submit Your Project",
        description: "Submit your completed project before the deadline.",
        href: "/dashboard",
        icon: "CloudUpload",
      },
      {
        id: "participant.view-results",
        title: "View Results",
        description: "Check the hackathon results and see how you did!",
        href: "/dashboard",
        icon: "Leaderboard",
      },
    ],
  },
  judge: {
    role: "judge",
    welcomeMessage:
      "Welcome, Judge! Here's how to get started with project evaluation.",
    steps: [
      {
        id: "judge.view-events",
        title: "View Assigned Events",
        description: "See which events you've been assigned to judge.",
        href: "/judging",
        icon: "Gavel",
        tourAnchorSelector: "[data-tour='judging-link']",
        tourText: "Access your judging assignments from here.",
      },
      {
        id: "judge.score-first",
        title: "Score Your First Project",
        description: "Review and score your first assigned project.",
        href: "/judging",
        icon: "RateReview",
      },
      {
        id: "judge.complete-all",
        title: "Complete All Assignments",
        description: "Finish scoring all projects assigned to you.",
        href: "/judging",
        icon: "CheckCircle",
      },
    ],
  },
  organizer: {
    role: "organizer",
    welcomeMessage:
      "Welcome, Organizer! Let's set up your first hackathon event.",
    steps: [
      {
        id: "organizer.create-event",
        title: "Create Your First Event",
        description: "Set up a new hackathon event with all the details.",
        href: "/admin/events",
        icon: "AddCircle",
        tourAnchorSelector: "[data-tour='admin-link']",
        tourText: "Access the admin panel to create and manage events.",
      },
      {
        id: "organizer.configure-landing",
        title: "Configure Landing Page",
        description: "Customize the public-facing landing page for your event.",
        href: "/admin/events",
        icon: "Web",
      },
      {
        id: "organizer.publish-event",
        title: "Publish Event",
        description: "Make your event visible and open for registrations.",
        href: "/admin/events",
        icon: "Publish",
      },
      {
        id: "organizer.assign-judges",
        title: "Assign Judges",
        description: "Assign judges to evaluate submitted projects.",
        href: "/admin/events",
        icon: "PersonAdd",
      },
      {
        id: "organizer.publish-results",
        title: "Publish Results",
        description: "Announce the winners and publish final results.",
        href: "/admin/events",
        icon: "EmojiEvents",
      },
    ],
  },
  marketer: {
    role: "marketer",
    welcomeMessage:
      "Welcome, Marketer! Let's get your event pages looking great.",
    steps: [
      {
        id: "marketer.customize-landing",
        title: "Customize a Landing Page",
        description: "Design and customize an event landing page.",
        href: "/admin/events",
        icon: "Palette",
        tourAnchorSelector: "[data-tour='admin-link']",
        tourText: "Head to the admin panel to customize event landing pages.",
      },
      {
        id: "marketer.manage-partners",
        title: "Manage Partners",
        description: "Add and manage partner organizations.",
        href: "/admin/partners",
        icon: "Handshake",
      },
      {
        id: "marketer.review-analytics",
        title: "Review Analytics",
        description: "Check event performance and engagement metrics.",
        href: "/admin/analytics",
        icon: "Analytics",
      },
    ],
  },
  admin: {
    role: "admin",
    welcomeMessage:
      "Welcome, Admin! Here's an overview of platform management.",
    steps: [
      {
        id: "admin.manage-users",
        title: "Manage Users",
        description: "View and manage platform users and their roles.",
        href: "/admin/users",
        icon: "Group",
        tourAnchorSelector: "[data-tour='admin-link']",
        tourText: "Access the admin panel for full platform management.",
      },
      {
        id: "admin.configure-settings",
        title: "Configure System Settings",
        description: "Set up site-wide configuration and preferences.",
        href: "/admin/settings",
        icon: "Settings",
      },
      {
        id: "admin.create-template",
        title: "Create Event Template",
        description: "Build reusable event templates for faster setup.",
        href: "/admin/settings/templates",
        icon: "FileCopy",
      },
    ],
  },
  super_admin: {
    role: "super_admin",
    welcomeMessage: "Welcome, Super Admin! You have full platform access.",
    steps: [], // Inherits admin steps — handled in provider
  },
  mentor: {
    role: "mentor",
    welcomeMessage:
      "Welcome, Mentor! Help teams succeed in their hackathon journey.",
    steps: [
      {
        id: "mentor.browse-teams",
        title: "Browse Teams",
        description: "See which teams are participating in active events.",
        href: "/events",
        icon: "Groups",
        tourAnchorSelector: "[data-tour='events-link']",
        tourText: "Browse events to find teams you can mentor.",
      },
      {
        id: "mentor.view-team-details",
        title: "View Team Details",
        description: "Check team members, skills, and project progress.",
        href: "/events",
        icon: "Info",
      },
    ],
  },
};

/**
 * Get the effective journey map for a role, falling back to admin steps for super_admin.
 */
export function getJourneyMap(role: string): JourneyMap | null {
  const map = journeyMaps[role as UserRole];
  if (!map) return null;

  // super_admin with no steps falls back to admin
  if (map.steps.length === 0 && role === "super_admin") {
    const adminMap = journeyMaps.admin;
    if (adminMap) {
      return { ...map, steps: adminMap.steps };
    }
  }

  return map;
}
