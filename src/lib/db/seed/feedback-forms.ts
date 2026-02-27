import { connectToDatabase } from "@/lib/db/connection";
import { FeedbackFormConfigModel } from "@/lib/db/models/FeedbackFormConfig";

const builtInParticipantFeedbackForm = {
  name: "Standard Participant Feedback",
  slug: "standard-participant-feedback",
  description:
    "Post-event feedback form for hackathon participants. Captures satisfaction, experience level, and future interest.",
  isBuiltIn: true,
  targetAudience: "participant" as const,
  sections: [
    {
      id: "basic-info",
      title: "Basic Information",
      description: "Tell us about yourself",
      questions: [
        {
          id: "work-email",
          type: "short_text" as const,
          label: "Work Email",
          description: "",
          required: true,
          placeholder: "your.email@company.com",
          options: [],
        },
        {
          id: "full-name",
          type: "short_text" as const,
          label: "Full Name",
          description: "",
          required: true,
          placeholder: "",
          options: [],
        },
        {
          id: "job-title",
          type: "short_text" as const,
          label: "Job Title",
          description: "",
          required: false,
          placeholder: "",
          options: [],
        },
        {
          id: "team",
          type: "short_text" as const,
          label: "Team",
          description: "",
          required: false,
          placeholder: "",
          options: [],
        },
        {
          id: "location",
          type: "short_text" as const,
          label: "Location (City, State, Country)",
          description: "",
          required: true,
          placeholder: "e.g. New York, NY, USA",
          options: [],
        },
      ],
    },
    {
      id: "content-feedback",
      title: "Content",
      description: "We value your feedback!",
      questions: [
        {
          id: "nps",
          type: "linear_scale" as const,
          label:
            "Overall, would you recommend this event to a friend or a colleague looking to learn more about MongoDB?",
          description: "",
          required: true,
          placeholder: "",
          options: [],
          scaleConfig: {
            min: 1,
            max: 10,
            minLabel: "No",
            maxLabel: "Absolutely",
          },
        },
        {
          id: "prior-experience",
          type: "multiple_choice" as const,
          label:
            "Prior to the event, what was your level of experience with MongoDB?",
          description: "",
          required: true,
          placeholder: "",
          options: [
            "No experience: I have never used MongoDB",
            "Beginner: I have begun learning how to use MongoDB but lack in-depth knowledge",
            "Intermediate: I am comfortable using MongoDB and can perform common queries and operations",
            "Expert: I have expert-level knowledge of MongoDB and can architect, design, and implement large-scale applications",
          ],
        },
        {
          id: "awareness-search",
          type: "multiple_choice" as const,
          label:
            "What was your level of awareness and experience with Atlas Text Search and Vector Search before the event?",
          description: "",
          required: true,
          placeholder: "",
          options: [
            "No awareness: I had never heard of them",
            "Basic awareness: I knew they existed but didn't know about the benefits and key features",
            "Aware but no experience: I knew about the benefits and key features, but have not used them",
            "Aware and moderately experienced: I knew about them and have run some queries",
            "Highly aware and experienced: I was very familiar with them, implemented features with them, on multiple occasions",
          ],
        },
        {
          id: "rate-communication",
          type: "linear_scale" as const,
          label:
            "How would you rate the communication, resources and support you received from MongoDB?",
          description: "",
          required: true,
          placeholder: "",
          options: [],
          scaleConfig: {
            min: 1,
            max: 5,
            minLabel: "Poor",
            maxLabel: "Excellent",
          },
        },
        {
          id: "improve-communication",
          type: "long_text" as const,
          label:
            "What can we do to improve our communication, resources, or support?",
          description: "",
          required: false,
          placeholder: "",
          options: [],
        },
        {
          id: "better-equipped",
          type: "linear_scale" as const,
          label:
            "Do you feel better equipped to work with MongoDB after participating in the event?",
          description: "",
          required: true,
          placeholder: "",
          options: [],
          scaleConfig: {
            min: 1,
            max: 5,
            minLabel: "Strongly Disagree",
            maxLabel: "Strongly Agree",
          },
        },
      ],
    },
    {
      id: "future-interest",
      title: "Future Interest",
      description: "We value your feedback!",
      questions: [
        {
          id: "contact-interest",
          type: "multiple_choice" as const,
          label:
            "Are you interested in getting in touch with your MongoDB team for a deeper dive (i.e. use case discussion, design review)?",
          description: "",
          required: false,
          placeholder: "",
          options: [
            "Yes - General use case discussion",
            "Yes - Design Review (An hour-long free session that helps you fine-tune your data model for specific use cases)",
            "No - Not at this time",
            "I'm not sure if I'm ready yet, can we have an introductory chat?",
          ],
        },
        {
          id: "use-case-description",
          type: "long_text" as const,
          label:
            'If you answered "Yes", please describe your use case',
          description: "",
          required: false,
          placeholder: "",
          options: [],
        },
        {
          id: "future-topics",
          type: "checkbox" as const,
          label:
            "What topics or areas would you like to see covered in future events?",
          description: "",
          required: false,
          placeholder: "",
          options: [
            "Intro + Access to Atlas (MongoDB 101) Session",
            "Data Modeling Session",
            "Relational Migrator Lab Session",
            "Introduction to Vector Search Session",
            "AI RAG Lab",
            "AI Agents Lab",
            "Stream Processing Intro Session",
            "Running efficient queries",
            "Choosing proper indexes",
            "Maintaining high availability",
            "Horizontal scaling",
            "Application driven analytics",
            "Deploying full text search",
          ],
        },
        {
          id: "final-feedback",
          type: "long_text" as const,
          label:
            "We want this to be a great experience for you. Is there anything else we could've done better?",
          description: "",
          required: false,
          placeholder: "",
          options: [],
        },
      ],
    },
  ],
};

