export const testEvent = {
  name: "Test Hackathon 2026",
  description: "A test hackathon for automated testing",
  theme: "AI & Machine Learning",
  startDate: new Date("2026-03-15T09:00:00Z"),
  endDate: new Date("2026-03-17T18:00:00Z"),
  registrationDeadline: new Date("2026-03-10T23:59:59Z"),
  location: "Test Convention Center, Test City, TC",
  city: "Test City",
  country: "United States",
  venue: "Test Convention Center",
  capacity: 100,
  isVirtual: false,
  coordinates: {
    type: "Point",
    coordinates: [-74.006, 40.7128], // [longitude, latitude]
  },
  status: "open",
  tags: ["AI/ML", "Web Development", "Mobile"],
  rules: "Standard hackathon rules apply",
  judging_criteria: ["Innovation", "Technical", "Impact", "Presentation"],
  organizers: [],
  landingPage: {
    template: "modern" as const,
    slug: "test-hackathon-2026",
    published: true,
    customContent: {
      hero: {
        headline: "Build the Future with AI",
        subheadline: "Join us for 48 hours of innovation",
        ctaText: "Register Now",
      },
      prizes: [
        { title: "First Place", description: "Grand Prize", value: "$5000" },
        { title: "Second Place", description: "Runner Up", value: "$2500" },
      ],
      sponsors: [
        {
          name: "MongoDB",
          logo: "https://example.com/mongodb-logo.png",
          tier: "platinum",
        },
      ],
    },
  },
};

export const closedEvent = {
  ...testEvent,
  name: "Past Hackathon",
  status: "concluded" as const,
  startDate: new Date("2025-01-15T09:00:00Z"),
  endDate: new Date("2025-01-17T18:00:00Z"),
  registrationDeadline: new Date("2025-01-10T23:59:59Z"),
  landingPage: {
    template: "tech" as const,
    slug: "past-hackathon",
    published: true,
    customContent: {
      hero: {
        headline: "Past Event",
        subheadline: "This event has concluded",
        ctaText: "View Results",
      },
    },
  },
};
