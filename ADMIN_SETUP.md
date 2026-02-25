# Admin Console Setup Guide

## Overview

The MongoHacks admin console provides a centralized interface for managing your hackathon platform. Admins can create events, manage users, assign judges, and oversee project submissions.

## Access Control

The admin console is protected by role-based access control (RBAC):

- **Admin Role:** Full access to all administrative features
- **Organizer Role:** Can manage events they organize
- **Judge Role:** Can view and score assigned projects
- **Participant Role:** Standard user access

## Creating Your First Admin User

### Step 1: Set Up Environment

Ensure your `.env.local` has the MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/mongohacks
# or your MongoDB Atlas connection string
```

### Step 2: Run the Admin Creation Script

```bash
npx tsx scripts/create-admin.ts
```

You'll be prompted to enter:
- Admin Name (e.g., "John Smith")
- Admin Email (e.g., "admin@mongohacks.com")
- Admin Password (create a strong password)

**Example:**
```
Creating Admin User
==================

Admin Name: John Smith
Admin Email: admin@mongohacks.com
Admin Password: ************

✅ Admin user created successfully!

Login Credentials:
Email: admin@mongohacks.com
Password: [hidden]

🔐 Keep these credentials secure!
```

### Step 3: Log In

1. Start the development server: `npm run dev`
2. Navigate to: http://localhost:3000/login
3. Enter your admin credentials
4. You'll be redirected to your dashboard
5. Access admin console: http://localhost:3000/admin

## Admin Console Features

### Dashboard (`/admin`)
- **Overview Stats:** Total events, users, projects, judges
- **Quick Actions:** Create event, manage users, view projects, assign judges
- **Role Breakdown:** Participants, judges, organizers, admins

### Events Management (`/admin/events`)
- **View All Events:** List of all hackathon events
- **Filter by Status:** Draft, Open, In Progress, Concluded
- **Actions:**
  - ✏️ Edit event details
  - 👁️ View event page
  - 🗑️ Delete event
  - ➕ Create new event

### Users Management (`/admin/users`)
- **View All Users:** Complete user directory
- **Filter by Role:** Admin, Organizer, Judge, Participant
- **Actions:**
  - ✏️ Edit user role
  - 🗑️ Delete user
  - 📧 View email

### Judges Management (`/admin/judges`)
- **View All Judges:** Users with judge role
- **Assignment Status:** Track judging assignments
- **Actions:**
  - 📝 Manage assignments
  - ➕ Promote user to judge
  - 📊 View scoring history

### Projects Management (`/admin/projects`)
- **View All Projects:** All submitted projects across events
- **Filter by Status:** Draft, Submitted, Under Review, Judged
- **Project Details:** Name, category, technologies, submission date
- **Bulk Actions:** Export, review, assign judges

### Settings (`/admin/settings`)
- Platform configuration (coming soon)
- Email notification settings
- Judging rubric templates
- System preferences

## Navigation

The admin console features a **persistent side navigation** with quick access to:
- 📊 Dashboard
- 📅 Events
- 👥 Users
- ⚖️ Judges
- 📁 Projects
- ⚙️ Settings

## Security Features

### Route Protection
- All `/admin/*` routes are protected by `requireAdmin()` middleware
- Non-admin users are redirected to login or dashboard
- JWT-based session management

### Role Validation
```typescript
// Server-side protection
await requireAdmin(); // Must be admin role

// Or check specific roles
await hasRole("admin", "organizer"); // Admin OR organizer
```

### Session Management
- Sessions stored in JWT tokens
- Role and user ID embedded in session
- Automatic session refresh

## Promoting Users to Admin

### Method 1: Using the Admin Script
```bash
npx tsx scripts/create-admin.ts
# Enter existing user's email
# Choose "y" to update role to admin
```

### Method 2: Direct Database Update
```bash
mongosh mongodb://localhost:27017/mongohacks

# Update user role
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 3: Via Admin Console (Future)
- Navigate to Users Management
- Click edit icon next to user
- Change role dropdown to "Admin"
- Save changes

## Role Hierarchy

```
Admin
├── Full platform access
├── Create/manage events
├── Manage all users
├── Assign judges
└── View all projects

Organizer
├── Create events
├── Manage own events
├── Invite participants
└── View event analytics

Judge
├── View assigned projects
├── Score projects
├── Provide feedback
└── Submit evaluations

Participant
├── Register for events
├── Join teams
├── Submit projects
└── View own submissions
```

## API Routes for Admins

### Delete Event
```bash
DELETE /api/admin/events/[eventId]
Authorization: JWT with admin role
```

### Update Event
```bash
PATCH /api/admin/events/[eventId]
Authorization: JWT with admin role
Body: { name, status, capacity, etc. }
```

More API routes coming soon for:
- User management
- Judge assignments
- Project moderation

## Customization

### Adding Admin Features

1. **Create New Page:**
   ```typescript
   // src/app/admin/new-feature/page.tsx
   import { requireAdmin } from "@/lib/admin-guard";

   export default async function NewFeature() {
     await requireAdmin();
     return <div>New Feature</div>;
   }
   ```

2. **Add to Navigation:**
   Update `src/app/admin/layout.tsx` navItems array

3. **Create API Route:**
   ```typescript
   // src/app/api/admin/new-feature/route.ts
   import { requireAdmin } from "@/lib/admin-guard";

   export async function POST(request: NextRequest) {
     await requireAdmin();
     // Your admin logic
   }
   ```

## Troubleshooting

### "Access Denied" Error
- **Problem:** User doesn't have admin role
- **Solution:** Run `create-admin.ts` script or update role in database

### Admin Pages Not Loading
- **Problem:** Auth session not configured
- **Solution:** Check `NEXTAUTH_SECRET` in `.env.local`

### "MongoDB Connection Failed"
- **Problem:** Database not accessible
- **Solution:** Verify `MONGODB_URI` in `.env.local`

## Next Steps

1. ✅ Create admin user with `npx tsx scripts/create-admin.ts`
2. ✅ Log in at `/login`
3. ✅ Access admin console at `/admin`
4. 📅 Create your first event
5. 👥 Invite users
6. ⚖️ Assign judges
7. 📊 Monitor platform activity

---

**Need Help?**
- Check the main [README.md](./README.md)
- Review [MongoDB Branding Guide](./MONGODB_BRANDING.md)
- See [spec.md](./spec.md) for full platform documentation
