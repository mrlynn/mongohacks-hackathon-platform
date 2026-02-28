# Hackathon Management Platform - Technical Specification
## Tech Stack: Next.js 16 | Material UI v7 | MongoDB Atlas | TypeScript | OpenAI | Voyage AI

---

## PROJECT OVERVIEW

**Purpose**: A comprehensive hackathon management platform that handles the full event lifecycle — from event creation and participant registration through team formation, project submission, AI-powered judging, and post-event analytics.

**Core Philosophy**: Leverage MongoDB Atlas Vector Search and multi-provider AI (OpenAI + Voyage AI) to automate administrative tasks, enable intelligent participant/team matching, power a RAG-based knowledge assistant, and provide AI-driven project evaluation and feedback synthesis.

---

## TECHNICAL ARCHITECTURE

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1.6 with App Router, React 19 |
| **UI Components** | Material UI (MUI) v7.3.8 |
| **Styling** | MUI theme system and `sx` prop (NO Tailwind) |
| **Charts** | Recharts v3.7.0 |
| **Maps** | Leaflet + react-leaflet v5 |
| **Backend** | Next.js API routes with Mongoose connection pooling |
| **Database** | MongoDB Atlas (Mongoose v9) |
| **Vector Search** | MongoDB Atlas Vector Search (5 indexes) |
| **AI/LLM** | OpenAI GPT-4o/GPT-4-turbo, text-embedding-3-small |
| **RAG Embeddings** | Voyage AI voyage-4-large (documents), voyage-4 (queries) |
| **Language** | TypeScript (strict mode) |
| **Authentication** | NextAuth.js v5 with MongoDB adapter |
| **Validation** | Zod v4 |
| **Email** | Nodemailer (SMTP) |
| **Testing** | Jest v30, Playwright v1.58, MongoDB Memory Server |
| **Markdown** | react-markdown v10 |

### Project Structure
```
hackathon-platform/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── (auth)/          # Login, register, 2FA, magic link
│   │   │   ├── admin/           # Admin dashboard, analytics, settings
│   │   │   ├── dashboard/       # User dashboard
│   │   │   ├── events/          # Event listing, detail, hub, registration
│   │   │   ├── gallery/         # Featured project showcase
│   │   │   ├── judging/         # Judge scoring interface
│   │   │   ├── notifications/   # User notifications
│   │   │   ├── profile/         # User profile
│   │   │   ├── project-suggestions/ # AI project idea wizard
│   │   │   ├── projects/        # Project gallery
│   │   │   ├── settings/        # User settings (password, 2FA, notifications)
│   │   │   └── teams/           # Team Atlas cluster dashboard
│   │   ├── api/                 # All API routes
│   │   ├── feedback/            # Public feedback form
│   │   └── [slug]/              # Dynamic event landing pages
│   ├── components/
│   │   ├── atlas/               # Atlas cluster provisioning UI
│   │   ├── landing-pages/       # Landing page templates & sections
│   │   └── shared-ui/           # Navbar, forms, notifications, etc.
│   ├── lib/
│   │   ├── ai/                  # AI services (embeddings, matching, feedback, suggestions)
│   │   ├── atlas/               # Atlas API client, provisioning, cleanup
│   │   ├── db/                  # Mongoose models, connection, Zod schemas
│   │   ├── email/               # Email service & templates
│   │   ├── feedback/            # Feedback distribution service
│   │   ├── notifications/       # Notification service
│   │   ├── rag/                 # RAG pipeline (chunking, embedding, retrieval, chat)
│   │   ├── types/               # Template types
│   │   ├── utils/               # CSV export, serialization
│   │   ├── vector-search/       # Vector search service
│   │   ├── admin-guard.ts       # Admin role guards
│   │   ├── auth.ts              # NextAuth config
│   │   └── utils.ts             # Response helpers, date formatting
│   ├── types/                   # TypeScript interfaces
│   └── styles/
│       └── theme.ts             # MUI theme config
├── docs/                        # Documentation (RAG ingestible)
├── scripts/                     # Seed scripts, RAG index creation
├── tests/                       # Jest unit tests
├── e2e/                         # Playwright E2E tests
└── package.json
```

---

## CORE FEATURES

### 1. EVENT MANAGEMENT

**Status**: Implemented

**Features**:
- Full CRUD for hackathon events with rich detail fields
- Event statuses: `draft` → `open` → `in_progress` → `concluded`
- Geographic location with coordinates (GeoJSON Point) for map visualization
- Interactive events map (Leaflet) with city/country filtering
- Custom landing pages per event with 7 built-in templates
- Configurable judging rubrics (criteria, weights, max scores)
- Atlas cluster provisioning settings per event
- Partner/sponsor associations
- Feedback form assignments (participant + partner forms)
- Results publishing with timestamp tracking

**Database Model**: `Event`
```typescript
{
  name, description, theme: string;
  startDate, endDate, registrationDeadline, submissionDeadline: Date;
  location, city, country, venue: string;
  coordinates: { type: "Point", coordinates: [lng, lat] };
  capacity: number;
  isVirtual: boolean;
  tags: string[];
  rules: string;
  judging_criteria: string[];
  judgingRubric: { name, description, weight, maxScore }[];
  organizers: ObjectId[];    // refs → User
  partners: ObjectId[];      // refs → Partner
  status: "draft" | "open" | "in_progress" | "concluded";
  resultsPublished: boolean;
  resultsPublishedAt: Date;
  feedbackForms: { participant: ObjectId, partner: ObjectId };
  atlasProvisioning: {
    enabled, openNetworkAccess, autoCleanupOnEventEnd: boolean;
    defaultProvider, defaultRegion: string;
    maxDbUsersPerCluster: number;
    allowedProviders, allowedRegions: string[];
  };
  landingPage: {
    template, slug: string;
    published: boolean;
    registrationFormConfig: ObjectId;
    customContent: { hero, about, prizes, schedule, sponsors, faq };
  };
  descriptionEmbedding: number[];
}
```

