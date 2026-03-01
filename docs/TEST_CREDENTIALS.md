# Test Credentials & RBAC User Journeys

**MongoHacks Hackathon Platform - Test Account Reference**  
**Last Updated:** March 1, 2026

---

## Table of Contents

1. [Role Hierarchy](#role-hierarchy)
2. [Test Credentials](#test-credentials)
3. [Access Matrix](#access-matrix)
4. [User Journeys by Role](#user-journeys-by-role)
5. [Creating Test Accounts](#creating-test-accounts)
6. [Testing Checklist](#testing-checklist)

---

## Role Hierarchy

The platform implements 8 distinct user roles with hierarchical permissions:

| Role | Level | Description | Access Groups |
|------|-------|-------------|---------------|
| **super_admin** | 1 (Highest) | Platform owner, unrestricted access | ADMIN, ADMIN_PANEL, EVENT_MANAGEMENT, PARTNER_PORTAL |
| **admin** | 2 | Full administrative access (except platform settings) | ADMIN, ADMIN_PANEL, EVENT_MANAGEMENT, PARTNER_PORTAL |
| **organizer** | 3 | Event and team management | ADMIN_PANEL, EVENT_MANAGEMENT |
| **marketer** | 4 | Marketing and analytics access | ADMIN_PANEL |
| **partner** | 5 | Sponsor/partner with dedicated portal | PARTNER_PORTAL |
| **judge** | 6 | Judging and evaluation features | - |
| **mentor** | 7 | Mentorship features | - |
| **participant** | 8 | Standard hackathon attendee | - |

---

## Test Credentials

### 1. Super Admin
```
Email:    super@mongohacks.test
Password: SuperAdmin123!
Role:     super_admin
```

**Access:**
- ✅ Full platform administration
- ✅ User management (ban/delete, including other admins)
- ✅ Global settings (templates, email, registration forms)
- ✅ All events, teams, projects, partners
- ✅ Analytics and reports
- ✅ Partner portal (read-only as admin)

**Test Journey:**
1. Login at `/login`
2. Access admin panel at `/admin`
3. Navigate to `/admin/settings` → manage templates, email templates, forms
4. Test user moderation: `/admin/users` → ban/delete users
5. View all events: `/admin/events`
6. Impersonate other users (if implemented)

---

### 2. Admin
```
Email:    admin@mongohacks.test
Password: Admin123!
Role:     admin
```

**Access:**
- ✅ Full admin panel access
- ✅ User management (ban/delete non-admins)
- ✅ Event, team, project management
- ✅ Analytics and feedback
- ✅ Partner portal (read-only as admin)
- ❌ Platform-level settings (super_admin only)

**Test Journey:**
1. Login at `/login`
2. Access admin panel at `/admin`
3. Manage events: `/admin/events` → create, edit, view registrations
4. Review teams: `/admin/teams`
5. View analytics: `/admin/analytics`
6. Try to access `/admin/settings/templates` → should redirect (super_admin only)

---

### 3. Organizer
```
Email:    organizer@mongohacks.test
Password: Organizer123!
Role:     organizer
```

**Access:**
- ✅ Admin panel (limited sidebar)
- ✅ Event management (create, edit events)
- ✅ Team and project management
- ✅ Participant registrations
- ✅ Judging configuration
- ❌ User moderation
- ❌ Global settings

**Test Journey:**
1. Login at `/login`
2. Access admin panel at `/admin`
3. Create event: `/admin/events/new`
4. Manage event: `/admin/events/[id]/edit`
5. Review registrations: `/admin/events/[id]/registrations`
6. Configure judging: `/admin/events/[id]/judging`
7. Try to access `/admin/users` → should redirect or show limited view

---

### 4. Marketer
```
Email:    marketer@mongohacks.test
Password: Marketer123!
Role:     marketer
```

**Access:**
- ✅ Admin panel (marketing-focused sidebar)
- ✅ Analytics dashboard
- ✅ Event landing pages (view/edit)
- ❌ Event creation/management
- ❌ User moderation
- ❌ Team/project management

**Test Journey:**
1. Login at `/login`
2. Access admin panel at `/admin`
3. View analytics: `/admin/analytics`
4. Edit landing pages: `/admin/events/[id]/landing-page`
5. Try to create event: `/admin/events/new` → should redirect
6. Try to access `/admin/teams` → should redirect

---

### 5. Partner (Sponsor)
```
Email:    partner@mongohacks.test
Password: Partner123!
Role:     partner
```

**Access:**
- ✅ Partner portal at `/partner`
- ✅ View associated events
- ✅ Manage prizes
- ✅ View analytics (partner-specific)
- ✅ Provide feedback
- ❌ Admin panel access
- ❌ Create events

**Test Journey:**
1. Login at `/login`
2. Access partner portal: `/partner`
3. View events: `/partner/events`
4. Manage prizes: `/partner/prizes`
5. View analytics: `/partner/analytics`
6. Provide feedback: `/partner/feedback`
7. Try to access `/admin` → should redirect to `/partner`

---

### 6. Judge
```
Email:    judge@mongohacks.test
Password: Judge123!
Role:     judge
```

**Access:**
- ✅ Dashboard with judging assignments
- ✅ Judging interface at `/judging`
- ✅ View assigned projects
- ✅ Submit scores and feedback
- ❌ Admin panel
- ❌ Create/manage events

**Test Journey:**
1. Login at `/login`
2. Navigate to dashboard: `/dashboard`
3. Access judging: `/judging`
4. View assigned projects
5. Submit scores and feedback
6. Try to access `/admin` → should redirect to `/dashboard`

---

### 7. Mentor
```
Email:    mentor@mongohacks.test
Password: Mentor123!
Role:     mentor
```

**Access:**
- ✅ Dashboard with mentor features
- ✅ View events and teams
- ✅ Offer help/guidance to teams
- ❌ Admin panel
- ❌ Judging features

**Test Journey:**
1. Login at `/login`
2. Navigate to dashboard: `/dashboard`
3. View events: `/events`
4. Browse teams (if mentor-assigned)
5. Try to access `/admin` → should redirect to `/dashboard`
6. Try to access `/judging` → should show "no access"

---

### 8. Participant
```
Email:    participant@mongohacks.test
Password: Participant123!
Role:     participant
```

**Access:**
- ✅ Dashboard
- ✅ Event registration
- ✅ Team creation/joining
- ✅ Project submission
- ✅ AI project suggestions
- ✅ Atlas cluster provisioning (if event enabled)
- ❌ Admin panel
- ❌ Judging or partner features

**Test Journey:**
1. Login at `/login`
2. Navigate to dashboard: `/dashboard`
3. Browse events: `/events`
4. Register for event: `/events/[slug]/register`
5. Create team: `/events/[eventId]/teams`
6. Get project ideas: `/project-suggestions`
7. Submit project: `/events/[eventId]/projects`
8. Provision Atlas cluster (if enabled): `/teams/[teamId]/atlas`
9. Try to access `/admin` → should redirect to `/dashboard`

---

## Access Matrix

| Feature | super_admin | admin | organizer | marketer | partner | judge | mentor | participant |
|---------|-------------|-------|-----------|----------|---------|-------|--------|-------------|
| **Admin Panel** | ✅ Full | ✅ Full | ✅ Limited | ✅ Limited | ❌ | ❌ | ❌ | ❌ |
| **User Management** | ✅ All | ✅ Non-admins | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create Events** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Edit Events** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Landing Pages** | ✅ | ✅ | ✅ | ✅ View/Edit | ❌ | ❌ | ❌ | ❌ |
| **Registrations** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Teams** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ Create/Join |
| **Projects** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ Submit |
| **Judging Setup** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Judging** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Analytics** | ✅ Full | ✅ Full | ✅ Events | ✅ Full | ✅ Partner | ❌ | ❌ | ❌ |
| **Partner Portal** | ✅ View | ✅ View | ❌ | ❌ | ✅ Full | ❌ | ❌ | ❌ |
| **Prizes** | ✅ | ✅ | ✅ | ❌ | ✅ Manage | ❌ | ❌ | ❌ |
| **Templates** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Email Templates** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Registration Forms** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Atlas Provisioning** | ✅ Admin | ✅ Admin | ✅ Admin | ❌ | ❌ | ❌ | ❌ | ✅ Team |

---

## Creating Test Accounts

### Option 1: Seed Script (Recommended)

Create `scripts/seed-test-users.ts`:

```typescript
import { connectToDatabase } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';

async function seedTestUsers() {
  await connectToDatabase();

  const testUsers = [
    { email: 'super@mongohacks.test', name: 'Super Admin', role: 'super_admin', password: 'SuperAdmin123!' },
    { email: 'admin@mongohacks.test', name: 'Admin User', role: 'admin', password: 'Admin123!' },
    { email: 'organizer@mongohacks.test', name: 'Event Organizer', role: 'organizer', password: 'Organizer123!' },
    { email: 'marketer@mongohacks.test', name: 'Marketing Manager', role: 'marketer', password: 'Marketer123!' },
    { email: 'partner@mongohacks.test', name: 'Sponsor Partner', role: 'partner', password: 'Partner123!' },
    { email: 'judge@mongohacks.test', name: 'Event Judge', role: 'judge', password: 'Judge123!' },
    { email: 'mentor@mongohacks.test', name: 'Hackathon Mentor', role: 'mentor', password: 'Mentor123!' },
    { email: 'participant@mongohacks.test', name: 'Participant User', role: 'participant', password: 'Participant123!' }
  ];

  for (const user of testUsers) {
    const existing = await UserModel.findOne({ email: user.email });
    if (existing) {
      console.log(`⏭️  Skipping ${user.email} (already exists)`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 10);
    
    await UserModel.create({
      email: user.email,
      name: user.name,
      role: user.role,
      passwordHash,
      emailVerified: true,
      needsPasswordSetup: false,
      notificationPreferences: {
        emailNotifications: true,
        eventReminders: true,
        teamInvites: true,
        projectUpdates: true,
        newsletter: false
      }
    });

    console.log(`✅ Created ${user.role}: ${user.email}`);
  }

  console.log('🎉 Test users seeded successfully!');
  process.exit(0);
}

seedTestUsers().catch(console.error);
```

**Run with:**
```bash
npx tsx scripts/seed-test-users.ts
```

---

### Option 2: MongoDB Direct Insert

```javascript
// MongoDB shell or Compass
use mongohacks;

const bcrypt = require('bcryptjs');

const users = [
  { email: 'super@mongohacks.test', name: 'Super Admin', role: 'super_admin', password: 'SuperAdmin123!' },
  { email: 'admin@mongohacks.test', name: 'Admin User', role: 'admin', password: 'Admin123!' },
  { email: 'organizer@mongohacks.test', name: 'Event Organizer', role: 'organizer', password: 'Organizer123!' },
  { email: 'marketer@mongohacks.test', name: 'Marketing Manager', role: 'marketer', password: 'Marketer123!' },
  { email: 'partner@mongohacks.test', name: 'Sponsor Partner', role: 'partner', password: 'Partner123!' },
  { email: 'judge@mongohacks.test', name: 'Event Judge', role: 'judge', password: 'Judge123!' },
  { email: 'mentor@mongohacks.test', name: 'Hackathon Mentor', role: 'mentor', password: 'Mentor123!' },
  { email: 'participant@mongohacks.test', name: 'Participant User', role: 'participant', password: 'Participant123!' }
];

users.forEach(user => {
  const passwordHash = bcrypt.hashSync(user.password, 10);
  
  db.users.insertOne({
    email: user.email,
    name: user.name,
    role: user.role,
    passwordHash: passwordHash,
    emailVerified: true,
    needsPasswordSetup: false,
    notificationPreferences: {
      emailNotifications: true,
      eventReminders: true,
      teamInvites: true,
      projectUpdates: true,
      newsletter: false
    },
    banned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

print('✅ Test accounts created!');
```

---

## Testing Checklist

### Authentication & Authorization

- [ ] **Login/Logout**
  - [ ] Each role can login with correct credentials
  - [ ] Incorrect password shows error
  - [ ] Banned users cannot login
  - [ ] Deleted users cannot login

- [ ] **Email Verification**
  - [ ] Unverified users see banner
  - [ ] Unverified users blocked from critical actions
  - [ ] Resend verification works

---

### Role-Based Access Control

- [ ] **Super Admin**
  - [ ] Can access `/admin/settings/templates`
  - [ ] Can ban/delete any user
  - [ ] Can modify all events

- [ ] **Admin**
  - [ ] Can access `/admin` but NOT `/admin/settings/templates`
  - [ ] Can ban/delete participants but NOT admins
  - [ ] Can modify all events

- [ ] **Organizer**
  - [ ] Can access `/admin` with limited sidebar
  - [ ] Can create and manage events
  - [ ] CANNOT access `/admin/users`

- [ ] **Marketer**
  - [ ] Can access `/admin/analytics`
  - [ ] Can edit landing pages
  - [ ] CANNOT create events

- [ ] **Partner**
  - [ ] Redirects from `/admin` to `/partner`
  - [ ] Can manage prizes
  - [ ] Can view partner analytics

- [ ] **Judge**
  - [ ] Can access `/judging`
  - [ ] CANNOT access `/admin`

- [ ] **Mentor**
  - [ ] Can view events
  - [ ] CANNOT access `/admin` or `/judging`

- [ ] **Participant**
  - [ ] Can register for events
  - [ ] Can create/join teams
  - [ ] Can submit projects
  - [ ] CANNOT access `/admin`, `/partner`, or `/judging`

---

### Security Testing

- [ ] **Privilege Escalation**
  - [ ] Participant cannot access `/admin` by URL
  - [ ] Judge cannot access `/admin/users`
  - [ ] Admin cannot access `/admin/settings/templates`

- [ ] **Data Isolation**
  - [ ] Partner only sees their own prizes
  - [ ] Judge only sees assigned projects
  - [ ] Participant only sees their teams

- [ ] **Action Authorization**
  - [ ] Non-team-leader cannot delete team
  - [ ] Non-admin cannot ban users
  - [ ] Non-organizer cannot create events

---

## Cleanup

After testing, remove test accounts:

```javascript
db.users.deleteMany({ email: { $regex: /@mongohacks\.test$/ } });
```

---

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

---

**Last Updated:** March 1, 2026 5:40 AM EST  
**Contact:** Platform Team (#engineering)
