# Event Hub UX Design - Participant Experience
**Date:** February 26, 2026, 2:10 AM EST  
**Designer:** Claude (OpenClaw Agent)  
**Goal:** Create a personalized command center for hackathon participants

---

## 🎯 Problem Statement

**Current State:**  
Participants are scattered across multiple pages with no central hub:
- `/dashboard` - Generic list of registered events
- `/events/{id}` - Public event details
- `/events/{id}/teams` - Browse all teams
- `/events/{id}/teams/{teamId}` - View specific team
- `/events/{id}/projects/new` - Submit project

**Problems:**
1. No personalized view of "my participation"
2. No clear next steps or progress tracking
3. No team communication built-in
4. No quick access to resources
5. Confusing navigation between pages

---

## 🏠 Proposed Solution: Event Participant Hub

**New Route:** `/events/{eventId}/hub` or `/events/{eventId}/me`

**Purpose:** A personalized command center that answers:
- Where am I in the event journey?
- What's my team status?
- What do I need to do next?
- How do I communicate with my team?
- What resources do I need?

---

## 📐 Information Architecture

### Hub Sections (Vertical Layout)

```
┌────────────────────────────────────────────────────────┐
│  EVENT PARTICIPANT HUB                                 │
├────────────────────────────────────────────────────────┤
│  1. Hero / Status Banner                               │
│     - Event countdown                                  │
│     - Current phase (registration/hacking/judging)     │
│     - Quick stats (your team, your project status)     │
├────────────────────────────────────────────────────────┤
│  2. Next Steps / Checklist                             │
│     - Dynamic checklist based on state                 │
│     - "✓ Registered" "⚠️ Join a team" "☐ Submit"      │
├────────────────────────────────────────────────────────┤
│  3. Your Team (if joined)                              │
│     - Team name, leader, members                       │
│     - Mini communication panel                         │
│     - Quick actions (leave team, invite members)       │
├────────────────────────────────────────────────────────┤
│  4. Your Project (if created)                          │
│     - Project name, description, repo                  │
│     - Status (draft/submitted/judged)                  │
│     - Edit/submit actions                              │
├────────────────────────────────────────────────────────┤
│  5. Event Resources                                    │
│     - Schedule (with "happening now" indicator)        │
│     - Prizes                                           │
│     - Judges                                           │
│     - API docs / starter code                          │
│     - Slack/Discord link                               │
├────────────────────────────────────────────────────────┤
│  6. Browse Teams (if not joined)                       │
│     - Recommended teams (skill match)                  │
│     - All available teams                              │
│     - Create team button                               │
└────────────────────────────────────────────────────────┘
```

---

## 🎨 Detailed Component Designs

### 1. Hero / Status Banner

**Purpose:** Immediate context of where we are in the event

**Layout:**
```tsx
┌──────────────────────────────────────────────────────────┐
│  🏆 MongoDB Spring Hackathon 2026                        │
│                                                          │
│  ⏰ Event Starts In: 2 days, 14 hours                   │
│  📍 Current Phase: Team Formation                        │
│                                                          │
│  Your Status: ✓ Registered  ⚠️ No Team  ☐ No Project   │
└──────────────────────────────────────────────────────────┘
```

**Visual Treatment:**
- Gradient background (MongoDB green → blue)
- Large, bold typography
- Icons for each status item
- Progress bar showing event phases

**Data Displayed:**
- Event name
- Countdown (to start if before, to deadline if during)
- Current phase (registration/team formation/hacking/judging/results)
- Participant status (registered, team joined, project submitted)

**Interactive Elements:**
- Click countdown for full schedule
- Click status items to jump to relevant section

**Code Pattern:**
```tsx
interface EventPhase {
  name: string;
  start: Date;
  end: Date;
  isCurrent: boolean;
}

const phases: EventPhase[] = [
  { name: "Registration", start: startDate, end: registrationDeadline, isCurrent: true },
  { name: "Team Formation", start: registrationDeadline, end: startDate, isCurrent: false },
  { name: "Hacking", start: startDate, end: submissionDeadline, isCurrent: false },
  { name: "Judging", start: submissionDeadline, end: endDate, isCurrent: false },
  { name: "Results", start: endDate, end: endDate, isCurrent: false },
];
```