**Indexes**: status, startDate, tags, coordinates (2dsphere), country+city, landingPage.published

---

### 2. USER MANAGEMENT & AUTHENTICATION

**Status**: Implemented

**Features**:
- NextAuth.js v5 with credentials + magic link providers
- Two-factor authentication (TOTP codes, 10-min expiry)
- Role-based access control: `super_admin`, `admin`, `organizer`, `judge`, `participant`
- Admin impersonation (via httpOnly cookie, preserves admin auth)
- Edge-compatible JWT middleware for route protection
- User profile management (bio, skills, notification preferences)
- Password change, notification settings, 2FA setup
- **Email verification** (token-based, 24-hour expiry)
  - Verification email with branded template
  - Resend functionality
  - Action gates on project submission, team creation, Atlas provisioning
- **User moderation** (ban/delete for admins)
  - Ban/unban users with reason tracking
  - Soft delete (preserves audit trail)
  - Cannot ban/delete super_admins
  - Hierarchical control: only super_admins can moderate admins

**Database Model**: `User`
```typescript
{
  email: string;              // unique, lowercase
  name: string;
  passwordHash: string;
  needsPasswordSetup: boolean;
  magicLinkToken, magicLinkExpiry: string | Date;
  twoFactorEnabled: boolean;
  twoFactorCode, twoFactorExpiry: string | Date;
  notificationPreferences: {
    emailNotifications, eventReminders, teamInvites,
    projectUpdates, newsletter: boolean;
  };
  role: "super_admin" | "admin" | "organizer" | "judge" | "participant";
  // Email verification
  emailVerified?: boolean;
  emailVerificationToken?: string;    // select: false
  emailVerificationExpiry?: Date;
  // GitHub OAuth
  githubUsername?: string;
  bio?: string;
  company?: string;
  location?: string;
  // User moderation
  banned?: boolean;
  bannedAt?: Date;
  bannedReason?: string;
  deletedAt?: Date;
}
```

---

### 3. REGISTRATION & PARTICIPANTS

**Status**: Implemented

**Features**:
- Dynamic, configurable registration forms per event
- Multi-tier registration form builder (tier 1/2/3 with progressive disclosure)
- Custom question support (text, select, multi-select, checkbox, number)
- Quick registration option (minimal fields)
- **Enhanced registration UX**:
  - 3-step progressive disclosure wizard (Material UI Stepper)
  - Step 1: Account creation (email, password, OAuth)
  - Step 2: Profile information (name, bio, skills, GitHub)
  - Step 3: Event-specific custom questions
  - Session storage persistence across steps
  - Password strength meter (0-100 score, visual indicator)
  - Debounced email validation (300ms)
  - GitHub OAuth with auto-populate (name, email, bio, company, location)
  - Registration confirmation emails with calendar ICS attachment
- Waitlist support when events reach capacity
- Participant profiles with skills, interests, experience level
- Skills embedding generation for vector-based matching
- Custom response storage per registration

**Database Models**: `Participant`, `RegistrationFormConfig`
```typescript
// Participant
{
  userId: ObjectId;
  email, name, bio: string;
  skills, interests: string[];
  experience_level: "beginner" | "intermediate" | "advanced";
  skillsEmbedding: number[];
  pastProjects: string[];
  invitedToEvents: ObjectId[];
  registeredEvents: { eventId, registrationDate, status }[];
  customResponses: Map<string, unknown>;
  teamId: ObjectId | null;
}

// RegistrationFormConfig
{
  name, slug, description: string;
  isBuiltIn: boolean;
  tier1: { showExperienceLevel, customQuestions };
  tier2: { enabled, prompt, showSkills, showGithub, showBio, customQuestions };
  tier3: { enabled, prompt, customQuestions };
}
```

---

### 4. TEAMS & COLLABORATION

**Status**: Implemented

**Features**:
- Team creation per event with configurable max members
- Team leader management with leadership transfer
- Join/leave teams, remove members
- "Looking for members" toggle with desired skills listing
- Team notes (threaded discussion with replies)
- Communication platform links (Discord, Slack, custom)
- Skills embedding for team-level vector matching
- Team browsing and discovery within events

**Database Models**: `Team`, `TeamNote`
```typescript
// Team
{
  name: string;
  eventId: ObjectId;
  members: ObjectId[];       // refs → User
  leaderId: ObjectId;        // ref → User
  description: string;
  lookingForMembers: boolean;
  desiredSkills: string[];
  desiredSkillsEmbedding: number[];
  maxMembers: number;
  status: "forming" | "active" | "inactive";
  communicationPlatform: "discord" | "slack" | "other";
  discordChannelUrl, slackChannelUrl, otherCommunicationUrl: string;
}

// TeamNote
{
  teamId, authorId: ObjectId;
  content: string;           // max 2000 chars
  parentNoteId: ObjectId;    // for threaded replies
  editedAt: Date;
}
```

---

### 5. PROJECTS & SUBMISSIONS

**Status**: Implemented

**Features**:
- Project creation and submission per team per event (unique constraint)
- Rich project details: repo, demo, video, documentation URLs
- Project thumbnails and featured flag for gallery showcase
- Status tracking: `draft` → `submitted` → `under_review` → `judged`
- AI-generated project summaries (GPT-4-turbo, triggered on submission)
- AI-generated feedback synthesis from judge scores
- Vector embeddings for semantic project search
- Featured project gallery with filtering