const builtInPartnerFeedbackForm = {
  name: "Standard Partner Feedback",
  slug: "standard-partner-feedback",
  description:
    "Post-event feedback form for hackathon partners and sponsors.",
  isBuiltIn: true,
  targetAudience: "partner" as const,
  sections: [
    {
      id: "partner-info",
      title: "Partner Information",
      description: "Tell us about your organization",
      questions: [
        {
          id: "contact-name",
          type: "short_text" as const,
          label: "Contact Name",
          description: "",
          required: true,
          placeholder: "",
          options: [],
        },
        {
          id: "contact-email",
          type: "short_text" as const,
          label: "Contact Email",
          description: "",
          required: true,
          placeholder: "",
          options: [],
        },
        {
          id: "organization",
          type: "short_text" as const,
          label: "Organization",
          description: "",
          required: true,
          placeholder: "",
          options: [],
        },
        {
          id: "role",
          type: "short_text" as const,
          label: "Your Role",
          description: "",
          required: false,
          placeholder: "",
          options: [],
        },
      ],
    },
    {
      id: "partner-experience",
      title: "Event Experience",
      description: "Share your experience as a partner",
      questions: [
        {
          id: "overall-satisfaction",
          type: "linear_scale" as const,
          label: "How would you rate your overall experience as a partner?",
          description: "",
          required: true,
          placeholder: "",
          options: [],
          scaleConfig: {
            min: 1,
            max: 5,
            minLabel: "Poor",
            maxLabel: "Excellent",
          },
        },
        {
          id: "nps-partner",
          type: "linear_scale" as const,
          label:
            "How likely are you to partner with us for future events?",
          description: "",
          required: true,
          placeholder: "",
          options: [],
          scaleConfig: {
            min: 1,
            max: 10,
            minLabel: "Not likely",
            maxLabel: "Very likely",
          },
        },
        {
          id: "communication-rating",
          type: "linear_scale" as const,
          label:
            "How would you rate the communication and coordination from our team?",
          description: "",
          required: true,
          placeholder: "",
          options: [],
          scaleConfig: {
            min: 1,
            max: 5,
            minLabel: "Poor",
            maxLabel: "Excellent",
          },
        },
        {
          id: "value-delivered",
          type: "multiple_choice" as const,
          label: "Did the partnership deliver the value you expected?",
          description: "",
          required: true,
          placeholder: "",
          options: [
            "Exceeded expectations",
            "Met expectations",
            "Below expectations",
            "Far below expectations",
          ],
        },
        {
          id: "improvements",
          type: "long_text" as const,
          label:
            "What could we do to improve the partner experience?",
          description: "",
          required: false,
          placeholder: "",
          options: [],
        },
        {
          id: "additional-feedback",
          type: "long_text" as const,
          label: "Any additional feedback or suggestions?",
          description: "",
          required: false,
          placeholder: "",
          options: [],
        },
      ],
    },
  ],
};

export async function seedFeedbackForms() {
  await connectToDatabase();

  for (const formData of [
    builtInParticipantFeedbackForm,
    builtInPartnerFeedbackForm,
  ]) {
    await FeedbackFormConfigModel.findOneAndUpdate(
      { slug: formData.slug },
      { $set: formData },
      { upsert: true, new: true }
    );
  }

  console.log("Feedback forms seeded successfully");
}

// Allow running as a standalone script
if (require.main === module) {
  seedFeedbackForms()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
