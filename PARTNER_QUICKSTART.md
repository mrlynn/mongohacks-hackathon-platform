# Partner Integration - Quick Start Guide

## What Was Built

Complete partner management system for MongoHacks with:
- ✅ Database models (Partner, Prize)
- ✅ REST API endpoints
- ✅ Admin UI interface
- ✅ Navigation integration
- ✅ Seed data with 6 sample partners and 7 prizes
- ✅ Test script

## Quick Start

### 1. Run Database Seed

```bash
cd /Users/michael.lynn/code/mongohacks/hackathon-platform
npm run seed:clear
```

This will create:
- **6 Partners** (MongoDB, Vercel, GitHub, JetBrains, Sticker Mule, Local Tech Community)
- **7 Prizes** linked to partners across 2 events
- Partner-event relationships automatically configured

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Partner Management

Navigate to: **http://localhost:3000/admin/partners**

Login with admin credentials:
- Email: `admin@mongohacks.com`
- Password: `password123`

### 4. Test API Endpoints

```bash
# Make the test script executable (one time)
chmod +x test-partner-api.sh

# Run tests
./test-partner-api.sh
```

## Partner Tiers

The system supports 5 tier levels with distinct visual branding:

| Tier | Color | Use Case |
|------|-------|----------|
| **Platinum** | Gray (#888) | Top-tier sponsors |
| **Gold** | Yellow (#FFC010) | Major sponsors |
| **Silver** | Light Gray | Mid-tier sponsors |
| **Bronze** | Bronze (#CD7F32) | Supporting sponsors |
| **Community** | Spring Green (#00ED64) | Community partners |

## API Endpoints

### Partners

```bash
# List all partners
GET /api/partners

# Filter by tier
GET /api/partners?tier=platinum

# Filter by status
GET /api/partners?status=active

# Get single partner (with populated relationships)
GET /api/partners/{id}

# Create partner (admin only)
POST /api/partners

# Update partner (admin only)
PATCH /api/partners/{id}

# Delete partner (admin only)
DELETE /api/partners/{id}
```

### Prizes

```bash
# List all prizes
GET /api/prizes

# Filter by event
GET /api/prizes?eventId={eventId}

# Filter by partner
GET /api/prizes?partnerId={partnerId}

# Create prize (admin only)
POST /api/prizes
```

## Sample Partners (from seed)

1. **MongoDB Inc.** (Platinum)
   - Industry: Database Technology
   - Engagement: High
   - Prizes: 2 across events

2. **Vercel** (Gold)
   - Industry: Cloud Hosting
   - Engagement: Medium
   - Prizes: 1

3. **GitHub** (Gold)
   - Industry: Developer Tools
   - Engagement: High
   - Prizes: 1

4. **JetBrains** (Silver)
   - Industry: Developer Tools
   - Engagement: Medium
   - Prizes: 1

5. **Sticker Mule** (Bronze)
   - Industry: Printing & Merchandise
   - Engagement: Low
   - Prizes: 0 (swag partner)

6. **Local Tech Community** (Community)
   - Industry: Community
   - Engagement: Medium
   - Prizes: 0 (grassroots support)

## Admin UI Features

### Partner Cards
- Company logo display
- Tier and status badges
- Engagement level indicator
- Event and prize counts
- Contact information preview
- Quick actions (edit, delete, external links)

### Filters
- Filter by tier (all, platinum, gold, silver, bronze, community)
- Filter by status (all, active, inactive, pending)

### Create/Edit Dialog
- Full form validation
- Required fields: name, description, industry, at least 1 contact
- Optional fields: logo, website, company info, social links, tags
- Tier and status dropdowns

## Data Model

### Partner Schema
```typescript
{
  name: string;
  description: string;
  logo?: string;
  website?: string;
  industry: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "community";
  status: "active" | "inactive" | "pending";
  companyInfo: {
    size?: string;
    headquarters?: string;
    foundedYear?: number;
    employeeCount?: string;
  };
  contacts: Array<{
    name: string;
    email: string;
    phone?: string;
    role: string;
    isPrimary: boolean;
  }>;
  engagement: {
    eventsParticipated: ObjectId[];
    prizesOffered: ObjectId[];
    engagementLevel?: "low" | "medium" | "high";
    lastEngagementDate?: Date;
  };
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
  };
  tags: string[];
}
```

### Prize Schema
```typescript
{
  eventId: ObjectId;
  partnerId?: ObjectId; // Optional - some prizes not partner-sponsored
  title: string;
  description: string;
  category: "grand" | "track" | "sponsor" | "special" | "community";
  value?: string;
  monetaryValue?: number;
  eligibility?: string;
  criteria?: string[];
  winners: Array<{
    projectId: ObjectId;
    teamId: ObjectId;
    awardedDate: Date;
  }>;
  displayOrder: number;
  isActive: boolean;
}
```

## Next Steps

### 1. Prize Management UI (suggested)
Create admin interface to manage prizes at `/admin/prizes`:
- List prizes by event
- Create/edit prize forms
- Link prizes to partners
- Award prizes to projects
- Display prize winners

### 2. Public Partner Display
Show sponsors on landing pages:
- Partner logos grid
- Tier-based display
- Link to partner websites
- "Become a Partner" CTA

### 3. Event Form Integration
Add partner selection to event creation:
- Multi-select partner picker
- Display selected partners with tier badges
- Auto-populate event landing page sponsors section

### 4. Analytics Dashboard
Track partner engagement:
- Events sponsored over time
- Total prize values by partner
- Partner ROI metrics
- Engagement level trends

### 5. Email Notifications
Automated partner communications:
- Prize awarded notifications
- Event participation confirmations
- Engagement reports (monthly/quarterly)

## File Locations

```
src/
├── lib/db/
│   ├── models/
│   │   ├── Partner.ts           ← Partner model
│   │   └── Prize.ts             ← Prize model
│   └── schemas.ts               ← Validation schemas (updated)
├── app/
│   ├── api/
│   │   ├── partners/
│   │   │   ├── route.ts         ← Partners CRUD
│   │   │   └── [id]/route.ts    ← Single partner ops
│   │   └── prizes/
│   │       └── route.ts         ← Prizes CRUD
│   └── (app)/admin/
│       └── partners/
│           ├── page.tsx         ← Partners page
│           └── PartnersView.tsx ← Main UI component
scripts/
└── seed.ts                      ← Updated with partner/prize seeding
```

## Troubleshooting

### Partners Not Showing in Admin
1. Check database seed ran successfully: `npm run seed:clear`
2. Verify MongoDB connection in `.env.local`
3. Check browser console for API errors

### Authentication Errors
1. Ensure you're logged in as admin
2. Check session cookie is present
3. Try logging out and back in

### API Endpoint 404s
1. Verify dev server is running: `npm run dev`
2. Check Next.js route structure matches files
3. Clear `.next` cache and rebuild

## Support

For detailed implementation docs, see:
- **PARTNER_INTEGRATION.md** - Complete technical documentation
- **test-partner-api.sh** - API endpoint test suite
- MongoDB brand theme reference: `src/styles/theme.ts`

## Testing Checklist

- [x] Partners navigation link in admin sidebar
- [ ] Create new partner via UI
- [ ] Edit existing partner
- [ ] Delete partner
- [ ] Filter partners by tier
- [ ] Filter partners by status
- [ ] View partner detail page
- [ ] Create prize linked to partner
- [ ] Verify partner engagement metrics update
- [ ] Test API endpoints with test script
- [ ] Verify theme colors match MongoDB brand
