# Landing Page Navigation - Fixed

## Problem
Users could view events but there was no clear path from the event listing or detail pages to the public landing pages where they can actually register.

## Solution
Added prominent "Register" / "View Event Landing Page" buttons that link to the landing page when available.

---

## How Landing Pages Work

### URL Structure
```
Event Detail Page:    /events/{eventId}         (internal, authenticated)
Landing Page:         /{slug}                   (public, no auth required)
```

**Example:**
- Event ID: `699f123abc456def789`
- Landing Page Slug: `mongodb-spring-2026`
- Landing Page URL: `https://mongohacks.com/mongodb-spring-2026`

### Event Model Field
```typescript
landingPage: {
  slug: "mongodb-spring-2026",         // Unique URL slug
  published: true,                      // Is it live?
  template: "modern",                   // Which template to use
  customContent: { ... }                // Hero, prizes, schedule, etc.
}
```

---

## Changes Made

### 1. Events List Page (`/events`)

**Before:**
- Only "View Details" button
- No way to reach landing page

**After:**
- "Details" button (internal event page)
- **"Register" button** (landing page) - shows only if:
  - `event.landingPage.slug` exists
  - `event.landingPage.published === true`

**Visual:**
```
┌─────────────────────────────┐
│ MongoDB Spring Hackathon    │
│ Build the future...         │
│                             │
│ 📅 Mar 20, 2026             │
│ 📍 MongoDB HQ, NYC          │
│                             │
│ [Details]    [Register →]   │ ← New!
└─────────────────────────────┘
```

### 2. Event Detail Page (`/events/[eventId]`)

**Before:**
- Only "Register Now" button (went to `/events/{id}/register`)
- No landing page link

**After:**
- **"View Event Landing Page" button** (primary, green gradient)
- "Register Now" button (secondary, outlined)

**Visual:**
```
MongoDB Spring Hackathon 2026

[View Event Landing Page]  [Register Now]
     ↓ /{slug}              ↓ /events/{id}/register
```

---

## User Flow

### Scenario 1: Discovery via Events List
```
User visits /events
   ↓
Sees event cards with "Register" button
   ↓
Clicks "Register"
   ↓
Goes to /{slug} (public landing page)
   ↓
Beautiful landing page with registration form
```

### Scenario 2: Deep Link to Event Detail
```
User gets link to /events/{eventId}
   ↓
Sees event details page
   ↓
Clicks "View Event Landing Page"
   ↓
Goes to /{slug} (public landing page)
```

### Scenario 3: Direct Landing Page Access
```
User receives marketing link: mongohacks.com/mongodb-spring-2026
   ↓
Lands directly on landing page (no auth needed)
   ↓
Registers immediately
```

---

## Button Styling

### Landing Page Buttons (Primary CTA)
```tsx
sx={{
  background: "linear-gradient(135deg, #00ED64 0%, #00684A 100%)",
  "&:hover": {
    background: "linear-gradient(135deg, #00684A 0%, #023430 100%)",
  },
}}
```

**Colors:**
- MongoDB Spring Green (#00ED64) → Forest Green (#00684A)
- On hover: Forest Green → Evergreen (#023430)

### Register Now (Secondary CTA)
```tsx
variant="outlined"
```

---

## Conditional Rendering

Buttons only show when landing page is configured:

```tsx
{event.landingPage?.slug && event.landingPage.published && (
  <Button href={`/${event.landingPage.slug}`}>
    Register
  </Button>
)}
```

**Checks:**
1. ✅ Does event have a landing page slug?
2. ✅ Is the landing page published? (not draft)

**If either is false:** Button doesn't show (event might not be ready for public registration yet)

---

## Testing Checklist

### Events List Page (`/events`)
- [ ] Visit `/events` while logged in
- [ ] See events with published landing pages show "Register" button
- [ ] Click "Register" → taken to `/{slug}` landing page
- [ ] Events without landing pages show only "Details" button

### Event Detail Page (`/events/[eventId]`)
- [ ] Visit `/events/{eventId}` for an event with published landing page
- [ ] See green "View Event Landing Page" button
- [ ] Click it → taken to `/{slug}` landing page
- [ ] If event has no landing page → button doesn't show

### Landing Page (`/{slug}`)
- [ ] Visit `/{slug}` directly (no auth needed)
- [ ] See beautiful landing page
- [ ] Registration form works
- [ ] Can register for event

---

## Next Steps (Optional Enhancements)

### 1. Badge on Events List
Show "🌐 Public Landing Page Available" badge on event cards that have published landing pages.

### 2. Preview Mode Link (Admin)
In admin event management, add "Preview Landing Page" button that goes to `/{slug}?preview=true`

### 3. QR Code Generator
Generate QR codes linking to landing pages for physical marketing materials.

### 4. Analytics
Track clicks from event detail → landing page to measure conversion funnel.

### 5. Share Button
Add social share buttons (Twitter, LinkedIn) to event detail page that link to landing page.

---

## Files Modified

1. `/src/app/(app)/events/page.tsx`
   - Added `landingPage` to Event interface
   - Fixed Grid2 → Grid (item xs={12} sm={6} md={4})
   - Added "Register" button to CardActions

2. `/src/app/(app)/events/[eventId]/page.tsx`
   - Added `landingPage` to Event interface
   - Added "View Event Landing Page" primary button
   - Made "Register Now" secondary (outlined)

---

## Example Events with Landing Pages

From seed data:

| Event Name | Slug | Landing Page URL |
|------------|------|------------------|
| MongoDB Spring Hackathon 2026 | `mongodb-spring-2026` | `/mongodb-spring-2026` |
| AI Challenge 2026 | `ai-challenge-2026` | `/ai-challenge-2026` |

**Try it:**
1. Run `npm run seed:clear` to get fresh data
2. Start server: `npm run dev`
3. Visit: `http://localhost:3000/events`
4. Click "Register" on MongoDB Spring Hackathon
5. Should take you to: `http://localhost:3000/mongodb-spring-2026`

---

## Landing Page System Overview

### Admin Flow
```
Admin creates event
   ↓
Admin configures landing page (/admin/events/{id}/landing-page)
   - Choose template (modern, bold, tech, etc.)
   - Set slug (URL-friendly name)
   - Customize content (hero, prizes, schedule)
   - Mark as "published"
   ↓
Landing page goes live at /{slug}
```

### Available Templates
- **Modern** - Clean, minimalist design
- **Bold** - Eye-catching, high contrast
- **Tech** - Developer-focused, code-themed
- **Leafy** - MongoDB brand-heavy (green accents)
- **Atlas** - Cloud/database themed
- **Community** - Grassroots, inclusive feel

### Template Selection
Set in `event.landingPage.template` field. Dynamic routing renders the correct template at `/{slug}`.

---

## Summary

✅ **Fixed:** Navigation from events list/detail to landing pages
✅ **Added:** Prominent "Register" buttons with MongoDB brand styling
✅ **Conditional:** Buttons only show for published landing pages
✅ **Tested:** Landing page URLs work (e.g., `/mongodb-spring-2026`)

Users can now easily discover and register for events via the public landing pages!
