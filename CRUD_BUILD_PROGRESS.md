# MongoHacks Platform CRUD Build Progress

**Started:** February 25, 2026, 3:27 AM EST  
**Status:** Part 1 Complete, Part 2 In Progress

---

## ✅ Part 1 Complete (Committed: 500c68c)

### Event Management with Geolocation
- **Model:** Enhanced Event model with coordinates, city, country, venue
- **Admin Form:** Complete event creation at `/admin/events/new`
- **API:** POST/GET `/api/admin/events` with filtering
- **Geospatial:** 2dsphere index ready for map queries

### Team Formation
- **Model:** Team model with members, leader, skills, maxMembers
- **Discovery:** Team listing at `/events/[eventId]/teams`
- **Display:** Team cards showing members, skills, capacity

---

## 🚧 Part 2 In Progress

### Files Created (Not Yet Committed)
1. `/src/app/events/[eventId]/teams/new/page.tsx` - Team creation form

### Next Steps (Need to Build)

#### 1. Team API Routes
```typescript
// POST /api/events/[eventId]/teams - Create team
// GET /api/events/[eventId]/teams - List teams
// POST /api/events/[eventId]/teams/[teamId]/join - Join team
// DELETE /api/events/[eventId]/teams/[teamId]/leave - Leave team
```

#### 2. Project Submission
```typescript
// Model updates needed for Project
// Form: /events/[eventId]/projects/new
// API: POST /api/events/[eventId]/projects
// List: /events/[eventId]/projects (team's projects)
```

#### 3. Project Judging Interface
```typescript
// Judge dashboard: /judging
// Judge assignment: /admin/judges/assign
// Scoring form: /judging/project/[projectId]/score
// API: POST /api/judging/score
```

#### 4. User Management
```typescript
// User profile: /profile
// User settings: /profile/settings
// API: PATCH /api/user/profile
```

#### 5. World Map Visualization
```typescript
// Install: npm install react-leaflet leaflet
// Map component: /src/components/shared-ui/EventsMap.tsx
// Public page: /events/map
// API: GET /api/events/map (returns events with coordinates)
```

---

## 📋 Complete Feature Checklist

### Events ✅
- [x] Model with geolocation
- [x] Admin create form
- [x] Admin list/delete
- [ ] Admin edit form
- [ ] Public event listing
- [ ] Event details page
- [ ] Event registration

### Teams 🔄
- [x] Model
- [x] Team discovery page
- [x] Team creation form (file created)
- [ ] Team API routes
- [ ] Join team functionality
- [ ] Team management (leader)
- [ ] Team details page

### Projects ⏳
- [ ] Enhanced Project model
- [ ] Project submission form
- [ ] Project listing
- [ ] Project details page
- [ ] Project editing
- [ ] File upload support
- [ ] Repository linking

### Judging ⏳
- [ ] Judge assignment interface
- [ ] Judge dashboard
- [ ] Project scoring form
- [ ] Rubric system
- [ ] Score aggregation
- [ ] Awards/rankings

### Users ⏳
- [ ] User profile page
- [ ] Profile editing
- [ ] User dashboard
- [ ] Participant registration
- [ ] Skills management

### World Map ⏳
- [ ] Install mapping library
- [ ] Map component
- [ ] Events map page
- [ ] Marker clustering
- [ ] Event pop-ups
- [ ] Filter by country/date

---

## 🗺️ World Map Implementation Plan

### Dependencies
```bash
npm install react-leaflet leaflet
npm install --save-dev @types/leaflet
```

### Map Component Structure
```typescript
// /src/components/shared-ui/EventsMap.tsx
- Leaflet map with MongoDB Green markers
- Clustering for nearby events
- Pop-ups with event details
- Click to navigate to event page

// /app/events/map/page.tsx
- Full-screen map view
- Filter sidebar (country, date range, virtual/in-person)
- Event count badge

// API: /api/events/map
- Returns all events with coordinates
- Filters: country, date range, status
- Response: { events: [...{ name, coordinates, city, country }] }
```

### Geospatial Query Example
```typescript
// Find events near a location (within 50km)
EventModel.find({
  coordinates: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 50000 // meters
    }
  }
});
```

---

## 🎯 Recommended Build Order

### Phase 1 (Immediate - 30 mins)
1. Team API routes (create, list, join)
2. Commit Part 2 (teams complete)

### Phase 2 (Next - 45 mins)
1. Project submission form
2. Project API routes
3. Project listing page

### Phase 3 (Then - 30 mins)
1. World map component
2. Map API endpoint
3. Events map page

### Phase 4 (After - 1 hour)
1. Judging interface
2. Judge assignment
3. Scoring system

### Phase 5 (Final - 30 mins)
1. User profiles
2. Dashboard enhancements
3. Polish & testing

---

## 🔧 API Routes Summary

### Existing
- ✅ POST `/api/admin/events` - Create event
- ✅ GET `/api/admin/events` - List events
- ✅ DELETE `/api/admin/events/[eventId]` - Delete event
- ✅ PATCH `/api/admin/events/[eventId]` - Update event

### Need to Build
- POST `/api/events/[eventId]/teams` - Create team
- GET `/api/events/[eventId]/teams` - List teams
- POST `/api/events/[eventId]/teams/[teamId]/join` - Join team
- POST `/api/events/[eventId]/projects` - Submit project
- GET `/api/events/[eventId]/projects` - List projects
- GET `/api/events/map` - Get events for map
- POST `/api/judging/score` - Submit score
- GET `/api/judging/assignments` - Get judge assignments

---

## 📦 Dependencies Needed

```json
{
  "react-leaflet": "^4.x",  // World map
  "leaflet": "^1.x",        // Map library
  "@types/leaflet": "^1.x"  // TypeScript types
}
```

---

## 💾 Database Collections Status

### Complete ✅
- users (with roles)
- events (with geolocation)
- teams (with members/skills)

### Existing (Need Enhancement) 🔄
- projects (add teamId, better fields)
- scores (judging system)

### Need to Create ⏳
- participants (event registration tracking)
- judge_assignments (judge-to-project mapping)

---

## 🚀 Next Commands to Run

```bash
# Commit team creation form
cd /Users/michael.lynn/code/mongohacks/hackathon-platform
git add src/app/events/\[eventId\]/teams/new/page.tsx
git commit -m "feat: Add team creation form"

# Install mapping dependencies
npm install react-leaflet leaflet --legacy-peer-deps
npm install --save-dev @types/leaflet

# Create remaining API routes
# ... (see API Routes Summary above)
```

---

**Current Status:** ~40% complete  
**Estimated Time to Full CRUD:** 2-3 hours  
**Immediate Next Step:** Build team API routes & commit Part 2