---

### 2. Next Steps / Dynamic Checklist

**Purpose:** Tell the participant exactly what to do next

**States:**

#### State A: Just Registered (No Team)
```
✅ You're registered for the event!
👥 Next: Join or create a team
   → Browse teams looking for members
   → Create your own team

Deadline: Team formation ends in 5 days
```

#### State B: On a Team (No Project)
```
✅ You're on Team Rocket
💻 Next: Start building your project
   → Discuss ideas with your team
   → Submit your project details

Deadline: Project submission in 10 days
```

#### State C: Project Submitted
```
✅ Project submitted!
🏆 Next: Prepare for judging
   → Finalize your demo
   → Practice your pitch
   → Wait for judge assignments

Deadline: Demo day in 3 days
```

#### State D: Judging Complete
```
🎉 Judging is complete!
🏆 Results announcement: March 20, 2026 at 6:00 PM
   → Check back soon for winners
   → Join us on Discord for the ceremony
```

**Visual Treatment:**
- Card with accent border (green for complete, yellow for pending)
- Large checkmarks for completed steps
- Animated "pulse" for current step
- Deadline countdown badge

**Interactive Elements:**
- Click action items to navigate directly
- Collapse/expand details

---

### 3. Your Team Section (If Joined)

**Purpose:** Team overview and quick communication

**Layout:**
```tsx
┌──────────────────────────────────────────────────────┐
│  👥 Team Rocket (4/5 members)                        │
│                                                      │
│  🎯 Looking for: Frontend Developer                 │
│  🛠️ Skills: Python, MongoDB, React                   │
│                                                      │
│  Team Members:                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │ 👤 Alice Chen (Leader)                         │ │
│  │    Backend • Python, MongoDB                   │ │
│  │    [Message] [GitHub]                          │ │
│  ├────────────────────────────────────────────────┤ │
│  │ 👤 Bob Smith (You)                             │ │
│  │    Frontend • React, TypeScript                │ │
│  ├────────────────────────────────────────────────┤ │
│  │ 👤 Carol Wang                                  │ │
│  │    Design • Figma, UI/UX                       │ │
│  │    [Message] [GitHub]                          │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Quick Chat:                                         │
│  ┌────────────────────────────────────────────────┐ │
│  │ Alice: Let's meet on Discord at 7 PM          │ │
│  │ Bob (You): Sounds good! 👍                     │ │
│  │ [Type a message...]                    [Send]  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [View Full Team Page] [Invite Member] [Leave Team] │
└──────────────────────────────────────────────────────┘
```

**Features:**
- **Team Info:** Name, capacity, skills, description
- **Member List:** Avatar, name, role, skills, contact buttons
- **Quick Chat:** Last 3 messages, input field, send button
- **Actions:** View full page, invite members, leave team

**Communication Options (Priority Order):**

#### Option 1: Built-in Team Chat (Recommended)
**Why:** Keeps everything in one place, no external dependencies

**Implementation:**
- WebSocket connection (Socket.io or Pusher)
- Store messages in MongoDB
- Real-time updates
- @mentions
- File sharing (optional)

**Pros:**
- Seamless UX
- No external tools needed
- Full control over features

**Cons:**
- 6-8 hours to build
- Need to maintain infrastructure

#### Option 2: Discord/Slack Integration (Quick Win)
**Why:** Leverage existing tools developers already use

**Implementation:**
- Create Discord channel per team (via Discord API)
- Embed Discord widget in hub
- Or: Show Discord link + button

**Pros:**
- Quick to implement (1-2 hours)
- Rich features (voice, video, screen share)
- Familiar to developers

**Cons:**
- Users leave the platform
- Less control over UX
- Discord rate limits

#### Option 3: Hybrid Approach (Best of Both)
**Why:** Lightweight built-in chat + Discord for advanced features

**Implementation:**
- Simple text chat built-in (no files, just messages)
- "Upgrade to Discord" button for voice/video
- Auto-create Discord channel when needed

