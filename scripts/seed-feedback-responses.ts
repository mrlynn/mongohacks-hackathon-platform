#!/usr/bin/env tsx

import { config } from "dotenv";
config({ path: ".env.local" });

import { connectToDatabase } from "../src/lib/db/connection";
import { FeedbackResponseModel } from "../src/lib/db/models/FeedbackResponse";
import { FeedbackFormConfigModel } from "../src/lib/db/models/FeedbackFormConfig";
import { EventModel } from "../src/lib/db/models/Event";

async function seedFeedbackResponses() {
  await connectToDatabase();

  console.log("🌱 Seeding feedback responses...\n");

  // Get concluded event
  const event = await EventModel.findOne({ status: "concluded" });
  if (!event) {
    console.log("❌ No concluded event found");
    return;
  }

  // Get feedback forms
  const participantForm = await FeedbackFormConfigModel.findOne({
    slug: "standard-participant-feedback",
  });
  const partnerForm = await FeedbackFormConfigModel.findOne({
    slug: "standard-partner-feedback",
  });

  if (!participantForm) {
    console.log("❌ No participant form found");
    return;
  }

  console.log(`📅 Event: ${event.name}`);
  console.log(`📝 Forms: ${participantForm.name}${partnerForm ? `, ${partnerForm.name}` : ''}\n`);

  // Clear existing responses for this event
  await FeedbackResponseModel.deleteMany({ eventId: event._id });

  // Sample participant responses with varying NPS scores
  const participantResponses = [
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      nps: 10,
      priorExp: "Intermediate: I am comfortable using MongoDB and can perform common queries and operations",
      awareness: "Aware and moderately experienced: I knew about them and have run some queries",
      communication: 5,
      betterEquipped: 5,
    },
    {
      name: "Bob Smith",
      email: "bob@example.com",
      nps: 9,
      priorExp: "Beginner: I have begun learning how to use MongoDB but lack in-depth knowledge",
      awareness: "Basic awareness: I knew they existed but didn't know about the benefits and key features",
      communication: 5,
      betterEquipped: 5,
    },
    {
      name: "Charlie Davis",
      email: "charlie@example.com",
      nps: 9,
      priorExp: "Expert: I have expert-level knowledge of MongoDB and can architect, design, and implement large-scale applications",
      awareness: "Highly aware and experienced: I was very familiar with them, implemented features with them, on multiple occasions",
      communication: 4,
      betterEquipped: 5,
    },
    {
      name: "Diana Martinez",
      email: "diana@example.com",
      nps: 8,
      priorExp: "Intermediate: I am comfortable using MongoDB and can perform common queries and operations",
      awareness: "Aware but no experience: I knew about the benefits and key features, but have not used them",
      communication: 4,
      betterEquipped: 4,
    },
    {
      name: "Ethan Wilson",
      email: "ethan@example.com",
      nps: 8,
      priorExp: "Beginner: I have begun learning how to use MongoDB but lack in-depth knowledge",
      awareness: "Aware and moderately experienced: I knew about them and have run some queries",
      communication: 5,
      betterEquipped: 4,
    },
    {
      name: "Fiona Chen",
      email: "fiona@example.com",
      nps: 7,
      priorExp: "Beginner: I have begun learning how to use MongoDB but lack in-depth knowledge",
      awareness: "Basic awareness: I knew they existed but didn't know about the benefits and key features",
      communication: 4,
      betterEquipped: 4,
    },
    {
      name: "George Taylor",
      email: "george@example.com",
      nps: 7,
      priorExp: "Intermediate: I am comfortable using MongoDB and can perform common queries and operations",
      awareness: "Aware but no experience: I knew about the benefits and key features, but have not used them",
      communication: 3,
      betterEquipped: 3,
    },
    {
      name: "Hannah Lee",
      email: "hannah@example.com",
      nps: 6,
      priorExp: "No experience: I have never used MongoDB",
      awareness: "No awareness: I had never heard of them",
      communication: 3,
      betterEquipped: 4,
    },
    {
      name: "Ian Rodriguez",
      email: "ian@example.com",
      nps: 5,
      priorExp: "Beginner: I have begun learning how to use MongoDB but lack in-depth knowledge",
      awareness: "Basic awareness: I knew they existed but didn't know about the benefits and key features",
      communication: 3,
      betterEquipped: 3,
    },
    {
      name: "Julia Anderson",
      email: "julia@example.com",
      nps: 4,
      priorExp: "No experience: I have never used MongoDB",
      awareness: "No awareness: I had never heard of them",
      communication: 2,
      betterEquipped: 2,
    },
  ];

  let count = 0;

  for (const resp of participantResponses) {
    const answers = new Map<string, unknown>();
    answers.set("work-email", resp.email);
    answers.set("full-name", resp.name);
    answers.set("job-title", "Developer");
    answers.set("location", "San Francisco, CA, USA");
    answers.set("nps", resp.nps);
    answers.set("prior-experience", resp.priorExp);
    answers.set("awareness-search", resp.awareness);
    answers.set("rate-communication", resp.communication);
    answers.set("better-equipped", resp.betterEquipped);

    await FeedbackResponseModel.create({
      formId: participantForm._id,
      eventId: event._id,
      respondentEmail: resp.email,
      respondentName: resp.name,
      respondentType: "participant",
      answers,
      submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
    });

    count++;
  }

  console.log(`✅ Created ${count} participant responses`);

  // Sample partner responses if partner form exists
  if (partnerForm) {
    const partnerResponses = [
      {
        name: "MongoDB Inc",
        email: "partner@mongodb.com",
        nps: 10,
        satisfaction: 5,
        communication: 5,
        value: "Exceeded expectations",
      },
      {
        name: "Tech Startup Inc",
        email: "partner@techstartup.com",
        nps: 9,
        satisfaction: 5,
        communication: 4,
        value: "Met expectations",
      },
      {
        name: "DevTools Co",
        email: "partner@devtools.com",
        nps: 8,
        satisfaction: 4,
        communication: 4,
        value: "Met expectations",
      },
    ];

    let partnerCount = 0;

    for (const resp of partnerResponses) {
      const answers = new Map<string, unknown>();
      answers.set("contact-name", resp.name);
      answers.set("contact-email", resp.email);
      answers.set("organization", resp.name);
      answers.set("role", "Partnership Manager");
      answers.set("overall-satisfaction", resp.satisfaction);
      answers.set("nps-partner", resp.nps);
      answers.set("communication-rating", resp.communication);
      answers.set("value-delivered", resp.value);

      await FeedbackResponseModel.create({
        formId: partnerForm._id,
        eventId: event._id,
        respondentEmail: resp.email,
        respondentName: resp.name,
        respondentType: "partner",
        answers,
        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });

      partnerCount++;
    }

    console.log(`✅ Created ${partnerCount} partner responses`);
  }

  console.log("\n🎉 Feedback responses seeded successfully!");
}

seedFeedbackResponses()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
