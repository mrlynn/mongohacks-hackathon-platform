# Hackathon Management Platform - Development Instructions
## Tech Stack: Next.js 14+ | Material UI v7 | MongoDB | TypeScript | OpenAI API

---

## PROJECT OVERVIEW

**Purpose**: Build a comprehensive hackathon management platform that handles event lifecycle, participant engagement, and intelligent project evaluation.

**Core Philosophy**: Leverage MongoDB's Vector Search and AI capabilities to automate administrative tasks, enhance matching between participants/projects, and provide intelligent project evaluation and feedback.

---

## TECHNICAL ARCHITECTURE

### Tech Stack Specifications
- **Frontend**: Next.js 14+ with App Router, React 18+
- **UI Components**: Material UI v7 (MUI)
- **Styling**: MUI theme system and `sx` prop (NO Tailwind)
- **Backend**: Next.js API routes (MongoDB connection pooling)
- **Database**: MongoDB Atlas (dedicated cluster recommended for production)
- **Vector Search**: MongoDB Atlas Search (Vector tier)
- **AI/LLM**: OpenAI API (GPT-4 turbo or latest available)
- **Language**: TypeScript (strict mode)
- **Authentication**: NextAuth.js v5 with MongoDB adapter
- **Data Validation**: Zod for schema validation

### Project Structure
```
hackathon-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── admin/
│   │   ├── dashboard/
│   │   ├── events/
│   │   ├── projects/
│   │   ├── judging/
│   │   └── api/
│   ├── components/
│   │   ├── common/
│   │   ├── events/
│   │   ├── judging/
│   │   └── shared-ui/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── models/
│   │   │   ├── connection.ts
│   │   │   └── schemas.ts
│   │   ├── ai/
│   │   │   ├── rag-service.ts
│   │   │   ├── judging-evaluator.ts
│   │   │   └── matching-engine.ts
│   │   ├── vector-search/
│   │   │   └── search-service.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── types/
│   └── styles/
│       └── theme.ts
├── .env.local
├── tsconfig.json
└── package.json
```

---

## CORE FEATURES & AI/LLM INTEGRATION POINTS

### 1. EVENT MANAGEMENT

**Features**:
- Create and manage hackathon events
- Set event details (date, location, theme, rules, capacity)
- Event timeline and milestone tracking
- Public event listings with filtering/search

**Database Model**:
```typescript
interface HackathonEvent {
  _id: ObjectId;
  name: string;
  description: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  location: string;
  capacity: number;
  isVirtual: boolean;
  tags: string[];
  rules: string;
  judging_criteria: string[];
  organizers: ObjectId[];
  status: "draft" | "open" | "in_progress" | "concluded";
  descriptionEmbedding: number[]; // Vector embedding for search
  createdAt: Date;
  updatedAt: Date;
}
```

**AI Integration Point**: Generate event descriptions and judging criteria using LLM based on theme and organizer prompts.

---

### 2. INVITATION & REGISTRATION SYSTEM

**Features**:
- Send personalized invitations to potential participants
- Manage registration and RSVP tracking
- Participant profiles with skills and interests
- Team formation tools

**Database Model**:
```typescript
interface Participant {
  _id: ObjectId;
  userId: ObjectId;
  email: string;
  name: string;
  bio: string;
  skills: string[];
  interests: string[];
  experience_level: "beginner" | "intermediate" | "advanced";
  skillsEmbedding: number[]; // Vector for matching
  pastProjects: string[];
  invitedToEvents: ObjectId[];
  registeredEvents: {
    eventId: ObjectId;
    registrationDate: Date;
    status: "registered" | "attended" | "no_show";
  }[];
  teamId: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Invitation {
  _id: ObjectId;
  eventId: ObjectId;
  recipientEmail: string;
  senderUserId: ObjectId;
  personalMessage: string;
  status: "sent" | "accepted" | "declined";
  sentDate: Date;
  responseDate?: Date;
}
```

**AI Integration Points**:
- **Intelligent Matching**: Use Vector Search to match participants with similar skills/interests to form teams
- **Personalized Invitations**: Generate custom invitation messages using LLM based on participant skills and event theme
- **Team Recommendation Engine**: RAG-based system suggesting team compositions

---

