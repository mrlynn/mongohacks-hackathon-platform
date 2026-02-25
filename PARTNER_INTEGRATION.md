# Partner & Prize Integration - MongoHacks Platform

## Overview

Complete partner management system integrated into the MongoHacks hackathon platform, following MongoDB brand guidelines and existing Material UI theme patterns.

## New Entities

### 1. Partner Model (`/src/lib/db/models/Partner.ts`)

**Purpose:** Track hackathon sponsors and partner organizations

**Key Features:**
- Company information (size, headquarters, industry)
- Contact management (multiple contacts, primary designation)
- Tier system (platinum, gold, silver, bronze, community)
- Status tracking (active, inactive, pending)
- Engagement metrics (events participated, prizes offered, engagement level)
- Social media links (LinkedIn, Twitter, GitHub, YouTube)
- Tags for categorization

**Schema Highlights:**
```typescript
interface IPartner {
  name: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "community";
  status: "active" | "inactive" | "pending";
  contacts: Contact[];
  engagement: {
    eventsParticipated: ObjectId[];
    prizesOffered: ObjectId[];
    engagementLevel: "low" | "medium" | "high";
  };
}
```

**Indexes:**
- Name, tier/status, industry
- Engagement level, contact email
- Tags (for filtering)

### 2. Prize Model (`/src/lib/db/models/Prize.ts`)

**Purpose:** Link partners to hackathon prizes and track winners

**Key Features:**
- Partner association (optional - some prizes may not be partner-sponsored)
- Category system (grand, track, sponsor, special, community)
- Monetary value tracking
- Winner tracking (project, team, awarded date)
- Display order management
- Active/inactive status

**Schema Highlights:**
```typescript
interface IPrize {
  eventId: ObjectId;
  partnerId?: ObjectId; // Optional partner link
  category: "grand" | "track" | "sponsor" | "special" | "community";
  value: string;
  monetaryValue: number;
  winners: Array<{
    projectId: ObjectId;
    teamId: ObjectId;
    awardedDate: Date;
  }>;
}
```

**Indexes:**
- Event + category
- Partner ID
- Display order
- Winner lookups

### 3. Event Model Updates

**Added:**
```typescript
partners: Types.ObjectId[]; // Array of partner references
```

This allows many-to-many relationships between events and partners.

## Validation Schemas (`/src/lib/db/schemas.ts`)

### createPartnerSchema
- Required: name, description, industry, contacts (at least 1)
- Optional: logo, website, company info, social links, tags
- Constraints: 
  - Name: 2-200 chars
  - Description: 10-2000 chars
  - Max 10 contacts
  - Max 20 tags

### createPrizeSchema
- Required: eventId, title, description, category
- Optional: partnerId, value, monetaryValue, criteria
- Constraints:
  - Title: 2-200 chars
  - Description: 10-2000 chars
  - Display order: non-negative integer

### awardPrizeSchema
- Links prizes to winning projects/teams
- Tracks award date automatically
- Optional notes field

## API Routes

### Partners API (`/api/partners`)

**GET /api/partners**
- Query params: status, tier, industry, page, limit
- Returns paginated partner list
- Public endpoint (no auth required for viewing)

**POST /api/partners**
- Create new partner
- Requires: Admin role
- Auto-initializes engagement tracking

**GET /api/partners/[id]**
- Fetch single partner with populated relationships
- Includes events participated and prizes offered

**PATCH /api/partners/[id]**
- Update partner details
- Requires: Admin role
- Validates all fields

**DELETE /api/partners/[id]**
- Remove partner
- Requires: Admin role
- Warning: Does not cascade delete prizes (intentional)

### Prizes API (`/api/prizes`)

**GET /api/prizes**
- Query params: eventId, partnerId, category, isActive
- Returns prizes sorted by display order and value
- Populates partner and event details

**POST /api/prizes**
- Create new prize
- Requires: Admin role
- Auto-updates partner engagement on creation
- Links to event and partner

## Admin UI

### Partners View (`/app/(app)/admin/partners/PartnersView.tsx`)

**Features:**
- Grid layout with Material UI cards
- Tier-based color coding (platinum → silver → bronze)
- Status badges (active, inactive, pending)
- Engagement level indicators
- Filter by tier and status
- Partner logo display
- Quick actions (edit, delete, view website/social)
- Contact information preview
- Engagement stats (events count, prizes count)
- Tags display

