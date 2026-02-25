# MongoHacks User Journey - Complete Flow

## 🎯 End-to-End User Experience

### Phase 1: Discovery & Registration

#### Step 1.1: Discover Event
```
User visits: /{slug} (e.g., /mongodb-hackathon-2024)
↓
Sees beautiful landing page with:
- Event details (dates, location, theme)
- Prizes
- Schedule
- FAQ
↓
Clicks "Register Now" button
```

**Current Status:** ✅ Landing page built  
**Missing:** Registration flow (where does "Register Now" go?)

---

#### Step 1.2: Register for Event
```
Redirects to: /events/{eventId}/register

Registration form:
┌─────────────────────────────────────┐
│ Register for MongoDB Hackathon 2024 │
├─────────────────────────────────────┤
│ Full Name: [________________]       │
│ Email: [____________________]       │
│ Password: [_________________]       │
│ Confirm Password: [__________]      │
│                                     │
│ GitHub Username: [__________]       │
│ Skills: [___________________]       │
│ Experience: [Intermediate ▼]        │
│ Bio: [_____________________]        │
│      [_____________________]        │
│                                     │
│ ☑ I accept terms and conditions     │
│ ☑ I accept code of conduct          │
│                                     │
│     [Register for Event]            │
└─────────────────────────────────────┘
```