**Pros:**
- Quick (3-4 hours)
- Good UX for simple coordination
- Scales to advanced needs

**Cons:**
- Maintaining two systems

**Recommendation:** Start with **Option 2** (Discord link), upgrade to **Option 3** in Phase 2.

---

### 4. Your Project Section (If Created)

**Purpose:** Quick access to project details and submission status

**Layout:**
```tsx
┌──────────────────────────────────────────────────────┐
│  🚀 Your Project: AI-Powered Code Assistant          │
│                                                      │
│  Status: 🟡 Draft (Not Submitted)                   │
│  Team: Team Rocket                                   │
│                                                      │
│  📝 Description:                                     │
│  An intelligent coding assistant that uses LLMs     │
│  and MongoDB Vector Search to provide contextual    │
│  code suggestions based on your codebase.           │
│                                                      │
│  🏷️ Category: AI/ML                                  │
│  💻 Tech Stack: Python, MongoDB, OpenAI, React       │
│                                                      │
│  🔗 Links:                                           │
│  GitHub: [github.com/team-rocket/ai-assistant] 🔗   │
│  Demo: [ai-assistant.vercel.app] 🔗                 │
│  Docs: [Not provided yet]                           │
│                                                      │
│  ⏰ Submission Deadline: March 15, 2026 (8 days)    │
│                                                      │
│  [Edit Project] [Submit for Judging] [View Details] │
└──────────────────────────────────────────────────────┘
```

**Visual Indicators:**
- **Draft:** Yellow badge, "Not Submitted" text
- **Submitted:** Green badge, "Submitted on {date}"
- **Judged:** Blue badge, "Scored by {N} judges"
- **Winner:** Gold trophy icon

**Interactive Elements:**
- Click GitHub link → opens in new tab
- Click Demo link → opens in new tab
- Edit Project → form with pre-filled data
- Submit for Judging → confirmation modal → API call

**Submission Flow:**
1. Click "Submit for Judging"
2. Modal appears:
   ```
   ⚠️ Ready to submit your project?
   
   Once submitted, you can still edit until the deadline,
   but judges will be notified.
   
   Make sure you have:
   ✓ GitHub repository link
   ✓ Demo URL (if applicable)
   ✓ Complete description
   ✓ Tech stack listed
   
   [Cancel] [Submit Project]
   ```
3. On submit → status changes to "Submitted"
4. Email sent to team members
5. Judges notified (if judging has started)

---

### 5. Event Resources (Collapsible)

**Purpose:** Quick reference for event information and tools

**Layout:**
```tsx
┌──────────────────────────────────────────────────────┐
│  📚 Event Resources                         [Expand] │
├──────────────────────────────────────────────────────┤
│  📅 Schedule                                         │
│  ┌────────────────────────────────────────────────┐ │
│  │ Friday, March 15                               │ │
│  │ • 6:00 PM - Opening Ceremony 🔴 LIVE          │ │
│  │ • 7:00 PM - Hacking Begins                    │ │
│  │                                                 │ │
│  │ Saturday, March 16                             │ │
│  │ • 9:00 AM - Breakfast                         │ │
│  │ • 12:00 PM - Lunch                            │ │
│  │ • 3:00 PM - Sponsor Talks                     │ │
│  │ • 6:00 PM - Dinner                            │ │
│  │                                                 │ │
│  │ Sunday, March 17                               │ │
│  │ • 9:00 AM - Submission Deadline ⏰            │ │
│  │ • 11:00 AM - Demos Begin                      │ │
│  │ • 3:00 PM - Awards Ceremony                   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  🏆 Prizes                                           │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🥇 Grand Prize: $10,000                        │ │
│  │ 🥈 2nd Place: $5,000                           │ │
│  │ 🥉 3rd Place: $2,500                           │ │
│  │                                                 │ │
│  │ Category Prizes (4 categories)                 │ │
│  │ 🎯 Best AI/ML: $3,000                          │ │
│  │ 🎯 Best Use of MongoDB: $3,000                 │ │
│  │ 🎯 Best Design: $3,000                         │ │
│  │ 🎯 Social Impact: $3,000                       │ │
│  │                                                 │ │
│  │ [View All Prizes]                              │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  👨‍⚖️ Judges (5)                                       │
│  [View Judge Bios]                                  │
│                                                      │
│  🔗 Developer Resources                              │
│  • MongoDB Atlas Free Tier: [Sign up]              │
│  • Starter Templates: [GitHub]                      │
│  • API Documentation: [Docs]                        │
│  • Troubleshooting Guide: [Help]                    │
│                                                      │
│  💬 Community                                        │
│  • Discord Server: [Join] (325 members online)      │
│  • Slack Workspace: [Join]                          │
│  • Event Hashtag: #MongoHacksSpring2026             │
└──────────────────────────────────────────────────────┘
```