**Database Model**: `Project`
```typescript
{
  eventId, teamId: ObjectId;
  name, description, category: string;
  technologies: string[];
  repoUrl, demoUrl, videoUrl, documentationUrl, thumbnailUrl: string;
  featured: boolean;
  aiSummary, aiFeedback: string;
  descriptionEmbedding: number[];
  status: "draft" | "submitted" | "under_review" | "judged";
  innovations: string;
  teamMembers: ObjectId[];
  submissionDate, submittedAt, lastModified: Date;
}
```

**Indexes**: eventId+status, teamId+eventId (unique), featured+status

---

### 6. JUDGING SYSTEM

**Status**: Implemented

**Features**:
- Per-project judge assignment by admin
- Customizable rubric criteria with weights (defined per event)
- Slider-based scoring interface (0-10 per criterion)
- Weighted total score auto-calculation
- Judge comments per project
- Unique constraint: one score per judge per project
- Judge dashboard showing assigned projects and completion status
- Results aggregation and publication workflow
- AI feedback synthesis combining multiple judge scores into constructive prose

**Database Models**: `JudgeAssignment`, `Score`
```typescript
// JudgeAssignment
{
  eventId, judgeId, projectId: ObjectId;
  status: "pending" | "in_progress" | "completed";
  assignedAt: Date;
  assignedBy: ObjectId;
  completedAt: Date;
}

// Score
{
  projectId, eventId, judgeId: ObjectId;
  scores: Record<string, number>;  // criteria name → score
  totalScore: number;              // auto-calculated
  comments: string;
  submittedAt: Date;
}
```

**Indexes**: projectId+judgeId (unique), eventId, judgeId

---

### 7. PARTNERS & SPONSORS

**Status**: Implemented

**Features**:
- Full partner/sponsor CRM with company profiles
- Tier system: `platinum`, `gold`, `silver`, `bronze`, `community`
- Contact management (multiple contacts per partner, primary designation)
- Company info: size, headquarters, founded year, employee count
- Social links: LinkedIn, Twitter, GitHub, YouTube
- Engagement tracking: events participated, prizes offered, contribution totals
- Engagement level scoring (low, medium, high)
- Status management: `active`, `inactive`, `pending`
- Industry classification and custom tags
- Partner association with events and prizes

**Database Model**: `Partner`
```typescript
{
  name: string;              // unique
  description, logo, website: string;
  industry: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "community";
  status: "active" | "inactive" | "pending";
  companyInfo: { size, headquarters, foundedYear, employeeCount };
  contacts: { name, email, phone, role, isPrimary }[];
  engagement: {
    eventsParticipated: ObjectId[];
    prizesOffered: ObjectId[];
    totalContribution: number;
    engagementLevel: "low" | "medium" | "high";
    lastEngagementDate: Date;
  };
  social: { linkedin, twitter, github, youtube };
  tags: string[];
  notes: string;
}
```

**Indexes**: tier+status, industry, status, engagement.engagementLevel, contacts.email, tags

---

### 8. PRIZES & AWARDS

**Status**: Implemented

**Features**:
- Prize management per event with categories: `grand`, `track`, `sponsor`, `special`, `community`
- Optional partner/sponsor association per prize
- Monetary and display value tracking
- Eligibility criteria and judging criteria tags
- Winner assignment (project + team linkage)
- Display ordering and active/inactive toggle
- Prize image support

**Database Model**: `Prize`
```typescript
{
  eventId: ObjectId;
  partnerId: ObjectId;       // optional, ref → Partner
  title, description: string;
  category: "grand" | "track" | "sponsor" | "special" | "community";
  value: string;             // display value (e.g., "$5,000")
  monetaryValue: number;     // for sorting/analytics
  eligibility: string;
  criteria: string[];
  winners: { projectId, teamId, awardedDate, notes }[];
  displayOrder: number;
  isActive: boolean;
  imageUrl: string;
}
```

---

### 9. AI-POWERED PROJECT SUGGESTIONS

**Status**: Implemented

**Features**:
- 4-step wizard for generating project ideas:
  1. Event & team selection (size, skill levels, composition)
  2. Tech preferences (languages, frameworks, databases)
  3. Sponsor product integration (relevant sponsor technologies)
  4. Constraints & goals (time commitment, complexity, target prizes)
- GPT-4o generates 3 detailed project ideas per request (JSON mode)
- Each idea includes: name, tagline, problem statement, solution, full tech stack, phased timeline, difficulty rating, prize categories, differentiator, implementation guide
- Save, share, vote, and refine ideas
- Team collaboration on saved ideas
- **Builder Prompt Generation**:
  - Generate copy-paste ready prompts for coding assistants (Claude, ChatGPT, Copilot)
  - Template-based generation (no AI calls for base prompt)
  - 3 workflow variants: full-scaffold, backend-first, frontend-first
  - Optional GPT-4o enhancement (~$0.01-0.02): adds architecture patterns, quick wins, pitfalls
  - Copy to clipboard + download as .md file
  - Markdown preview with syntax highlighting
  - Analytics tracking (generation/copy/download counts)