**Theme Integration:**
- Uses MongoDB brand colors from `/styles/theme.ts`
- Tier colors:
  - Platinum: Gray 400
  - Gold: Warning Yellow
  - Silver: Gray 300
  - Bronze: #CD7F32
  - Community: Spring Green
- Status colors:
  - Active: Forest Green
  - Inactive: Gray 400
  - Pending: Warning Yellow

**Dialog Features:**
- Create/edit modal
- Form validation
- Tier and status dropdowns
- Logo and website URL fields
- Industry categorization

### Integration Points

1. **Navigation:** Add to admin sidebar (AdminLayout.tsx)
   ```tsx
   <ListItem component={Link} href="/admin/partners">
     <ListItemIcon><Business /></ListItemIcon>
     <ListItemText>Partners</ListItemText>
   </ListItem>
   ```

2. **Event Creation:** Add partner selection to event form
   ```tsx
   <Autocomplete
     multiple
     options={partners}
     renderInput={(params) => <TextField {...params} label="Partners" />}
   />
   ```

3. **Prize Management:** Link prizes to partners in prize creation form

## Database Relationships

```
Event (1) ←→ (N) Partner    // Many-to-many via partners array
Partner (1) → (N) Prize     // One-to-many
Prize (N) → (1) Event       // Many-to-one
Prize (N) → (N) Project     // Many-to-many via winners array
```

## Usage Example

### Creating a Partner
```typescript
const partner = await PartnerModel.create({
  name: "MongoDB",
  description: "Modern document database platform",
  industry: "Database Technology",
  tier: "platinum",
  status: "active",
  website: "https://mongodb.com",
  contacts: [{
    name: "John Doe",
    email: "john@mongodb.com",
    role: "Developer Relations",
    isPrimary: true
  }],
  tags: ["database", "cloud", "ai"]
});
```

### Creating a Prize Linked to Partner
```typescript
const prize = await PrizeModel.create({
  eventId: event._id,
  partnerId: partner._id,
  title: "Best MongoDB Integration",
  description: "Best use of MongoDB Atlas in a hackathon project",
  category: "sponsor",
  value: "$5,000",
  monetaryValue: 5000,
  displayOrder: 2
});
```

### Awarding a Prize
```typescript
await PrizeModel.findByIdAndUpdate(prize._id, {
  $push: {
    winners: {
      projectId: winningProject._id,
      teamId: winningTeam._id,
      awardedDate: new Date()
    }
  }
});
```

## Next Steps

1. **Add to Admin Navigation** - Update AdminLayout.tsx sidebar
2. **Event Form Integration** - Add partner multi-select to event creation
3. **Prize Management UI** - Build admin interface for prizes
4. **Public Partner Display** - Show sponsors on landing pages
5. **Analytics Dashboard** - Partner engagement metrics and reports
6. **Email Notifications** - Alert partners when prizes are awarded

## Design Consistency

All components follow the established MongoDB brand theme:
- MongoDB Green (#00684A) for primary actions
- Spring Green (#00ED64) for highlights
- Slate Blue (#001E2B) for dark theme
- Typography: Euclid Circular A (sans), Source Serif Pro (headings)
- Card radius: 12px
- Button radius: 8px
- Consistent spacing using Material UI Grid

## File Structure

```
src/
├── lib/db/
│   ├── models/
│   │   ├── Partner.ts          [NEW]
│   │   ├── Prize.ts            [NEW]
│   │   └── Event.ts            [MODIFIED - added partners array]
│   └── schemas.ts              [MODIFIED - added partner/prize schemas]
├── app/
│   ├── api/
│   │   ├── partners/
│   │   │   ├── route.ts        [NEW]
│   │   │   └── [id]/route.ts   [NEW]
│   │   └── prizes/
│   │       └── route.ts        [NEW]
│   └── (app)/admin/
│       └── partners/
│           ├── page.tsx        [NEW]
│           └── PartnersView.tsx [NEW]
└── styles/
    └── theme.ts                [EXISTING - followed for consistency]
```

## Testing Checklist

- [ ] Create partner via API
- [ ] Update partner details
- [ ] Delete partner
- [ ] Create prize linked to partner
- [ ] Award prize to project
- [ ] Filter partners by tier/status
- [ ] Partner engagement metrics update on prize creation
- [ ] Event-partner association
- [ ] Admin UI displays all partner details
- [ ] Theme colors match MongoDB brand
