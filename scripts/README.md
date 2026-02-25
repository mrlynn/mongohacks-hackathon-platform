# Database Seed Script

## Overview

The seed script populates your MongoDB database with realistic test data for development and testing purposes.

## Quick Start

```bash
# Add test data (keeps existing data)
npm run seed

# Clear existing data and add fresh test data
npm run seed:clear
```

## What Gets Created

### 👥 Users (11 total)
- **1 Admin**: Full platform access
- **2 Judges**: Can score projects
- **8 Participants**: Regular users

**Test Credentials:**
- Admin: `admin@mongohacks.com` / `password123`
- Judge: `sarah.judge@mongohacks.com` / `password123`
- Judge: `mike.judge@mongohacks.com` / `password123`
- User: `alice@example.com` / `password123`
- _(All passwords are: `password123`)_

### 🎯 Participant Profiles (8)
- Bio, skills, interests, experience levels
- Diverse skill sets (frontend, backend, ML, mobile, security, blockchain, game dev)

### 📅 Events (4)
1. **MongoDB Spring Hackathon 2026** (Open) - NYC, in-person
2. **AI Challenge 2026** (Open) - Virtual
3. **Web3 Summit Hackathon** (Draft) - San Francisco
4. **MongoDB Winter Hackathon 2025** (Concluded) - Austin

**Event Features:**
- Different statuses (open, draft, concluded)
- Published landing pages with custom slugs
- Geographic coordinates for map display
- Prizes, schedules, sponsors

### 👥 Teams (4)
1. **Code Crushers** (3 members) - Spring Event, not recruiting
2. **Data Wizards** (1 member) - Spring Event, looking for members
3. **AI Innovators** (2 members) - AI Event
4. **Blockchain Builders** (2 members) - Winter Event (concluded)

### 💻 Projects (3)
1. **Smart Task Manager** - AI-powered productivity app (submitted)
2. **AI Health Assistant** - ML-driven health tracking (submitted)
3. **Decentralized Marketplace** - Blockchain marketplace (judged)

**Project Details:**
- GitHub repos, demo URLs, documentation
- Technologies, innovations, descriptions
- Team associations

### ⭐ Scores (2)
- Scores for the concluded Winter Hackathon project
- From both judges
- 4 criteria each (innovation, technical, impact, presentation)

## Data Relationships

```
Users
├── Admin (organizes events)
├── Judges (score projects)
└── Participants
    ├── Profiles (bio, skills, interests)
    ├── Event Registrations
    ├── Team Memberships
    └── Project Contributions

Events
├── Organizers (Admin)
├── Participants (registered users)
├── Teams
└── Projects
    └── Scores (from Judges)
```

## Use Cases

### 1. Development
Quickly populate your local database with realistic data:
```bash
npm run seed
```

### 2. Testing
Clear and reseed for clean test runs:
```bash
npm run seed:clear
```

### 3. Demo
Showcase all platform features with pre-populated data.

### 4. CI/CD
Integrate into test pipelines:
```bash
# In CI workflow
npm run seed:clear  # Fresh start
npm test            # Run tests
```

## Scenarios Covered

**User Journeys:**
- ✅ Admin managing events and viewing results
- ✅ Judge scoring projects
- ✅ Participant registering for events
- ✅ Team formation (complete & recruiting)
- ✅ Project submission
- ✅ Judging and results

**Event States:**
- ✅ Open events (accepting registrations)
- ✅ Draft events (not published yet)
- ✅ Concluded events (with results)

**Data Variety:**
- ✅ In-person and virtual events
- ✅ Different locations (NYC, SF, Austin, Online)
- ✅ Various project categories
- ✅ Diverse tech stacks
- ✅ Different experience levels

## Script Details

**Location:** `scripts/seed.ts`

**Dependencies:**
- tsx (TypeScript execution)
- bcryptjs (password hashing)
- All app models

**Behavior:**
- Default: Adds data without clearing
- `--clear` flag: Wipes database first
- Idempotent: Safe to run multiple times (with `--clear`)
- Exit codes: 0 (success), 1 (error)

## Testing the Seed Data

After seeding, you can:

1. **Login as Admin:**
   ```
   Email: admin@mongohacks.com
   Password: password123
   ```

2. **View Admin Dashboard:**
   - Events: See all 4 events
   - Users: See all 11 users
   - Teams: See 4 teams
   - Projects: See 3 projects
   - Judges: See 2 judges

3. **Test Judging Flow:**
   - Login as judge (`sarah.judge@mongohacks.com`)
   - Go to `/judging/{eventId}` (use concluded event ID)
   - See projects ready for scoring

4. **Test User Dashboard:**
   - Login as participant (`alice@example.com`)
   - View dashboard with registered events
   - See team membership status

5. **Test Results Page:**
   - Login as admin
   - View results for Winter Hackathon 2025
   - See average scores and rankings

## Environment Requirements

**MongoDB Connection:**
Ensure `.env.local` has:
```bash
MONGODB_URI="mongodb+srv://..."
```

**Next.js Config:**
```bash
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Troubleshooting

**Connection Error:**
```bash
# Check MongoDB connection string
echo $MONGODB_URI
# Or check .env.local file
```

**Duplicate Key Error:**
Run with `--clear` to wipe existing data:
```bash
npm run seed:clear
```

**TypeScript Errors:**
Ensure all dependencies are installed:
```bash
npm install
```

**Can't Login:**
Password is always `password123` for all seeded users.

## Extending the Script

To add more data, edit `scripts/seed.ts`:

```typescript
// Add more users
const newUsers = await UserModel.insertMany([
  {
    name: "New User",
    email: "newuser@example.com",
    passwordHash,
    role: "participant",
  },
]);

// Add more events, teams, projects, etc.
```

## Best Practices

**Development:**
- Run `npm run seed` once when starting a project
- Use `npm run seed:clear` when you need fresh data

**Testing:**
- Always use `--clear` in test environments
- Seed before running E2E tests

**CI/CD:**
- Include seeding in test setup
- Use environment variables for connection strings

**Demo:**
- Seed with realistic, impressive data
- Keep data updated with platform features

---

**Last Updated:** 2026-02-25  
**Version:** 1.0  
**Status:** ✅ Production-ready