**Database Model**: `ProjectIdea`
```typescript
{
  userId, eventId: ObjectId;
  inputs: {
    teamSize, skillLevels, teamComposition, preferredLanguages,
    preferredFrameworks, preferredDatabases, sponsorProducts,
    interestAreas, timeCommitment, complexityPreference, targetPrizes
  };
  idea: {
    name, tagline, problemStatement, solution: string;
    techStack: { frontend, backend, database, apis, deployment };
    timeline: { phase, hours, tasks }[];
    difficulty: number;
    prizeCategories, differentiator, implementationGuide: string;
  };
  saved, shared: boolean;
  teamVotes: { userId, vote, comment, createdAt }[];
  model: string;
  tokensUsed: number;
  builderPrompts?: {
    fullScaffold?: { generatedAt, enhanced, downloadCount, copyCount };
    backendFirst?: { generatedAt, enhanced, downloadCount, copyCount };
    frontendFirst?: { generatedAt, enhanced, downloadCount, copyCount };
  };
}
```

---

### 10. RAG KNOWLEDGE ASSISTANT

**Status**: Implemented

**Features**:
- Embeddable chat widget available across the platform
- Document ingestion pipeline: scan docs/ → parse markdown → chunk → embed → store
- Voyage AI embeddings (voyage-4-large for docs, voyage-4 for queries)
- MongoDB Atlas Vector Search for semantic retrieval
- Category-based relevance boosting (admin guides > getting started > features)
- Access control filtering (public vs authenticated content)
- GPT-4o streaming responses with source citations
- Session-based conversation persistence (last 10 messages context)
- Rate limiting (20 messages/minute per session)
- Admin interface: ingestion runs, document management, status monitoring
- User feedback (thumbs up/down) on responses

**Database Models**: `RagDocument`, `RagIngestionRun`, `RagConversation`
```typescript
// RagDocument
{
  content, contentHash: string;
  accessLevel: "public" | "authenticated";
  source: { filePath, title, section, category, url, type };
  chunk: { index, totalChunks, tokens };
  embedding: number[];
  ingestion: { runId, ingestedAt, ingestedBy, version };
}

// RagIngestionRun
{
  runId: string;
  status: "running" | "completed" | "failed" | "cancelled";
  stats: { filesProcessed, filesSkipped, chunksCreated,
           chunksDeleted, embeddingsGenerated, totalTokens, errors };
  startedAt, completedAt: Date;
  durationMs: number;
  triggeredBy: ObjectId;
}

// RagConversation
{
  sessionId: string;
  userId: ObjectId;
  messages: { role, content, sources[], feedback, createdAt }[];
  metadata: { page, userAgent };
}
```

---

### 11. MONGODB ATLAS CLUSTER PROVISIONING

**Status**: Implemented

**Features**:
- One-click M0 (free tier) cluster provisioning per team
- Atlas Admin API v2 integration with Digest Authentication
- Provider selection: AWS, GCP, Azure
- Region configuration with admin-controlled allowed lists
- Automated project creation (`mh-{eventId}-{teamId}` naming)
- Database user management with secure password generation
- IP access list management (open access option for hackathons)
- Connection string delivery (SRV + standard formats)
- Status polling and lifecycle tracking
- Automatic rollback on provisioning failure
- Auto-cleanup when events conclude (configurable per event)
- Team-facing dashboard: status, connection details, user management

**Database Model**: `AtlasCluster`
```typescript
{
  eventId, teamId, projectId, provisionedBy: ObjectId;
  atlasProjectId, atlasProjectName, atlasClusterName, atlasClusterId: string;
  connectionString, standardConnectionString: string;
  databaseUsers: { username, createdAt, createdBy }[];
  ipAccessList: { cidrBlock, comment, addedAt, addedBy }[];
  status: "creating" | "idle" | "active" | "deleting" | "deleted" | "error";
  providerName: "AWS" | "GCP" | "AZURE";
  regionName, mongoDBVersion: string;
  errorMessage: string;
  lastStatusCheck, deletedAt: Date;
}
```

---

### 12. ANALYTICS & REPORTING

**Status**: Implemented

**Features**:
- Admin analytics dashboard with multiple chart types (bar, pie, radar, line, area)
- User statistics: totals, role distribution
- Event statistics: active counts, status breakdown
- Project and team formation metrics
- Judge participation tracking
- Partner engagement analytics (tier distribution, contribution tracking)
- Prize distribution visualization
- AI usage tracking across all operations
- AI-generated insights (GPT-4o analysis of platform data)
- Feedback analytics with response rates
- CSV data export

**Database Model**: `AiUsageLog`
```typescript
{
  category: "project_suggestions" | "judge_feedback" | "project_summaries"
          | "skill_embeddings" | "rag_chat" | "rag_embeddings";
  provider: "openai" | "voyage";
  model, operation: string;
  tokensUsed, promptTokens, completionTokens: number;
  estimatedCost: number;
  durationMs: number;
  userId, eventId: ObjectId;
  metadata: Record<string, unknown>;
  error: boolean;
}
```

---

### 13. FEEDBACK & SURVEYS

**Status**: Implemented

**Features**:
- Configurable feedback form builder with sections
- Question types: text, textarea, select, multi-select, scale, rating, checkbox
- Scale questions with configurable min/max and labels
- Target audiences: participant, partner, or both
- Per-event feedback form assignment (separate participant + partner forms)
- Public feedback form URLs (shareable, no login required)
- Batch feedback request distribution (email + in-app notifications)
- Response collection with completion time tracking
- Unique constraint: one response per respondent per form per event
- Feedback analytics aggregation
- AI-generated feedback summaries for projects (combine judge scores)

**Database Models**: `FeedbackFormConfig`, `FeedbackResponse`
```typescript
// FeedbackFormConfig
{
  name, slug, description: string;
  isBuiltIn: boolean;
  targetAudience: "participant" | "partner" | "both";
  sections: {
    id, title, description: string;
    questions: {
      id, type, label, description: string;
      required: boolean;
      placeholder: string;
      options: string[];
      scaleConfig: { min, max, minLabel, maxLabel };
    }[];
  }[];
}

// FeedbackResponse
{
  formId, eventId: ObjectId;
  respondentEmail, respondentName: string;
  respondentType: "participant" | "partner";
  userId: ObjectId;
  answers: Map<string, unknown>;
  startedAt, submittedAt: Date;
  completionTimeMinutes: number;
}
```

