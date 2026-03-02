export interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

export interface RubricTemplate {
  id: string;
  name: string;
  description: string;
  criteria: RubricCriterion[];
}

export const RUBRIC_TEMPLATES: RubricTemplate[] = [
  {
    id: "standard",
    name: "Standard Hackathon",
    description: "Classic hackathon rubric covering innovation, technical execution, impact, and presentation",
    criteria: [
      { name: "innovation", description: "How novel and creative is the solution?", weight: 1, maxScore: 10 },
      { name: "technical", description: "How sophisticated is the implementation?", weight: 1, maxScore: 10 },
      { name: "impact", description: "How valuable is the solution to users?", weight: 1, maxScore: 10 },
      { name: "presentation", description: "How well is the project documented and demoed?", weight: 1, maxScore: 10 },
    ],
  },
  {
    id: "mongodb",
    name: "MongoDB Focused",
    description: "Evaluates data modeling, query performance, and use of MongoDB/Atlas features",
    criteria: [
      { name: "data_model_design", description: "How well-designed is the data model? Does it leverage MongoDB document structure effectively?", weight: 2, maxScore: 10 },
      { name: "query_performance", description: "Are queries efficient? Is indexing used appropriately?", weight: 1, maxScore: 10 },
      { name: "atlas_feature_usage", description: "Does the project use Atlas features (Search, Vector Search, Charts, Triggers, etc.)?", weight: 2, maxScore: 10 },
      { name: "innovation", description: "How creative and original is the solution?", weight: 1, maxScore: 10 },
      { name: "presentation", description: "How well is the project documented and demoed?", weight: 1, maxScore: 10 },
    ],
  },
  {
    id: "ai_ml",
    name: "AI/ML Hackathon",
    description: "Focused on AI/ML projects — model quality, data pipeline, and responsible AI practices",
    criteria: [
      { name: "model_quality", description: "How accurate and effective is the AI/ML model? Is the approach well-suited to the problem?", weight: 2, maxScore: 10 },
      { name: "innovation", description: "How novel is the application of AI/ML? Does it solve a real problem creatively?", weight: 1, maxScore: 10 },
      { name: "data_pipeline", description: "How well is data collected, cleaned, and processed? Is the pipeline reproducible?", weight: 1, maxScore: 10 },
      { name: "ux_demo", description: "Is the end-user experience intuitive? Does the demo clearly show the AI in action?", weight: 1, maxScore: 10 },
      { name: "documentation", description: "Is the approach well-documented? Are model choices, training data, and limitations explained?", weight: 1, maxScore: 10 },
    ],
  },
  {
    id: "beginner",
    name: "Beginner Friendly",
    description: "Emphasizes learning, effort, and teamwork — ideal for first-time hackathon participants",
    criteria: [
      { name: "effort_learning", description: "How much did the team learn and grow during the hackathon?", weight: 2, maxScore: 10 },
      { name: "creativity", description: "How creative and original is the idea?", weight: 1, maxScore: 10 },
      { name: "working_demo", description: "Does the project have a functional demo, even if basic?", weight: 1, maxScore: 10 },
      { name: "teamwork", description: "Did the team collaborate effectively? Were roles well-distributed?", weight: 1, maxScore: 10 },
      { name: "presentation", description: "How clearly did the team present their project and journey?", weight: 1, maxScore: 10 },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Evaluates business readiness — scalability, security, architecture, and business value",
    criteria: [
      { name: "business_value", description: "Does the solution address a real business need? Is the value proposition clear?", weight: 2, maxScore: 10 },
      { name: "scalability", description: "Can the solution handle production-level traffic and data volumes?", weight: 1, maxScore: 10 },
      { name: "security", description: "Are security best practices followed? Is data protected appropriately?", weight: 1, maxScore: 10 },
      { name: "ux_design", description: "Is the user experience polished and professional?", weight: 1, maxScore: 10 },
      { name: "technical_architecture", description: "Is the architecture well-structured, maintainable, and documented?", weight: 1, maxScore: 10 },
    ],
  },
];