**Interactive Features:**
- **Schedule:** Shows "🔴 LIVE" indicator for current sessions
- **Prizes:** Expandable cards with criteria
- **Judges:** Links to LinkedIn/Twitter
- **Resources:** Direct links, track clicks for analytics
- **Community:** Show live member count from Discord API

---

### 6. Browse Teams (If Not Joined)

**Purpose:** Help participant find a team quickly

**Layout:**
```tsx
┌──────────────────────────────────────────────────────┐
│  🔍 Find Your Team                                   │
│                                                      │
│  You haven't joined a team yet.                     │
│  Deadline: Team formation ends in 5 days            │
│                                                      │
│  🎯 Recommended for You (Based on Your Skills)      │
│  ┌────────────────────────────────────────────────┐ │
│  │ Team Rocket - 3/5 members                      │ │
│  │ Looking for: Frontend Developer                │ │
│  │ Skills: Python, MongoDB, React                 │ │
│  │ Match: 85% 🟢🟢🟢🟢⚪                          │ │
│  │ [View Team] [Join Team]                        │ │
│  ├────────────────────────────────────────────────┤ │
│  │ MongoDB Mavericks - 2/4 members                │ │
│  │ Looking for: Backend, DevOps                   │ │
│  │ Skills: Node.js, Docker, Kubernetes            │ │
│  │ Match: 70% 🟢🟢🟢⚪⚪                          │ │
│  │ [View Team] [Join Team]                        │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Or create your own team:                           │
│  [Create New Team]                                  │
│                                                      │
│  Browse all teams: [View All 25 Teams →]           │
└──────────────────────────────────────────────────────┘
```

**Recommendation Algorithm:**

```typescript
interface TeamRecommendation {
  team: Team;
  matchScore: number; // 0-100
  matchReasons: string[];
}

async function recommendTeams(participant: Participant, eventId: string): Promise<TeamRecommendation[]> {
  // 1. Get participant skills embedding
  const participantSkills = participant.skillsEmbedding;
  
  // 2. Vector search for teams looking for similar skills
  const teams = await db.collection('teams').aggregate([
    {
      $vectorSearch: {
        queryVector: participantSkills,
        path: "desiredSkillsEmbedding",
        numCandidates: 50,
        limit: 10,
        index: "team_skills_index"
      }
    },
    {
      $match: {
        eventId,
        lookingForMembers: true,
        $expr: { $lt: [{ $size: "$members" }, "$maxMembers"] } // Not full
      }
    }
  ]);

  // 3. Calculate match scores
  return teams.map(team => {
    const reasons = [];
    let score = 0;

    // Vector similarity (0-1) * 60 points
    score += team.vectorScore * 60;

    // Team not full bonus
    const spotsLeft = team.maxMembers - team.members.length;
    if (spotsLeft > 1) {
      score += 10;
      reasons.push(`${spotsLeft} spots available`);
    }

    // Skill match reasons
    const matchingSkills = participant.skills.filter(s => 
      team.desiredSkills.includes(s)
    );
    if (matchingSkills.length > 0) {
      score += matchingSkills.length * 5;
      reasons.push(`Matches: ${matchingSkills.join(", ")}`);
    }

    // Experience level match
    if (participant.experience_level === team.preferredExperience) {
      score += 10;
      reasons.push(`${participant.experience_level} level preferred`);
    }

    return {
      team,
      matchScore: Math.min(score, 100),
      matchReasons: reasons
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
```