---

### 14. NOTIFICATIONS

**Status**: Implemented

**Features**:
- Real-time in-app notifications via Server-Sent Events (SSE)
- Notification bell with unread count in navbar
- Dual-channel delivery: in-app + email (respects user preferences)
- 13 notification types covering the full event lifecycle
- Mark as read / mark all as read
- Auto-expiry: 90-day TTL index
- Fire-and-forget pattern (never blocks operations)

**Notification Types**: registration_confirmed, event_reminder, team_member_joined, team_member_left, team_invite, project_submitted, registration_closed, results_published, judging_started, judge_assigned, score_received, feedback_requested, general

**Database Model**: `Notification`
```typescript
{
  userId: ObjectId;
  type: string;              // one of 13 notification types
  title, message: string;
  read: boolean;
  relatedEvent, relatedTeam, relatedProject: ObjectId;
  actionUrl: string;
}
```

**Indexes**: userId+read+createdAt(desc), userId+createdAt(desc), createdAt (90-day TTL)

---

### 15. LANDING PAGES & TEMPLATES

**Status**: Implemented

**Features**:
- 7 built-in landing page templates (Modern, Tech, Bold, Community, Leafy, Atlas, Dynamic)
- Per-event URL slugs (e.g., `/mongodb-hackathon-2024`)
- Template customization: colors, typography, card styles, hero styles
- Configurable sections: Hero, About, Prizes, Schedule, Sponsors, FAQ
- Event-specific content overrides per section
- Publish/unpublish toggle
- Registration form integration on landing pages
- Background image selection (7 pre-built options)
- CDN cache headers (60s cache, 5min stale-while-revalidate)

**Database Model**: `TemplateConfig`
```typescript
{
  name, slug, description, baseTemplate: string;
  isBuiltIn, isDefault: boolean;
  colors: { primary, secondary, background, surface, text, heroBg, ... };
  typography: { headingFont, bodyFont, headingWeight, scale };
  sections: { type, enabled, layout, style }[];
  cards: { borderRadius, style, accentPosition };
  hero: { style, gradientDirection, overlayOpacity, buttonStyle };
}
```

---

### 16. EMAIL SYSTEM

**Status**: Implemented