**Action:**
- Creates User account (if doesn't exist)
- Creates Participant profile
- Adds event to `participant.registeredEvents[]`
- Redirects to `/dashboard` or `/events/{eventId}/teams`

**Current Status:** ❌ Not built  
**Priority:** HIGH - Critical path

---

### Phase 2: Team Formation

#### Step 2.1: User Dashboard
```
User logs in
↓
Lands on: /dashboard

Dashboard shows:
┌─────────────────────────────────────┐
│ Welcome back, John!                 │
├─────────────────────────────────────┤
│ Registered Events (2)               │
│ ┌───────────────────────────────┐   │
│ │ MongoDB Hackathon 2024        │   │
│ │ Mar 15-17 • San Francisco     │   │
│ │ Status: Registered            │   │
│ │ Team: Not joined yet          │   │
│ │                               │   │
│ │ [Find a Team] [Create Team]   │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ AI Innovation Challenge       │   │
│ │ Apr 1-3 • Virtual             │   │
│ │ Status: Registered            │   │
│ │ Team: Code Warriors (4/5)     │   │
│ │                               │   │
│ │ [View Team] [Submit Project]  │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Current Status:** ⚠️ Partially built (basic dashboard exists)  
**Missing:** Event cards with team status + action buttons

---

#### Step 2.2: Browse Teams (Option A)
```
User clicks "Find a Team"
↓
Navigates to: /events/{eventId}/teams

Teams page shows:
┌─────────────────────────────────────┐
│ Teams Looking for Members           │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │
│ │ 🔍 Team Rocket                │   │
│ │ 3/5 members                   │   │
│ │ Looking for: Backend dev      │   │
│ │ Skills: Python, MongoDB       │   │
│ │                               │   │
│ │          [Join Team]          │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ 🔍 MongoDB Mavericks          │   │
│ │ 2/4 members                   │   │
│ │ Looking for: Frontend, Design │   │
│ │ Skills: React, Node.js        │   │
│ │                               │   │
│ │          [Join Team]          │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Current Status:** ⚠️ Page exists, but missing:
- "Join Team" button UI
- Team capacity validation
- User's current team check

---

#### Step 2.3: Create Team (Option B)
```
User clicks "Create Team"
↓
Navigates to: /events/{eventId}/teams/new

Create team form:
┌─────────────────────────────────────┐
│ Create Your Team                    │
├─────────────────────────────────────┤
│ Team Name: [__________________]     │
│ Description: [________________]     │
│              [________________]     │
│                                     │
│ Max Members: [5 ▼]                  │
│ ☑ Looking for members               │
│                                     │
│ Desired Skills:                     │
│ ☑ Backend  ☑ Frontend  ☐ Mobile    │
│ ☑ Design   ☐ DevOps    ☐ Data      │
│                                     │
│     [Create Team]                   │
└─────────────────────────────────────┘
```

**Action:**
- Creates team
- Sets user as team leader
- Adds user to team.members[]
- Updates participant.teamId
- Redirects to team page

**Current Status:** ✅ Form built  
**Missing:** Backend validation, redirect logic

---

### Phase 3: Project Submission

#### Step 3.1: Team Decides on Project
```
Team communicates (external: Slack, Discord, etc.)
↓
Decides on project idea
↓
Team lead (or any member) registers project
```

---

#### Step 3.2: Submit Project
```
Team member navigates to: /events/{eventId}/projects/new

Project submission form:
┌─────────────────────────────────────┐
│ Submit Your Project                 │
├─────────────────────────────────────┤
│ Team: Code Warriors (auto-filled)   │
│                                     │
│ Project Name: [__________________]  │
│ Description: [___________________]  │
│              [___________________]  │
│                                     │
│ Category: [AI/ML ▼]                 │
│                                     │
│ Technologies:                       │
│ [MongoDB, Python, React]            │
│                                     │
│ GitHub Repo: [__________________]   │
│ Demo URL: [_____________________]   │
│ Docs URL: [_____________________]   │
│                                     │
│ What's Innovative?                  │
│ [____________________________]      │
│ [____________________________]      │
│                                     │
│ [Save Draft] [Submit Project]       │
└─────────────────────────────────────┘
```

**Validations Needed:**
1. ✅ User must be logged in
2. ❌ User must be registered for this event
3. ❌ User must be on a team
4. ❌ Team can only have ONE project per event
5. ❌ GitHub repo URL validation (format check)
6. ⚠️ GitHub repo accessibility check (optional)

**Current Status:** ✅ Form built  
**Missing:** Validations #2-6

---

### Phase 4: Judging & Results

#### Step 4.1: Judges Review
```
Judge navigates to: /admin/events/{eventId}/judging (or /judging if role=judge)

Judging interface:
┌─────────────────────────────────────┐
│ Projects to Judge (15)              │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │
│ │ Team Rocket                   │   │
│ │ Project: AI-Powered Chatbot   │   │
│ │                               │   │
│ │ [View Repo] [View Demo]       │   │
│ │                               │   │
│ │ Criteria Scores:              │   │
│ │ Innovation: [8 ▼]             │   │
│ │ Technical: [7 ▼]              │   │
│ │ Impact: [9 ▼]                 │   │
│ │ Presentation: [8 ▼]           │   │
│ │                               │   │
│ │ Comments: [______________]    │   │
│ │           [______________]    │   │
│ │                               │   │
│ │     [Submit Scores]           │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Current Status:** ❌ Not built  
**Priority:** MEDIUM (can be added later)

---

## 🔧 What Needs to Be Built

### High Priority (Critical Path)

#### 1. Public Registration Flow ❌
**Files to create:**
- `src/app/events/[eventId]/register/page.tsx` - Registration form
- `src/app/api/events/[eventId]/register/route.ts` - Registration API

**Logic:**
- Check if user exists (by email)
- If not, create User account
- Create/update Participant profile
- Add event to `participant.registeredEvents[]`
- Redirect to dashboard or teams page

**Time estimate:** 1-2 hours

---

#### 2. Enhanced Dashboard ⚠️
**File to update:**
- `src/app/dashboard/page.tsx` - Add registered events cards

**Logic:**
- Fetch user's registered events
- For each event, show:
  - Event name, dates, location
  - Team status (joined/not joined)
  - Action buttons (Find Team, Create Team, View Team, Submit Project)

**Time estimate:** 1 hour

---

#### 3. Join Team Button ❌
**Files to update:**
- `src/app/events/[eventId]/teams/page.tsx` - Add "Join Team" button
- Already have API: `src/app/api/events/[eventId]/teams/[teamId]/join/route.ts` ✅

**Logic:**
- Validate user not already on a team for this event
- Check team capacity
- Add user to team
- Update participant.teamId
- Redirect to team page

**Time estimate:** 30 minutes

---

#### 4. Project Submission Validations ❌
**File to update:**
- `src/app/api/events/[eventId]/projects/route.ts` - Add validations

**Validations to add:**
```typescript
// 1. Check user is registered for event
const participant = await ParticipantModel.findOne({
  userId: session.user.id,
  "registeredEvents.eventId": eventId,
});
if (!participant) {
  return errorResponse("You must be registered for this event", 403);
}

// 2. Check user is on a team
if (!participant.teamId) {
  return errorResponse("You must join a team before submitting a project", 403);
}

// 3. Check team doesn't already have a project for this event
const existingProject = await ProjectModel.findOne({
  teamId: participant.teamId,
  eventId: eventId,
});
if (existingProject) {
  return errorResponse("Your team already has a project for this event", 409);
}

// 4. Validate GitHub repo URL format
if (!/^https?:\/\/(www\.)?github\.com\/.+\/.+/.test(body.repoUrl)) {
  return errorResponse("Invalid GitHub repository URL", 422);
}
```

**Time estimate:** 30 minutes

---

### Medium Priority (Post-MVP)

#### 5. Team Matching Algorithm ⚠️
**Logic:**
- Use `participant.skills` and `participant.skillsEmbedding`
- Use `team.desiredSkills`
- Recommend teams based on skill match

**Time estimate:** 2-3 hours

---

#### 6. Judging Interface ❌
**Files to create:**
- `src/app/admin/events/[eventId]/judging/page.tsx`
- `src/app/api/events/[eventId]/judging/route.ts`
- `src/lib/db/models/Score.ts` (new model for judge scores)

**Time estimate:** 3-4 hours

---

## 📊 Data Flow Diagram

```
Landing Page (/{slug})
        ↓
    [Register Now]
        ↓
Registration Form (/events/{eventId}/register)
        ↓
    Creates:
    - User (auth)
    - Participant (profile + event registration)
        ↓
Dashboard (/dashboard)
        ↓
    [Find Team] OR [Create Team]
        ↓
Teams Browse (/events/{eventId}/teams)
        ↓
    [Join Team] OR [Create Team]
        ↓
    Updates:
    - Participant.teamId
    - Team.members[]
        ↓
Project Submission (/events/{eventId}/projects/new)
        ↓
    Validates:
    - User registered for event ✓
    - User on team ✓
    - Team has no existing project ✓
    - GitHub repo URL valid ✓
        ↓
    Creates:
    - Project (with teamId, repoUrl, etc.)
        ↓
Judging (/admin/events/{eventId}/judging)
        ↓
    Creates:
    - Scores (per judge, per project)
        ↓
Results Announcement
```

---

## 🎯 Recommended Build Order

1. **Registration Flow** (2 hours)
   - Public registration page
   - API endpoint
   - Redirect logic

2. **Dashboard Enhancement** (1 hour)
   - Event cards
   - Team status
   - Action buttons

3. **Join Team Button** (30 min)
   - UI button
   - Wire up existing API

4. **Project Validations** (30 min)
   - Add 4 validation checks
   - Error messages

5. **GitHub Repo Validation** (1 hour)
   - Format check (regex)
   - Optional: GitHub API check (repo exists + accessible)

**Total Time:** ~5 hours for complete critical path

---

## 🚀 Quick Wins (Do First)

### Join Team Button (30 min)
Already have the API, just need UI:

```tsx
<Button
  variant="contained"
  onClick={() => handleJoinTeam(team._id)}
  disabled={userAlreadyOnTeam || teamFull}
>
  Join Team
</Button>
```

### Project Validations (30 min)
Add validation checks to existing API.

### GitHub URL Validation (15 min)
Simple regex check:
```typescript
const isValidGitHubUrl = (url: string) => {
  return /^https?:\/\/(www\.)?github\.com\/.+\/.+/.test(url);
};
```

**Total Quick Wins:** ~1.5 hours

---

## 💡 Future Enhancements

- [ ] Email notifications (registration confirmation, team invites)
- [ ] Team chat integration (Discord/Slack bot)
- [ ] Project gallery page (public showcase)
- [ ] Leaderboard (real-time judging scores)
- [ ] Certificate generation (for winners/participants)
- [ ] Post-event survey
- [ ] Analytics dashboard (admin metrics)

---

## ✅ Summary

**What We Have:**
- ✅ Landing pages with custom URLs
- ✅ Event, User, Participant, Team, Project models
- ✅ Admin interfaces
- ✅ Team creation form
- ✅ Project submission form
- ✅ Team join API

**What We Need:**
- ❌ Public registration flow (HIGH)
- ⚠️ Enhanced dashboard with event cards (HIGH)
- ❌ Join team button UI (MEDIUM)
- ❌ Project submission validations (HIGH)
- ❌ Judging interface (MEDIUM)

**Critical Path:** Registration → Dashboard → Join Team → Submit Project

**Time to Complete:** ~5 hours for full MVP flow

---

Ready to build? Let's start with the **registration flow** - it's the most critical missing piece.