---

## 🎭 User Flow Examples

### Flow 1: New Participant (Just Registered)

**Page Load:**
1. Hero shows "Event starts in 3 days"
2. Next Steps: "✅ Registered • ⚠️ Join a team"
3. "Your Team" section shows: "You haven't joined a team yet"
4. "Browse Teams" section shows: Recommended teams + Create button
5. Resources section collapsed

**User Actions:**
1. Sees "85% match" with Team Rocket
2. Clicks "View Team" → Opens team detail modal
3. Reads team description, sees members
4. Clicks "Join Team" → Joins successfully
5. **Hub refreshes:**
   - Next Steps updates: "✅ Registered • ✅ On a team • ☐ Submit project"
   - "Your Team" section now shows Team Rocket details + chat
   - "Browse Teams" section disappears

---

### Flow 2: Participant on Team (Ready to Build)

**Page Load:**
1. Hero shows "Hacking starts in 2 days"
2. Next Steps: "✅ On Team Rocket • 💻 Start building"
3. "Your Team" section shows full team + quick chat
4. "Your Project" section shows: "No project yet"
5. Resources section shows upcoming schedule

**User Actions:**
1. Scrolls to team section
2. Sees message from team leader: "Let's meet on Discord tonight"
3. Clicks Discord link → Opens Discord in new tab
4. Returns to hub
5. Clicks "Create Project" button
6. Fills out project form
7. Saves as draft
8. **Hub refreshes:**
   - Next Steps updates: "✅ On a team • 🟡 Project draft • ☐ Submit"
   - "Your Project" section now shows project details + "Submit" button

---

### Flow 3: Participant Ready to Submit

**Page Load:**
1. Hero shows "Submission deadline in 6 hours"
2. Next Steps: "⏰ Submit your project now!"
3. "Your Team" section shows team + chat
4. "Your Project" section shows complete project details

**User Actions:**
1. Reviews project details
2. Clicks "Edit Project" to update demo URL
3. Saves changes
4. Clicks "Submit for Judging"
5. Modal appears with checklist
6. Confirms submission
7. **Hub refreshes:**
   - Next Steps updates: "🎉 Project submitted! • 🏆 Wait for judging"
   - "Your Project" section shows green "Submitted" badge
   - Email sent to all team members

---

## 🎨 Visual Design System

### Color Coding