**Features**:
- Nodemailer SMTP integration with graceful degradation (works without SMTP configured)
- Responsive HTML email templates with MongoDB branding (#00684A)
- Both HTML and plain text versions for all templates
- Fire-and-forget delivery pattern
- Templates: magic link, 2FA code, feedback request, generic notification, **email verification**, **registration confirmation**
- Batch feedback distribution to participants and partners
- **New templates**:
  - `emailVerificationEmail(name, verificationUrl)` - Branded template with CTA, 24-hour expiration notice
  - `registrationConfirmationEmail(name, eventName, date, location, dashboardUrl)` - Event details, calendar ICS generator, Google/Outlook links
- **Email sending pattern**: Fire-and-forget (doesn't block API responses), registration sends 2 emails (confirmation + verification)

---

## VECTOR SEARCH INDEXES

Five MongoDB Atlas Vector Search indexes power the platform's semantic capabilities:

| Index Name | Collection | Field | Dimensions | Use Case |
|-----------|-----------|-------|-----------|----------|
| `participant_skills_vector` | participants | skillsEmbedding | 1536 | Teammate matching |
| `team_skills_vector` | teams | desiredSkillsEmbedding | 1536 | Team discovery |
| `event_description_vector` | events | descriptionEmbedding | 1536 | Similar event search |
| `project_description_vector` | projects | descriptionEmbedding | 1536 | Similar project search |
| `rag_document_vector` | ragdocuments | embedding | 1024 | RAG knowledge retrieval |

All use cosine similarity.

---

## AI SERVICES ARCHITECTURE

### Embedding Service (`lib/ai/embedding-service.ts`)
- OpenAI `text-embedding-3-small` for skills/descriptions (1536 dims)
- Single and batch embedding generation
- Usage logging with cost tracking

### RAG Pipeline (`lib/rag/`)
- **Chunking** (`chunker.ts`): Markdown-aware splitting, ~512 tokens/chunk, 64-token overlap
- **Embeddings** (`embeddings.ts`): Voyage AI voyage-4-large (docs) / voyage-4 (queries)
- **Retrieval** (`retrieval.ts`): Vector search with category-based relevance boosting
- **Chat** (`chat.ts`): GPT-4o streaming with RAG context injection
- **Session** (`session.ts`): Conversation persistence and history
- **Rate Limiting** (`rate-limit.ts`): 20 msgs/min sliding window

### Matching Engine (`lib/ai/matching-engine.ts`)
- Vector search on `participant_skills_vector` and `team_skills_vector`
- Fallback to tag-overlap scoring when embeddings unavailable
- Returns match scores (0-100) with reasons

### Project Summary Service (`lib/ai/summary-service.ts`)
- GPT-4-turbo generates 2-3 sentence judge-friendly summaries
- Triggered async on project submission

### Judge Feedback Synthesis (`lib/ai/feedback-service.ts`)
- GPT-4-turbo combines multiple judge scores into constructive prose
- Averages across criteria, synthesizes written comments
- 2-3 paragraph output with strengths and actionable improvements

### Project Idea Generation (`lib/ai/project-suggestion.ts`)
- GPT-4o with JSON mode generates 3 ideas per request
- Context-aware: event theme, team composition, tech preferences, sponsor products

### AI Cost Tracking (`lib/ai/usage-logger.ts`)
- Fire-and-forget logging for all AI operations
- Per-model cost estimation (gpt-4o: $7.50/1M, embedding-3-small: $0.02/1M, voyage-4-large: $0.12/1M)
- Categories: skill_embeddings, rag_embeddings, rag_chat, project_suggestions, project_summaries, judge_feedback

---

## API ROUTES

### Public Routes
```
GET  /api/events                              # List events (filterable by status)
GET  /api/events/map                          # Events with location data for map
GET  /api/events/[eventId]                    # Event details
GET  /api/events/[eventId]/results            # Event results/leaderboard
GET  /api/gallery                             # Featured projects
GET  /api/landing-pages/[slug]                # Dynamic landing page content
GET  /api/og                                  # Open Graph metadata
GET  /api/feedback/[formId]                   # Public feedback form
POST /api/feedback/[formId]                   # Submit feedback response
```

### Authentication Routes
```
POST /api/auth/register                       # Register new account
POST /api/auth/magic-link                     # Request magic link
POST /api/auth/magic-link/verify              # Verify magic link
POST /api/auth/2fa/status                     # Check 2FA status
POST /api/auth/2fa/verify                     # Verify 2FA code
POST /api/auth/signout                        # Sign out
GET  /api/auth/session                        # Current session
```

### User Routes (Authenticated)
```
GET/PATCH  /api/profile                       # User profile
GET        /api/user/dashboard                # Dashboard data
POST       /api/settings/password             # Change password
POST       /api/settings/2fa                  # Toggle 2FA
POST       /api/settings/notifications        # Update preferences
GET        /api/notifications                 # List notifications
GET        /api/notifications/stream          # SSE real-time stream
POST       /api/notifications/[id]/read       # Mark read
POST       /api/notifications/read-all        # Mark all read
POST       /api/chat                          # RAG chat endpoint
```

### Event Routes (Authenticated)
```
POST /api/events                              # Create event
POST /api/events/[eventId]/register           # Register for event
POST /api/events/[eventId]/quick-register     # Quick registration
POST /api/events/[eventId]/waitlist           # Join waitlist
GET  /api/events/[eventId]/hub                # Event hub data
GET  /api/events/[eventId]/enhance-profile    # AI profile enhancement
```

### Project Routes
```
GET  /api/events/[eventId]/projects           # List projects for event
POST /api/events/[eventId]/projects           # Create project
GET  /api/events/[eventId]/projects/[id]      # Project details
PATCH /api/events/[eventId]/projects/[id]     # Update project
GET  /api/events/[eventId]/projects/[id]/feedback  # Project feedback
```

### Team Routes
```
GET  /api/events/[eventId]/teams              # List teams
POST /api/events/[eventId]/teams              # Create team
GET  /api/events/[eventId]/teams/[id]         # Team details
POST /api/events/[eventId]/teams/[id]/join    # Join team
POST /api/events/[eventId]/teams/[id]/leave   # Leave team
POST /api/events/[eventId]/teams/[id]/remove-member     # Remove member
POST /api/events/[eventId]/teams/[id]/transfer-leader   # Transfer leadership
GET/POST     /api/events/[eventId]/teams/[id]/notes         # Team notes
PATCH/DELETE /api/events/[eventId]/teams/[id]/notes/[noteId] # Edit/delete note
```

### Judging Routes
```
GET  /api/judging/[eventId]/projects          # Projects to judge
POST /api/judging/[eventId]/score             # Submit score
```

### Project Suggestions Routes
```
GET  /api/project-suggestions/events          # Available events
POST /api/project-suggestions/generate        # Generate AI ideas
GET  /api/project-suggestions/saved           # Saved ideas
POST /api/project-suggestions/[id]/save       # Save idea
POST /api/project-suggestions/[id]/vote       # Vote on idea
POST /api/project-suggestions/[id]/refine     # Refine idea
POST /api/project-suggestions/[id]/share      # Share idea
```

### Partner & Prize Routes
```
GET/POST       /api/partners                  # List/create partners
GET/PATCH/DELETE /api/partners/[id]           # Partner CRUD
GET/POST       /api/prizes                    # List/create prizes
GET/PATCH/DELETE /api/prizes/[id]             # Prize CRUD
```

### Admin Routes (Admin/Super Admin only)
```
# Events
GET/POST       /api/admin/events
GET/PATCH/DELETE /api/admin/events/[eventId]
GET/POST       /api/admin/events/[eventId]/registrations
GET/PATCH      /api/admin/events/[eventId]/results
POST           /api/admin/events/[eventId]/publish-results
GET/PATCH      /api/admin/events/[eventId]/feedback-forms
GET            /api/admin/events/[eventId]/feedback-responses
POST           /api/admin/events/[eventId]/send-feedback
GET/POST       /api/admin/events/[eventId]/assignments
POST           /api/admin/events/[eventId]/landing-page
POST           /api/admin/events/[eventId]/atlas-provisioning
POST           /api/admin/events/[eventId]/generate-all-feedback

# Users
GET/POST       /api/admin/users
GET/PATCH/DELETE /api/admin/users/[userId]
PATCH          /api/admin/users/[userId]/role
POST           /api/admin/impersonate

# Teams & Projects
GET/PATCH      /api/admin/teams
GET            /api/admin/projects
PATCH          /api/admin/projects/[projectId]/featured

# Templates & Forms
GET/POST       /api/admin/templates
GET/PATCH      /api/admin/templates/[id]
POST           /api/admin/templates/[id]/clone
GET/POST       /api/admin/registration-forms
GET/PATCH      /api/admin/registration-forms/[id]
POST           /api/admin/registration-forms/[id]/clone
GET/POST       /api/admin/feedback-forms
GET/PATCH      /api/admin/feedback-forms/[id]
POST           /api/admin/feedback-forms/[id]/clone

# Analytics
GET            /api/admin/analytics
GET            /api/admin/analytics/feedback
POST           /api/admin/analytics/ai

# RAG Management
GET            /api/admin/rag/status
POST           /api/admin/rag/ingest
GET            /api/admin/rag/documents
POST           /api/admin/rag/files
GET            /api/admin/rag/runs
GET            /api/admin/rag/runs/[runId]
POST           /api/admin/rag/cancel

# Atlas Management
GET/POST       /api/admin/atlas/clusters
GET/PATCH/DELETE /api/admin/atlas/clusters/[clusterId]
POST           /api/admin/atlas/cleanup

# Site Settings
GET/PATCH      /api/admin/site-settings

# CRM Integrations
GET/POST       /api/admin/crm/integrations
GET/PATCH/DELETE /api/admin/crm/integrations/[integrationId]
POST           /api/admin/crm/integrations/[integrationId]/sync
POST           /api/admin/crm/integrations/[integrationId]/test
POST           /api/admin/crm/integrations/[integrationId]/refresh-token
POST           /api/admin/crm/integrations/[provider]/auth
GET            /api/admin/crm/contacts
GET/DELETE     /api/admin/crm/contacts/[contactId]
POST           /api/admin/crm/contacts/[contactId]/verify
GET            /api/admin/crm/contacts/bulk/export
POST           /api/admin/crm/contacts/bulk/resync
GET            /api/admin/crm/sync-logs
GET            /api/admin/crm/sync-logs/[logId]
GET            /api/admin/crm/stats
```

---

## ENVIRONMENT VARIABLES

```env
# Database
MONGODB_URI=                    # MongoDB Atlas connection string

# Authentication
NEXTAUTH_SECRET=                # JWT signing key
NEXTAUTH_URL=                   # Auth callback URL
NEXT_PUBLIC_APP_URL=            # Public app URL

# AI Providers
OPENAI_API_KEY=                 # OpenAI (GPT-4o, embeddings)
VOYAGE_API_KEY=                 # Voyage AI (RAG embeddings)

# MongoDB Atlas Admin API
ATLAS_PUBLIC_KEY=               # Atlas API public key
ATLAS_PRIVATE_KEY=              # Atlas API private key
ATLAS_ORG_ID=                   # Atlas organization ID
ATLAS_BASE_URL=                 # Atlas API base URL (optional)

# Email (SMTP)
SMTP_HOST=                      # SMTP server
SMTP_PORT=                      # SMTP port
SMTP_USER=                      # SMTP username
SMTP_PASS=                      # SMTP password
EMAIL_FROM=                     # Sender address

# RAG
RAG_DOCS_PATH=                  # Custom docs directory (optional)

# CRM - Salesforce
SALESFORCE_CLIENT_ID=           # Salesforce Connected App client ID
SALESFORCE_CLIENT_SECRET=       # Salesforce Connected App client secret
SALESFORCE_REDIRECT_URI=        # OAuth callback URL
```

---

## DATABASE MODELS SUMMARY (25 Models)

| Model | Collection | Purpose |
|-------|-----------|---------|
| User | users | Authentication, roles, preferences |
| Event | events | Hackathon events with full lifecycle |
| Participant | participants | Event registrations with skills |
| Team | teams | Team formation and collaboration |
| TeamNote | teamnotes | Threaded team discussions |
| Project | projects | Project submissions |
| ProjectIdea | projectideas | AI-generated project suggestions |
| Score | scores | Judge scoring records |
| JudgeAssignment | judgeassignments | Judge-to-project assignments |
| Partner | partners | Sponsor/partner CRM |
| Prize | prizes | Event prizes and awards |
| FeedbackFormConfig | feedbackformconfigs | Feedback form definitions |
| FeedbackResponse | feedbackresponses | Collected feedback |
| RegistrationFormConfig | registrationformconfigs | Registration form definitions |
| TemplateConfig | templateconfigs | Landing page template configs |
| Notification | notifications | In-app notifications (90-day TTL) |
| AtlasCluster | atlasclusters | Provisioned Atlas clusters |
| RagDocument | ragdocuments | RAG knowledge base chunks |
| RagIngestionRun | ragingestionruns | RAG ingestion tracking |
| RagConversation | ragconversations | RAG chat history |
| AiUsageLog | aiusagelogs | AI cost and usage tracking |
| CRMIntegration | crmintegrations | CRM provider connections & OAuth tokens |
| CRMContactMapping | crmcontactmappings | Participant ↔ CRM contact associations |
| CRMSyncLog | crmsynclogs | CRM sync job history & metrics |
| SiteSettings | sitesettings | Global platform settings |

---

## NPM SCRIPTS

```bash
npm run dev                     # Development server
npm run build                   # Production build
npm run start                   # Production server
npm run lint                    # ESLint
npm run test                    # Jest unit tests
npm run test:watch              # Watch mode
npm run test:coverage           # Coverage report
npm run test:e2e                # Playwright E2E tests
npm run test:e2e:ui             # E2E with UI
npm run test:all                # All tests
npm run seed                    # Seed database
npm run seed:clear              # Clear seed data
npm run seed:feedback-forms     # Seed feedback forms
npm run seed:gallery            # Seed featured projects
npm run seed:enhanced           # Enhanced seeding
npm run rag:create-index        # Create RAG vector index
npm run rag:ingest              # Run RAG document ingestion
```

---

## ARCHITECTURAL PATTERNS

1. **Serverless Connection Pooling**: Global Mongoose singleton for Next.js serverless functions
2. **Fire-and-Forget**: Notifications, AI usage logging, and cleanup operations never block
3. **Edge Middleware**: JWT verification at the edge for route protection
4. **Dual-Layer Auth**: Middleware guards + route handler checks with admin-guard utilities
5. **Vector Search Fallback**: Tag-overlap scoring when embeddings are unavailable
6. **Graceful Degradation**: Email, AI features work without configuration (log warnings)
7. **Idempotent Provisioning**: Atlas cluster creation checks for existing resources
8. **Automatic Rollback**: Atlas project deletion on cluster creation failure
9. **TTL Indexes**: Auto-cleanup of expired notifications (90 days)
10. **Impersonation Safety**: Admin authorization preserved during user impersonation

---

### 17. CRM INTEGRATIONS

**Status**: Planned (Phase 1: Salesforce)

**Features**:
- Multi-CRM provider architecture (Salesforce first, HubSpot/Slack stubs)
- OAuth-based Salesforce Connected App integration
- Automated participant-to-CRM contact matching (email, domain, name)
- Match confidence scoring (0-100) with configurable thresholds
- Account type classification: sponsor, partner, customer, prospect, other
- Configurable sync frequency: manual, 6-hour, 12-hour, daily
- Contact enrichment from CRM (title, phone, industry, company size)
- Sync job orchestration with exponential backoff and concurrency control
- Detailed sync logs with error tracking and performance metrics
- Bulk export (CSV/JSON) and bulk resync of mapped contacts
- Email notifications for sync failures and anomalies
- Admin dashboard: integration status, sync activity, matched contacts table
- Individual contact mapping detail with audit trail
- Provider-specific configuration panels

**Database Models**: `CRMIntegration`, `CRMContactMapping`, `CRMSyncLog`
```typescript
// CRMIntegration
{
  userId: ObjectId;                // Admin who connected
  provider: "salesforce" | "hubspot" | "slack";
  status: "active" | "error" | "disconnected";
  accessToken, refreshToken: string;  // Encrypted
  instanceUrl: string;             // Salesforce only
  expiresAt: Date;
  syncEnabled: boolean;
  syncFrequency: "manual" | "6hours" | "12hours" | "daily";
  autoMatchThreshold: number;      // 0-100, default 90
  providerConfig: {
    syncObjects?: ("Lead" | "Contact" | "Account")[];
    customFieldMappings?: Record<string, string>;
  };
  notificationEmails: string[];
  notifyOnSuccess, notifyOnFailure: boolean;
  connectedAt, lastSyncAt: Date;
  lastSyncStatus: "success" | "partial" | "failed";
  errorMessage: string;
}

// CRMContactMapping
{
  participantId: ObjectId;         // ref → Participant (unique)
  integrationId: ObjectId;         // ref → CRMIntegration
  crmProvider: "salesforce" | "hubspot" | "slack";
  crmContactId, crmContactName: string;
  crmAccountId, crmAccountName: string;
  accountType: "sponsor" | "partner" | "customer" | "prospect" | "other";
  matchScore: number;              // 0-100
  matchMethod: "email" | "domain" | "manual" | "name_email";
  matchedFields: string[];
  mappedAt: Date;
  mappedBy: ObjectId;              // User who mapped (if manual)
  lastVerifiedAt, lastSyncedAt: Date;
  status: "active" | "unverified" | "stale" | "invalid";
  enrichmentData: { title, phone, industry, companySize, lastActivityDate };
}

// CRMSyncLog
{
  integrationId: ObjectId;
  syncType: "manual" | "scheduled" | "incremental";
  startedAt, completedAt: Date;
  status: "running" | "success" | "partial" | "failed";
  totalRecordsProcessed, recordsMatched, recordsUnmatched: number;
  newMappings, updatedMappings, errorCount: number;
  errors: { participantId, crmContactId, errorMessage, timestamp }[];
  durationMs, apiCallsUsed: number;
  syncSince: Date;                 // For incremental syncs
}
```

**Indexes**: userId+provider (unique), participantId (unique), integrationId, matchScore, accountType, integrationId+startedAt

---

## DEVELOPMENT GUIDELINES

### Database
- Use Mongoose connection pooling with global cache for serverless
- All models defined in `src/lib/db/models/` with proper indexes
- Use Zod schemas (`src/lib/db/schemas.ts`) for API input validation
- Embeddings stored but excluded from default queries (select: false)

### Authentication & Authorization
- 5 roles: super_admin > admin > organizer > judge > participant
- Edge middleware protects admin and judging routes
- `requireAdmin()` and `requireSuperAdmin()` guards for API routes
- Impersonation via httpOnly cookie preserving original admin session

### AI Cost Management
- All AI calls logged to `AiUsageLog` with cost estimation
- OpenAI `text-embedding-3-small` for cost-effective embeddings
- Voyage AI for higher-quality RAG embeddings
- Fire-and-forget logging pattern (never blocks operations)
- Rate limiting on RAG chat (20 msgs/min)

### UI/UX
- Material UI v7 exclusively (no Tailwind)
- MUI theme with MongoDB-aligned branding
- Responsive design with MUI Grid system
- Recharts for data visualization
- Leaflet for geographic map features
- react-markdown for rendering markdown content

### Testing
- Jest for unit tests with MongoDB Memory Server
- Playwright for E2E browser testing
- Seed scripts for development data