### 3. ATTENDANCE TRACKING

**Features**:
- QR code check-in system
- Real-time attendance monitoring
- Attendance analytics and reports
- Automated reminders for no-shows

**Database Model**:
```typescript
interface AttendanceRecord {
  _id: ObjectId;
  eventId: ObjectId;
  participantId: ObjectId;
  checkInTime: Date;
  checkOutTime?: Date;
  status: "checked_in" | "checked_out" | "absent";
  source: "qr_code" | "manual" | "auto_verified";
  createdAt: Date;
}
```

**Implementation Notes**:
- API endpoints for QR code validation
- Real-time dashboard showing live attendance stats
- No AI complexity needed here; focus on reliability

---

### 4. PROJECT MANAGEMENT & SUBMISSION

**Features**:
- Teams submit project descriptions
- Link to repositories, demos, documentation
- Version tracking for iterations
- File upload capabilities

**Database Model**:
```typescript
interface Project {
  _id: ObjectId;
  eventId: ObjectId;
  teamId: ObjectId;
  name: string;
  description: string;
  descriptionEmbedding: number[]; // Vector for search & RAG
  category: string;
  technologies: string[];
  repoUrl: string;
  demoUrl?: string;
  documentationUrl?: string;
  submissionDate: Date;
  lastModified: Date;
  status: "draft" | "submitted" | "under_review" | "judged";
  innovations: string; // Key innovations/features
  teamMembers: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

**AI Integration Point**: 
- Auto-extract key features and innovations from project descriptions using LLM
- Generate project tags/categories
- Create summaries for judging panel

---

### 5. INTELLIGENT PROJECT JUDGING SYSTEM (Primary AI/RAG Feature)

**Features**:
- Structured judging rubric based on event criteria
- AI-powered preliminary analysis of projects
- Judge assignment with conflict-of-interest detection
- Real-time scoring interface
- Automated summary generation
- Award recommendation system

**Database Models**:
```typescript
interface JudgingRubric {
  _id: ObjectId;
  eventId: ObjectId;
  criteria: {
    name: string;
    description: string;
    weight: number; // 0-1
    maxScore: number;
  }[];
  totalWeight: number; // Should equal 1
}

interface JudgeAssignment {
  _id: ObjectId;
  eventId: ObjectId;
  judgeUserId: ObjectId;
  assignedProjects: ObjectId[];
  category?: string;
  conflictsOfInterest: string[]; // emails/participant IDs to avoid
  createdAt: Date;
}

interface ProjectScore {
  _id: ObjectId;
  projectId: ObjectId;
  judgeId: ObjectId;
  rubricId: ObjectId;
  scores: {
    criteriaId: string;
    score: number;
    feedback: string;
  }[];
  aiGeneratedSummary: string;
  overallComments: string;
  overallScore: number;
  submittedAt: Date;
}

