# MongoHacks Platform — Strategic Overhaul Plan

**Date**: February 26, 2026
**Codebase**: ~27,000 LOC across 100+ files
**Current State**: ~40% MVP with solid architecture, broken critical paths
**Goal**: Transform from a feature collection into a platform developers love

---

## Part 1: Honest Assessment

### What You've Built Well

The architecture is genuinely strong. Next.js 16 with React 19, MUI 7, MongoDB with Mongoose, proper edge-compatible middleware that decodes JWTs without Node.js dependencies — this is production-grade infrastructure. The type system in `types/index.ts` maps cleanly to the spec. The `(app)` route group with nested layouts shows good Next.js App Router understanding. The EventHub concept with conditional sections (HeroSection, NextStepsSection, YourTeamSection, BrowseTeamsSection) is the right UX pattern — it adapts to where the user is in their journey.

The admin side is comprehensive: events CRUD, user management, role assignment, templates, registration forms, partner management, landing page builder, analytics, results management. You've also invested in quality infrastructure with Jest, Playwright, coverage reporting, and seed scripts.

### Where It Breaks Down

The platform has a **front door problem**. Beautiful landing pages lead to broken registration. The dashboard doesn't guide users. Team browsing has no join button. Project submission has no validation. Judging exists as a page but lacks the workflow to be useful. Each individual piece works in isolation, but the *journey* between them is fractured.

This is a common pattern in ambitious projects: the data models and admin tooling get built first because they're satisfying to build, while the participant-facing flows that actually define the product get deferred. The result is a platform that's powerful for organizers but confusing for participants.

### The Core Problem Statement

**MongoHacks has the skeleton of every feature but the muscle of none.** The overhaul isn't about adding features — it's about finishing the five journeys that matter and making each one feel inevitable.

---

## Part 2: The Five Journeys

Every user interaction with this platform falls into one of five journeys. Each journey must be complete, validated, and delightful before we move on. No partial implementations.

### Journey 1: "I Found a Hackathon" → Registered Participant

**Current state**: 🔴 Broken (landing page → dead end)

```
Landing page (/{slug})  →  "Register Now"  →  ???
```

**Target state**: 🟢 Seamless

```
Landing page (/{slug})
  → "Register Now"
  → Quick registration form (name, email, password, 2 skill tags)
  → Auto-login
  → Redirect to Event Hub with confetti/welcome moment
  → Profile completion prompted later (progressive disclosure)
```

**What needs to happen**:

1. **Registration page** (`/events/[eventId]/register`) — Minimal form. Name, email, password, 2-3 skill tags from a preset list. No bio, no experience level, no GitHub username. Collect those later.
2. **Registration API** (`/api/events/[eventId]/register`) — Creates User + Participant in a single transaction. Adds event to registeredEvents[]. Returns session token.
3. **Post-registration redirect** — Send to Event Hub, not generic dashboard. The user registered for *this event* — keep them in that context.
4. **Capacity enforcement** — Check event.capacity before allowing registration. Show "Waitlist" button when full.
5. **Duplicate handling** — If email exists, show "Already have an account? Log in" with pre-filled email, then auto-register for the event after login.

**Validation rules**:
- Email uniqueness (across Users collection)
- Event registration deadline not passed
- Event capacity not exceeded
- Event status is "open"

**Time estimate**: 3-4 hours for complete, tested flow

---

### Journey 2: "I Need a Team" → Team Member