**Status Colors:**
- ✅ Complete: Green (#00ED64)
- 🟡 In Progress: Yellow (#FFC107)
- ⚠️ Action Needed: Orange (#FF9800)
- 🔴 Urgent: Red (#F44336)
- ⚪ Not Started: Gray (#BDBDBD)

**Section Backgrounds:**
- Hero: Gradient (MongoDB green → blue)
- Next Steps: White with colored left border
- Your Team: Light gray (#F5F5F5)
- Your Project: White
- Resources: Collapsible, light blue (#E3F2FD)

### Typography

**Hierarchy:**
- Hero: h3 (2rem)
- Section Titles: h5 (1.25rem)
- Body: body1 (1rem)
- Metadata: caption (0.875rem)

### Spacing

**Consistent Gaps:**
- Between sections: 24px (3 spacing units)
- Within cards: 16px (2 spacing units)
- Between list items: 8px (1 spacing unit)

---

## 🛠️ Technical Implementation

### Data Requirements

**API Endpoint:**
```typescript
GET /api/events/{eventId}/hub

Response:
{
  event: Event,
  participant: Participant,
  team: Team | null,
  project: Project | null,
  recommendedTeams: Team[],
  nextMilestone: Milestone,
  upcomingSchedule: ScheduleItem[],
  teamMessages: Message[] // Last 10
}
```

**MongoDB Queries:**

```typescript
async function getEventHubData(userId: string, eventId: string) {
  await connectToDatabase();

  // 1. Get participant
  const participant = await ParticipantModel.findOne({
    userId,
    "registeredEvents.eventId": eventId
  }).populate("teamId");

  if (!participant) {
    throw new Error("Not registered for this event");
  }

  // 2. Get event
  const event = await EventModel.findById(eventId)
    .populate("prizes")
    .populate("judges");

  // 3. Get team (if joined)
  const team = participant.teamId
    ? await TeamModel.findById(participant.teamId).populate("members")
    : null;

  // 4. Get project (if exists)
  const project = team
    ? await ProjectModel.findOne({ teamId: team._id, eventId })
    : null;

  // 5. Get recommended teams (if no team)
  const recommendedTeams = !team
    ? await recommendTeams(participant, eventId)
    : [];

  // 6. Calculate next milestone
  const nextMilestone = calculateNextMilestone(event, participant, team, project);

  // 7. Get upcoming schedule (next 24 hours)
  const upcomingSchedule = event.schedule.filter(item =>
    item.start > new Date() && item.start < addDays(new Date(), 1)
  );

  // 8. Get team messages (if on team)
  const teamMessages = team
    ? await MessageModel.find({ teamId: team._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "name")
    : [];

  return {
    event,
    participant,
    team,
    project,
    recommendedTeams,
    nextMilestone,
    upcomingSchedule,
    teamMessages: teamMessages.reverse(),
  };
}
```

**Next Milestone Logic:**

```typescript
function calculateNextMilestone(
  event: Event,
  participant: Participant,
  team: Team | null,
  project: Project | null
): Milestone {
  const now = new Date();

  // Pre-event
  if (now < event.startDate) {
    if (!team) {
      return {
        title: "Join or create a team",
        description: "Team formation ends soon",
        deadline: event.startDate,
        action: "browse-teams",
        priority: "high"
      };
    }
    return {
      title: "Prepare for hacking",
      description: "Event starts soon",
      deadline: event.startDate,
      action: "view-resources",
      priority: "medium"
    };
  }

  // During event
  if (now >= event.startDate && now < event.submissionDeadline) {
    if (!project) {
      return {
        title: "Start building your project",
        description: "Submission deadline approaching",
        deadline: event.submissionDeadline,
        action: "create-project",
        priority: "high"
      };
    }
    if (project.status === "draft") {
      return {
        title: "Submit your project",
        description: "Submit before the deadline",
        deadline: event.submissionDeadline,
        action: "submit-project",
        priority: "high"
      };
    }
    return {
      title: "Project submitted",
      description: "Keep working until the deadline",
      deadline: event.submissionDeadline,
      action: "edit-project",
      priority: "low"
    };
  }

  // After submission deadline
  if (now >= event.submissionDeadline && now < event.endDate) {
    return {
      title: "Prepare for judging",
      description: "Judges are reviewing projects",
      deadline: event.endDate,
      action: "view-project",
      priority: "medium"
    };
  }

  // After event
  return {
    title: "Event complete",
    description: "Check results and feedback",
    deadline: null,
    action: "view-results",
    priority: "low"
  };
}
```

---

## 📱 Mobile Responsive Considerations

**Mobile Layout Changes:**

1. **Hero:** Compact version, stack elements vertically
2. **Next Steps:** Full-width cards, larger tap targets
3. **Team Section:** Collapse member list to 3 + "View all" button
4. **Chat:** Bottom sheet overlay (not inline)
5. **Resources:** Fully collapsed by default
6. **Teams:** Show 2 recommendations, not 5

**Mobile-Specific Features:**
- Pull-to-refresh for latest updates
- Swipe gestures for navigation
- Bottom navigation bar (Hub / Team / Project / Resources)
- Push notifications for team messages

---

## 🚀 Implementation Phases

### Phase 1: Core Hub (Week 1) — 8 hours

**Deliverables:**
1. Hub page structure (3 hours)
2. Hero + Next Steps components (2 hours)
3. Team section (2 hours)
4. Project section (1 hour)

**No communication yet** — just display team info with Discord link

---

### Phase 2: Team Communication (Week 2) — 6 hours

**Deliverables:**
1. Simple text chat (WebSocket or Pusher) (4 hours)
2. Message storage in MongoDB (1 hour)
3. Real-time updates (1 hour)

**Or:** Discord/Slack integration (2 hours)

---

### Phase 3: Smart Recommendations (Week 2) — 3 hours

**Deliverables:**
1. Vector search for team matching (2 hours)
2. Match score algorithm (1 hour)

---

### Phase 4: Resources & Polish (Week 3) — 4 hours

**Deliverables:**
1. Schedule with live indicators (2 hours)
2. Prizes section (1 hour)
3. Developer resources (1 hour)

---

### Phase 5: Mobile Optimization (Week 3) — 4 hours

**Deliverables:**
1. Responsive layout (2 hours)
2. Mobile-specific interactions (2 hours)

---

## ✅ Success Metrics

**Engagement:**
- % of participants who visit hub vs other pages
- Time spent on hub
- Actions taken from hub (join team, submit project)

**Communication:**
- % of teams using built-in chat
- Messages sent per team
- Response rate

**Clarity:**
- % of participants who complete next step
- Support tickets reduced
- Survey: "I knew what to do next" (1-5 scale)

**Goal:** 80% of participants say "I knew what to do next" (4-5 rating)

---

## 🎯 Key Takeaways

**The Hub Should:**
1. ✅ Be the **first place** participants go
2. ✅ Answer **"What do I do next?"** immediately
3. ✅ Show **team status** prominently
4. ✅ Provide **quick access** to resources
5. ✅ Enable **communication** (built-in or external)
6. ✅ Track **progress** visually
7. ✅ Be **personalized** to participant state

**The Hub Should NOT:**
- ❌ Be generic (same view for everyone)
- ❌ Require clicking through multiple pages
- ❌ Hide critical information in menus
- ❌ Lack clear next steps

---

## 📊 Comparison: Before vs After

### Before (Current State)

**User Journey:**
1. Visit `/dashboard` → See list of events
2. Click event → Go to `/events/{id}` (public page)
3. Look for teams → Navigate to `/events/{id}/teams`
4. Browse teams → Click team → `/events/{id}/teams/{teamId}`
5. Join team → Back to... where? `/dashboard`?
6. Submit project → Navigate to `/events/{id}/projects/new`
7. Check team → Navigate to `/events/{id}/teams/{teamId}` again

**Problems:**
- 6+ pages to navigate
- No central hub
- Unclear next steps
- No communication
- Confusing flow

### After (With Hub)

**User Journey:**
1. Visit `/events/{id}/hub` → See everything
2. Join team → Click button → Stay on hub (updates)
3. Chat with team → Type message → See response
4. Submit project → Click button → Modal → Submit → Stay on hub
5. Check schedule → Expand resources → See live schedule
6. Everything in one place

**Benefits:**
- 1 page for everything
- Clear next steps
- Built-in communication
- Smooth flow
- Less confusion

---

## 🔗 Related Pages

**Hub replaces these for participants:**
- `/dashboard` → Hub is better for event-specific view
- `/events/{id}` → Hub has all event info + personalization
- `/events/{id}/teams` → Hub shows recommended teams

**Hub complements these:**
- `/events/{id}/teams/{teamId}` → Full team page (from hub link)
- `/events/{id}/projects/{id}` → Full project page (from hub link)
- `/profile` → User settings, not event-specific

**Navigation:**
```
Dashboard (list of all events)
  └─→ Event Hub (personalized view of ONE event)
        ├─→ Team Page (full team details)
        ├─→ Project Page (full project details)
        └─→ Resources (expanded view)
```

---

## 📝 Next Steps

1. **Review this design** with Michael
2. **Choose communication strategy** (Discord link vs built-in)
3. **Build Phase 1** (core hub structure) — 8 hours
4. **Test with 5 users** for feedback
5. **Iterate based on feedback**
6. **Roll out Phase 2-5** over 3 weeks

---

**Status:** 📋 Design Complete — Ready for Implementation  
**Owner:** Michael Lynn  
**Estimated Total Time:** 25 hours (across 3 weeks)  
**Expected Impact:** 🌟🌟🌟🌟🌟 (Developer joy +200%)

---

_This design was created by thinking step-by-step from a developer's perspective:_
_"What would I want to see? What would make me feel confident and informed?"_