interface AwardRecommendation {
  _id: ObjectId;
  eventId: ObjectId;
  projectId: ObjectId;
  awardCategory: string;
  recommendationScore: number;
  justification: string; // Generated by AI
  isFinal: boolean;
  createdAt: Date;
}
```

**AI/RAG Implementation**:

1. **Project Analysis Pipeline**:
   - Ingest project description, tech stack, and innovations
   - Generate vector embeddings for semantic search
   - Create concise 2-3 sentence AI summary for judges
   - Extract key features and innovation highlights

2. **Intelligent Scoring Assistance**:
   - Pre-populate feedback suggestions based on rubric criteria
   - Flag potential scoring inconsistencies (outliers vs other judges)
   - Generate contextual prompts to help judges evaluate fairly

3. **RAG-Based Award Recommendations**:
   - Retrieve similar projects from past hackathons (Vector Search)
   - Analyze current project scores against historical context
   - Generate justification for award recommendations
   - Suggest special category awards based on project characteristics

4. **Feedback Generation**:
   - Create constructive feedback summaries for each project
   - Identify key strengths and improvement areas
   - Generate personalized recommendations for team follow-up

**RAG Context Sources**:
- Event rules and judging guidelines
- Past winning projects and their evaluations
- Project submission descriptions
- Judge feedback history
- Rubric descriptions and weighting

---

## DATABASE SCHEMA & VECTOR SEARCH SETUP

### Vector Search Indexes

**1. Participant Skills Index**:
```json
{
  "name": "participant_skills_vector",
  "type": "vectorSearch",
  "fields": [
    {
      "path": "skillsEmbedding",
      "type": "vector",
      "dimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

**2. Event Description Index**:
```json
{
  "name": "event_description_vector",
  "type": "vectorSearch",
  "fields": [
    {
      "path": "descriptionEmbedding",
      "type": "vector",
      "dimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

**3. Project Description Index**:
```json
{
  "name": "project_description_vector",
  "type": "vectorSearch",
  "fields": [
    {
      "path": "descriptionEmbedding",
      "type": "vector",
      "dimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

### Regular Indexes
```javascript
// Participants
db.participants.createIndex({ email: 1 }, { unique: true });
db.participants.createIndex({ registeredEvents: 1 });
db.participants.createIndex({ skills: 1 });

// Projects
db.projects.createIndex({ eventId: 1, status: 1 });
db.projects.createIndex({ teamId: 1 });

// Scores
db.projectScores.createIndex({ projectId: 1, judgeId: 1 }, { unique: true });
db.projectScores.createIndex({ eventId: 1 });
```

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup with Next.js, MUI, MongoDB connection
- [ ] Database schema definition and indexes
- [ ] Authentication system (NextAuth.js)
- [ ] Basic CRUD for HackathonEvent and Participant models
- [ ] Event listing and detail pages

**Deliverable**: Basic event management, user registration

---

### Phase 2: Core Features (Weeks 3-4)
- [ ] Invitation system with email integration
- [ ] Team formation tools
- [ ] QR code check-in system
- [ ] Attendance tracking dashboard
- [ ] Project submission system

**Deliverable**: Full event lifecycle management

---

### Phase 3: AI/Vector Integration (Weeks 5-6)
- [ ] Set up OpenAI API integration
- [ ] Implement vector embedding generation for descriptions/skills
- [ ] Create Vector Search indices
- [ ] Build participant-project matching engine
- [ ] Implement team recommendation system

**Deliverable**: Intelligent matching and recommendation features

---

### Phase 4: Judging System (Weeks 7-8)
- [ ] Build judging rubric creation interface
- [ ] Create judge assignment system
- [ ] Implement scoring interface with MUI
- [ ] Build RAG service for project analysis
- [ ] Implement AI-powered scoring assistance

**Deliverable**: Core judging workflow with AI analysis

---

### Phase 5: Intelligence & Analytics (Weeks 9-10)
- [ ] Implement award recommendation engine
- [ ] Build comprehensive judging analytics dashboard
- [ ] Create feedback generation system
- [ ] Implement historical project analysis (RAG)
- [ ] Build reporting and export features

**Deliverable**: Complete judging platform with AI insights

---

## KEY IMPLEMENTATION DETAILS

### Vector Embedding Generation

Create a utility service:
```typescript
// lib/ai/embedding-service.ts
import { OpenAI } from "openai";

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small", // Cost-effective for vectors
    input: text,
  });

  return response.data[0].embedding;
}
```

### RAG Service Implementation
```typescript
// lib/ai/rag-service.ts
interface RAGContext {
  eventRules: string;
  judgingCriteria: string;
  similarProjects: Project[];
  historicalFeedback: string[];
}

export async function analyzeProjectWithRAG(
  project: Project,
  context: RAGContext
): Promise<{
  summary: string;
  highlights: string[];
  concerns?: string[];
}> {
  const openai = new OpenAI();

  const systemPrompt = `You are an expert hackathon judge. Analyze projects based on:
- Event Rules: ${context.eventRules}
- Judging Criteria: ${context.judgingCriteria}
- Similar Past Projects: ${JSON.stringify(context.similarProjects.map((p) => p.name))}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Analyze this project: ${JSON.stringify(project)}`,
      },
    ],
  });

  // Parse response and structure output
  return parseAnalysisResponse(response.choices[0].message.content);
}
```

### Participant Matching Engine
```typescript
// lib/ai/matching-engine.ts
export async function findMatchingTeammates(
  participant: Participant,
  eventId: ObjectId,
  limit: number = 5
): Promise<Participant[]> {
  // 1. Generate/get embedding for participant skills
  const participantSkillText = `${participant.skills.join(" ")} ${participant.bio}`;
  const skillEmbedding = await generateEmbedding(participantSkillText);

  // 2. Use Vector Search to find similar participants
  const matchedParticipants = await db.collection("participants").aggregate([
    {
      $search: {
        cosmosSearch: {
          vector: skillEmbedding,
          k: limit,
        },
        returnStoredSource: true,
      },
    },
    {
      $match: {
        "registeredEvents.eventId": eventId,
        _id: { $ne: participant._id },
      },
    },
    {
      $limit: limit,
    },
  ]);

  return matchedParticipants.toArray();
}
```

### MUI Theme Configuration
```typescript
// src/styles/theme.ts
import { createTheme } from "@mui/material/styles";

export const hackathonTheme = createTheme({
  palette: {
    primary: {
      main: "#6366f1", // Indigo - hackathon energy
    },
    secondary: {
      main: "#ec4899", // Pink - highlight
    },
    success: {
      main: "#10b981", // Green - scoring/completion
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});
```

---

## API ROUTES STRUCTURE
```
/api/
├── /events/
│   ├── route.ts (GET, POST)
│   ├── /[eventId]/
│   │   ├── route.ts (GET, PATCH)
│   │   ├── /projects/
│   │   ├── /participants/
│   │   └── /judging/
├── /projects/
│   ├── route.ts (GET, POST)
│   ├── /[projectId]/
│   │   ├── route.ts (GET, PATCH)
│   │   ├── /analyze (POST - AI analysis)
│   │   └── /scores/
├── /judging/
│   ├── /scores/ (POST, GET)
│   ├── /recommendations/ (GET, POST)
│   └── /judge-assignment/ (POST)
├── /matching/
│   ├── /teammates (GET - find matches)
│   └── /team-recommendations (POST)
├── /attendance/
│   └── /checkin (POST - QR code)
└── /ai/
    ├── /analyze-project (POST)
    ├── /generate-feedback (POST)
    └── /award-recommendations (POST)
```

---

## CRITICAL DEVELOPMENT GUIDELINES

### 1. Database Connection Management
- Use connection pooling (Mongoose native)
- Implement connection reuse in serverless context
- Create `/lib/db/connection.ts` for centralized management

### 2. Error Handling
- Implement comprehensive error logging
- Use Zod for input validation
- Return structured error responses (HTTP status + error code)

### 3. Authentication & Authorization
- Implement role-based access control (admin, judge, participant, organizer)
- Verify JWT tokens on protected routes
- Check permissions at both API and component level

### 4. Vector Search Optimization
- Batch embedding generation to reduce API costs
- Cache embeddings in MongoDB
- Implement rate limiting for embedding API calls

### 5. AI Cost Management
- Implement request batching where possible
- Use "text-embedding-3-small" for cost efficiency
- Consider caching AI-generated content
- Set up usage monitoring and alerts

### 6. UI/UX with MUI
- Build reusable component library (shared-ui folder)
- Maintain consistent spacing/typography system
- Implement responsive design (mobile-first)
- Use MUI's Grid system for layouts (no Tailwind)

### 7. Performance Considerations
- Implement pagination for large datasets
- Use MongoDB aggregation pipelines for complex queries
- Optimize Vector Search queries (limit results)
- Implement caching strategies for frequently accessed data

---

## DEPLOYMENT CONSIDERATIONS

**MongoDB Atlas**:
- Use M10+ cluster for Vector Search
- Enable backups
- Configure network access appropriately
- Use connection string with SSL

**Environment Variables**:
```
MONGODB_URI=
OPENAI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_APP_URL=
```

**Performance Monitoring**:
- Track API response times
- Monitor Vector Search latency
- Set up OpenAI usage alerts
- Implement application logging

---

## SUCCESS METRICS

By project completion, you should have:
- ✅ Full hackathon event lifecycle management
- ✅ Intelligent participant matching with 80%+ relevance
- ✅ Automated project analysis reducing judge prep time by 60%+
- ✅ RAG-powered award recommendations with historical context
- ✅ Comprehensive judging analytics and feedback system
- ✅ Real-time attendance tracking and reporting
- ✅ Sub-500ms average API response times
- ✅ Vector Search integration delivering semantic understanding