**Current state**: 🟡 Partially built (can browse teams, can't join)

**Target state**: 🟢 Social and low-friction

```
Event Hub shows: "You're not on a team yet"
  → Option A: Browse teams with "Request to Join" buttons
  → Option B: Create a team and describe what you need
  → Option C: "Match me" — AI suggests teams based on skills
```

**What needs to happen**:

1. **Wire up Join Team button** — The API exists (`/api/events/[eventId]/teams/[teamId]/join`). Connect it to the BrowseTeamsSection UI. Add optimistic update, loading state, and success toast.
2. **Team capacity validation** — Don't show Join for full teams. Show member count as "3/5" with visual progress bar.
3. **"Already on a team" guard** — If user has a teamId for this event, hide browse section and show their team instead. The EventHubContent already does this conditionally — verify it works.
4. **Team creation form improvements** — The form exists at `/events/[eventId]/teams/new`. Add a "Looking for" skill tag selector so teams can signal what they need. Store as `desiredSkills: string[]`.
5. **Skill-based team recommendations** — In the Event Hub's BrowseTeamsSection, sort teams by skill match. Start with a simple tag-overlap algorithm (count matching skills between participant.skills and team.desiredSkills). Vector search can come later.
6. **Leave team** — Users need an escape hatch. Add a "Leave Team" action with confirmation dialog.

**Validation rules**:
- One team per participant per event
- Team not at capacity
- User is registered for this event
- Team leader approval (optional — defer to v2, start with open join)

**Time estimate**: 3-4 hours

---

### Journey 3: "We Built Something" → Submitted Project

**Current state**: 🟡 Form exists, no validation

**Target state**: 🟢 Auto-saving workspace that freezes at deadline

```
Team page shows "Submit Your Project" card
  → Project form with auto-save (every 30 seconds)
  → Fields: name, description, category, technologies, repo URL, demo URL
  → "Save Draft" persists immediately
  → "Submit" locks the project for judging
  → Countdown to submission deadline visible throughout
```

**What needs to happen**:

1. **Add validation to project API** — This is the #1 data integrity issue. The four checks from your IMPROVEMENT_PLAN are correct:
   - User registered for event
   - User on a team
   - Team doesn't already have a project for this event
   - GitHub URL format validation
2. **Auto-save for drafts** — Projects in "draft" status should save automatically. Use a debounced PATCH on field changes. Show a subtle "Saved" indicator (like Google Docs).
3. **Submission deadline enforcement** — Check `event.endDate` or a dedicated `submissionDeadline` field. After deadline, existing drafts auto-submit and no new submissions are accepted.
4. **Project edit page** — The route exists (`/events/[eventId]/projects/[projectId]/edit`). Verify it loads project data and restricts editing to team members.
5. **Tech stack tag input** — Use an MUI Autocomplete with freeSolo for technology tags. Pre-populate suggestions from a common list (React, MongoDB, Python, Node.js, etc.).
6. **Repo URL preview** — When a GitHub URL is entered, fetch basic repo metadata (name, description, primary language) via GitHub's public API. Display as a preview card below the URL field. No auth required for public repos.

**Validation rules**:
- All Journey 2 validations (registered, on team)
- One project per team per event
- GitHub URL format: `^https?:\/\/(www\.)?github\.com\/.+\/.+`
- Project name required, 3-100 characters
- Description required, 20-5000 characters
- At least one technology tag

**Time estimate**: 4-5 hours

---

### Journey 4: "Time to Judge" → Scores Submitted

**Current state**: 🔴 Page exists but workflow is incomplete

**Target state**: 🟢 Card-based interface that respects judges' time

```
Judge logs in → sees assigned projects as cards
  → Clicks into a project → sees AI summary + repo link + demo link
  → Scores 3-5 criteria with sliders (1-10)
  → Types brief comment (optional — AI suggests starter text)
  → Submits → next project card auto-loads
  → Progress bar shows "7/15 projects scored"
```

**What needs to happen**:

1. **Judging rubric creation** — Admin creates a rubric per event via `/admin/events/[eventId]`. Store criteria with names, descriptions, weights, and max scores. Keep to 3-5 criteria — more than that and judge fatigue kills quality.
2. **Judge assignment** — Admin assigns judges to projects (or categories). Store in JudgeAssignment collection. Judges should only see their assigned projects.
3. **Judging interface** (`/judging/[eventId]`) — This page exists. It needs:
   - List of assigned projects with scored/unscored status
   - Individual project scoring view with criteria sliders
   - Comment field per criteria (optional) and overall comment
   - Submit button that validates all criteria have scores
   - Navigation between projects without losing progress
4. **Score API** (`/api/judging/[eventId]/score`) — This route exists. Verify it:
   - Validates judge is assigned to the project
   - Validates score ranges match rubric maxScore
   - Prevents duplicate scoring (one score per judge per project)
   - Calculates weighted overall score
5. **AI summary for judges** — When a project is submitted, generate a 2-3 sentence summary using OpenAI. Store as `aiSummary` on the Project document. Show prominently in the judging card so judges can quickly understand the project.
6. **Scoring progress** — Show judges their progress. "You've scored 7 of 15 projects." Add a progress bar to the judging page header.

**Validation rules**:
- Judge must be assigned to the project
- All criteria must have scores
- Scores within rubric range (1 to maxScore)
- One submission per judge per project (allow updates before event concludes)
- Event must be in "in_progress" or "concluded" status

**Time estimate**: 6-8 hours

---

### Journey 5: "Who Won?" → Results & Feedback

**Current state**: 🔴 Results page exists in admin, no participant-facing view

**Target state**: 🟢 Celebration page with feedback for every team

```
Event concludes → Admin clicks "Publish Results"
  → Public results page at /events/[eventId]/results
  → Winners announced with project showcase cards
  → Every team gets personalized feedback summary
  → Shareable project cards for social media
```

**What needs to happen**:

1. **Results aggregation** — API endpoint that calculates final scores: average across judges, weighted by rubric criteria. Rank projects. Handle ties.
2. **Results page** (`/events/[eventId]/results`) — Public page showing:
   - Winner announcement with project details
   - Category awards (if applicable)
   - Full leaderboard with scores
   - Each team's project card with their score and rank
3. **AI-generated feedback** — For each project, generate constructive feedback based on judge scores and comments. Use OpenAI to synthesize judge feedback into a coherent paragraph addressing strengths and areas for improvement. Store on the ProjectScore or as a new FeedbackSummary document.
4. **Team feedback view** — Each team can see their own detailed feedback at `/events/[eventId]/projects/[projectId]` after results are published. Show aggregate scores, individual criteria breakdowns, and the AI feedback summary.
5. **Admin publish control** — Admin triggers results publication. Until published, scores are hidden from participants.

**Time estimate**: 5-6 hours

---

## Part 3: The AI Layer

The spec envisions extensive AI integration. Here's what's realistic and valuable, in priority order.

### Tier 1: Immediate Value (build during Journey 4-5)

**Project Summaries for Judges**
When a project is submitted, call OpenAI to generate a 2-3 sentence summary. This is the single highest-ROI AI feature — it saves every judge 3-5 minutes per project.

```typescript
// Trigger: project status changes to "submitted"
const summary = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [{
    role: "system",
    content: "Summarize this hackathon project in 2-3 sentences. Focus on what it does, the key technology, and what makes it novel."
  }, {
    role: "user", 
    content: `Project: ${project.name}\nDescription: ${project.description}\nTech: ${project.technologies.join(", ")}\nInnovations: ${project.innovations}`
  }]
});
```

**Feedback Synthesis**
After judging concludes, synthesize judge comments into a constructive feedback paragraph per project. This is the feature participants will remember — every team gets something useful regardless of whether they won.

### Tier 2: Differentiating Features (Week 3-4)

**Vector-Based Team Matching**
Generate embeddings for participant skills and team desired skills. Use MongoDB Vector Search to recommend teams. This replaces the simple tag-overlap algorithm from Journey 2.

Implementation:
- Generate embedding when participant registers (skills + bio text)
- Generate embedding when team is created (desired skills + description)
- `$vectorSearch` aggregation to find top 5 matching teams
- Show as "Recommended for You" section in Event Hub

**Award Recommendations**
After all scores are in, use OpenAI to suggest award categories beyond "1st, 2nd, 3rd" — e.g., "Most Innovative Use of MongoDB", "Best Developer Experience", "People's Choice". Base suggestions on project descriptions and score distributions.

### Tier 3: Advanced (Post-launch)

**RAG-powered judging context** — Pull in event rules, past winning projects, and rubric descriptions as context for the AI analysis. Requires Vector Search indexes on historical data.

**Intelligent invitations** — Generate personalized invitation messages based on participant skills and event theme. Requires the Invitation model to be wired up.

**Real-time chat with AI moderation** — Team chat with AI-powered suggestions for breaking through blockers. High complexity, defer until core platform is stable.

---

## Part 4: Technical Debt & Infrastructure

### Must Fix

1. **No loading/error states** — The EventHubContent accepts `data: any` and destructures it optimistically. Add Suspense boundaries, error boundaries, and skeleton loaders for every async section.

2. **Type safety** — `data: any` in EventHubContent is a red flag. Create proper interfaces for the hub data shape. The types in `types/index.ts` are good — use them throughout.

3. **Middleware scope** — Current middleware only guards preview mode on landing pages. It should also protect `/admin/*` routes (require admin/organizer role) and `/judging/*` routes (require judge role). Currently these checks likely happen at the page level, but middleware-level protection is more reliable.

4. **Missing indexes** — Your IMPROVEMENT_PLAN identified this correctly. At minimum:
   ```
   events: { "landingPage.slug": 1 }
   participants: { "registeredEvents.eventId": 1 }
   projects: { teamId: 1, eventId: 1 }
   teams: { eventId: 1, lookingForMembers: 1 }
   projectScores: { projectId: 1, judgeId: 1 } (unique)
   ```

5. **Test coverage** — 7 tests for 27K LOC is effectively untested. Prioritize testing the critical path APIs: registration, team join, project submission, score submission. Target 40% coverage on API routes before launch.

### Should Fix

6. **No error boundaries** — A crash in one section (e.g., BrowseTeamsSection) takes down the entire Event Hub. Wrap each section in an error boundary that shows a graceful fallback.

7. **No optimistic updates** — Join team, submit score, save project — these should all feel instant. Update local state immediately, then sync to server. Roll back on error.

8. **Mobile experience** — MUI handles responsive layout well, but forms need explicit mobile attention. Ensure all form inputs have appropriate `inputMode` attributes, touch targets are 44px+, and navigation works with a thumb.

9. **Dark mode** — Your IMPROVEMENT_PLAN calls this out. MUI makes this straightforward. Add a theme toggle in the layout, persist preference in localStorage, and create a dark palette in your theme config.

### Nice to Have

10. **ISR for landing pages** — Landing pages are perfect candidates for Incremental Static Regeneration. They change rarely and are the highest-traffic pages.

11. **API documentation** — Swagger/OpenAPI at `/api/docs`. Useful for judges and organizers who want to automate.

12. **Webhook system** — Allow organizers to receive notifications on registration, team formation, project submission. Useful for Slack/Discord integrations.

---

## Part 5: Build Plan

### Sprint 1: "The Happy Path" (Days 1-3)

**Goal**: A developer can discover an event, register, join a team, and submit a project without hitting a dead end.

| Day | Task | Journey | Hours |
|-----|------|---------|-------|
| 1 | Registration flow (page + API + redirect) | J1 | 3-4 |
| 1 | Wire up Join Team button + validation | J2 | 2 |
| 2 | Project submission validations | J3 | 2 |
| 2 | Project auto-save + deadline enforcement | J3 | 2-3 |
| 2 | Dashboard → Event Hub redirect for registered events | J1→J2 | 1 |
| 3 | End-to-end manual test of full flow | All | 2 |
| 3 | Fix all broken transitions between journeys | All | 2-3 |

**Deliverable**: Complete participant flow from landing page to submitted project.

**Exit criteria**:
- New user can register from landing page and land in Event Hub
- User can browse teams, join one, see it reflected immediately
- Team can submit a project with proper validation
- All transitions work on mobile

---

### Sprint 2: "Judging That Works" (Days 4-6)

**Goal**: Judges can score all assigned projects efficiently. Results are published.

| Day | Task | Journey | Hours |
|-----|------|---------|-------|
| 4 | Judging rubric creation in admin | J4 | 2-3 |
| 4 | Judge assignment system | J4 | 2 |
| 5 | Judging interface — project cards + scoring sliders | J4 | 4-5 |
| 5 | Score API hardening (validation, duplicates, weighted calc) | J4 | 2 |
| 6 | Results aggregation + public results page | J5 | 3-4 |
| 6 | Admin "Publish Results" control | J5 | 1-2 |

**Deliverable**: Complete judging workflow from assignment to published results.

**Exit criteria**:
- Admin can create rubric with 3-5 weighted criteria
- Admin can assign judges to projects
- Judges see only their assignments, can score with sliders, submit
- Results page ranks all projects with scores
- Admin controls when results go public

---

### Sprint 3: "The Intelligence Layer" (Days 7-9)

**Goal**: AI features that differentiate the platform.

| Day | Task | Tier | Hours |
|-----|------|------|-------|
| 7 | OpenAI integration setup + embedding service | — | 1-2 |
| 7 | Project summary generation on submission | T1 | 2-3 |
| 7 | AI summary display in judging interface | T1 | 1 |
| 8 | Feedback synthesis after judging | T1 | 3-4 |
| 8 | Team feedback view with AI summary | T1 | 2 |
| 9 | Vector embedding generation for skills | T2 | 2 |
| 9 | Vector Search team recommendations | T2 | 3-4 |

**Deliverable**: AI-powered summaries, feedback, and team matching.

**Exit criteria**:
- Every submitted project gets a 2-3 sentence AI summary
- Judges see AI summary prominently on scoring cards
- Every team gets synthesized feedback after results publish
- Event Hub recommends teams based on skill similarity

---

### Sprint 4: "Polish & Harden" (Days 10-12)

**Goal**: Production-ready quality.

| Day | Task | Category | Hours |
|-----|------|----------|-------|
| 10 | Add loading/error states to all async components | Tech debt | 3-4 |
| 10 | Type safety — eliminate `any` types | Tech debt | 2 |
| 11 | API route tests for critical paths (registration, team, project, scoring) | Testing | 4-5 |
| 11 | Database indexes + query optimization | Performance | 2 |
| 12 | Mobile audit and fixes | UX | 3-4 |
| 12 | Dark mode implementation | UX | 2 |

**Deliverable**: Stable, tested, responsive platform.

**Exit criteria**:
- No `any` types in component props
- All async sections have loading skeletons and error fallbacks
- 20+ API route tests covering critical paths
- All pages functional on mobile (iPhone SE viewport)
- Dark mode toggle in settings

---

## Part 6: What NOT to Build (Yet)

The spec and improvement plan mention several features that should be explicitly deferred:

- **Real-time team chat** — High complexity, teams already use Discord/Slack. Add a "Team Chat" link field instead.
- **QR code check-in** — Nice for in-person events but not critical for the platform's value proposition. Add when you have a real in-person event scheduled.
- **Salesforce integration** — Important for MongoDB's internal use but not for the platform's core UX. Build after the five journeys work.
- **Email notifications** — Use console logging for now. Add SendGrid/Resend when you need production emails.
- **File uploads** — Project screenshots, team avatars. Use URL fields (Imgur, GitHub) for now.
- **Certificate generation** — Post-launch feature. Cool but not critical.
- **Interactive API documentation** — Useful for API consumers, not for the core UX.
- **Onboarding wizard** — Progressive disclosure in the Event Hub replaces this. Don't build a separate wizard.

---

## Part 7: Success Metrics

### Launch Readiness Checklist

```
Registration Flow
  [ ] Landing page "Register" button works
  [ ] Registration creates account + event registration
  [ ] Post-registration lands in Event Hub
  [ ] Duplicate email handled gracefully
  [ ] Capacity enforcement works
  [ ] Mobile form works with thumb

Team Formation
  [ ] Browse teams shows join button
  [ ] Join team updates UI immediately
  [ ] Team creation form captures desired skills
  [ ] Leave team works with confirmation
  [ ] One team per event enforced

Project Submission
  [ ] Only registered team members can submit
  [ ] One project per team per event enforced
  [ ] GitHub URL validated
  [ ] Draft auto-saves
  [ ] Submission deadline enforced
  [ ] Edit page loads existing project data

Judging
  [ ] Admin can create rubric with weighted criteria
  [ ] Admin can assign judges to projects
  [ ] Judges see only assigned projects
  [ ] Scoring interface with sliders works
  [ ] Score validation (range, duplicates)
  [ ] Progress tracking for judges

Results
  [ ] Scores aggregated correctly
  [ ] Admin can publish/unpublish results
  [ ] Public results page shows rankings
  [ ] Teams can see their own feedback

AI Features
  [ ] Project summaries generated on submission
  [ ] Summaries visible in judging interface
  [ ] Feedback synthesis works post-judging
  [ ] Vector search team recommendations work
```

### Performance Targets

- Registration API: < 500ms p95
- Event Hub page load: < 2 seconds
- Judging page load: < 1.5 seconds
- Team join action: < 300ms perceived (optimistic update)
- AI summary generation: < 10 seconds (async, show skeleton)

### Quality Targets

- Zero `any` types in component props
- 40%+ test coverage on API routes
- All pages functional at 375px width (iPhone SE)
- Lighthouse performance score > 80 on landing pages
- Zero console errors in production build

---

## Appendix: File Map for Key Changes

### New Files Needed

```
src/app/(app)/events/[eventId]/results/page.tsx          — Public results page
src/app/api/events/[eventId]/results/route.ts             — Results aggregation API
src/lib/ai/embedding-service.ts                           — OpenAI embedding utility
src/lib/ai/summary-service.ts                             — Project summary generation
src/lib/ai/feedback-service.ts                            — Feedback synthesis
src/lib/ai/matching-engine.ts                             — Vector search team matching
```

### Existing Files to Modify

```
src/app/(app)/events/[eventId]/register/RegistrationClient.tsx  — Simplify form, add post-reg redirect
src/app/api/events/[eventId]/register/route.ts                  — Add capacity check, duplicate handling
src/app/(app)/events/[eventId]/hub/sections/BrowseTeamsSection.tsx — Add Join button
src/app/(app)/events/[eventId]/teams/TeamCard.tsx               — Add capacity bar, join action
src/app/api/events/[eventId]/projects/route.ts                  — Add 4 validation checks
src/app/(app)/judging/[eventId]/page.tsx                        — Build scoring interface
src/app/api/judging/[eventId]/score/route.ts                    — Harden validation
src/app/(app)/dashboard/DashboardClient.tsx                     — Link to Event Hub for registered events
src/middleware.ts                                                — Add admin/judge route protection
src/types/index.ts                                              — Add EventHubData, JudgingView interfaces
```

---

*This plan prioritizes completing what exists over adding new features. The platform's value isn't in the number of features — it's in the quality of the five journeys that every participant, judge, and organizer will experience.*