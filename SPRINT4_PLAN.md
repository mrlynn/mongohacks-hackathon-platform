# Sprint 4: "Polish & Harden" — Implementation Plan

**Date:** February 26, 2026, 8:58 AM EST  
**Goal:** Production-ready quality  
**Estimated Time:** 10-12 hours  
**Status:** Starting

---

## Overview

Sprint 4 focuses on stability, performance, and user experience. This is about making the platform production-ready, not adding features.

**Priorities:**
1. **Stability** - Error boundaries, loading states, graceful failures
2. **Quality** - Type safety, eliminate `any` types
3. **Testing** - API route tests for critical paths
4. **Performance** - Database indexes, query optimization
5. **UX** - Mobile responsiveness, dark mode

---

## Build Order (By Impact)

### Phase 4.1: Database Indexes (HIGH IMPACT - 2 hours)

**Why First:** Biggest performance win for lowest effort. Missing indexes cause slow queries and potential timeouts under load.

**Tasks:**
1. Add indexes to all models
2. Test query performance
3. Document index strategy

**Files to Modify:**
- `/src/lib/db/models/Event.ts`
- `/src/lib/db/models/Participant.ts`
- `/src/lib/db/models/Team.ts`
- `/src/lib/db/models/Project.ts`
- `/src/lib/db/models/Score.ts`
- `/src/lib/db/models/JudgeAssignment.ts`

**Required Indexes:**
```javascript
// Events
{ "landingPage.slug": 1 } // unique
{ status: 1, startDate: 1 }

// Participants
{ userId: 1 }
{ "registeredEvents.eventId": 1 }
{ teamId: 1, eventId: 1 }

// Teams
{ eventId: 1, lookingForMembers: 1 }
{ leaderId: 1 }

// Projects
{ eventId: 1, status: 1 }
{ teamId: 1, eventId: 1 } // compound unique

// Scores
{ projectId: 1, judgeId: 1 } // compound unique
{ eventId: 1 }

// JudgeAssignments
{ eventId: 1, judgeId: 1 }
{ projectId: 1 }
```

**Success Criteria:**
- All indexes created
- No N+1 queries in hot paths
- Query performance < 100ms for most operations

---

### Phase 4.2: Type Safety (MEDIUM IMPACT - 2 hours)

**Why Second:** Prevents bugs, improves DX, makes refactoring safer.

**Strategy:**
1. Find all `any` types in component props
2. Create proper interfaces
3. Use existing types from `/src/types/index.ts`
4. Add `noImplicitAny: true` to tsconfig (stretch goal)

**Files to Audit:**
```bash
# Find all any types in components
grep -r "any" src/app --include="*.tsx" | grep -v "node_modules"
```

**Common Patterns to Fix:**
```typescript
// Before
interface Props {
  data: any;
  event: any;
}

// After
interface Props {
  data: EventHubData;
  event: Event;
}
```

**Success Criteria:**
- Zero `any` in component props
- All API responses typed
- TypeScript strict mode enabled (stretch)

---

### Phase 4.3: Loading & Error States (HIGH IMPACT - 3-4 hours)

**Why Third:** Critical for production stability. Silent failures confuse users.

**Strategy:**
1. Add React Suspense boundaries
2. Add error boundaries for each major section
3. Add loading skeletons for all async data
4. Add error fallbacks with retry buttons

**Files to Modify:**
- `/src/app/(app)/events/[eventId]/hub/page.tsx`
- `/src/app/(app)/judging/[eventId]/page.tsx`
- `/src/app/(app)/admin/events/[eventId]/results/page.tsx`
- All client components with async state

**Patterns to Implement:**

**1. Error Boundary:**
```tsx
// src/components/ErrorBoundary.tsx (NEW)
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**2. Loading Skeleton:**
```tsx
// src/components/skeletons/CardSkeleton.tsx (NEW)
export function CardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rectangular" height={100} />
      </CardContent>
    </Card>
  );
}
```

**3. Suspense Wrapper:**
```tsx
<Suspense fallback={<HubSkeleton />}>
  <EventHubContent />
</Suspense>
```

**Success Criteria:**
- No silent failures
- Every async operation has loading state
- Error boundaries on all major pages
- Retry mechanisms for failed requests

---

### Phase 4.4: API Route Tests (MEDIUM IMPACT - 4-5 hours)

**Why Fourth:** Prevents regressions, documents expected behavior, enables confident refactoring.

**Strategy:**
1. Test critical path APIs only (not everything)
2. Use Jest + Supertest
3. Mock database connections
4. Focus on validation logic

**Critical APIs to Test:**

**Registration Flow:**
- `POST /api/events/[eventId]/register` (10 test cases)
  - ✅ Valid registration
  - ❌ Duplicate email
  - ❌ Event full (capacity)
  - ❌ Event closed (status)
  - ❌ Missing required fields
  - ✅ Skill embedding generation
  - ❌ Invalid event ID
  - ✅ Participant created with correct fields
  - ❌ Registration after deadline
  - ✅ Auto-login after registration

**Team Operations:**
- `POST /api/events/[eventId]/teams` (8 test cases)
  - ✅ Create team with valid data
  - ❌ User not registered for event
  - ❌ User already on a team
  - ✅ Desired skills embedding generated
  - ❌ Missing team name
  - ✅ Leader assigned correctly
  - ❌ Invalid event ID
  - ✅ Team capacity set correctly

- `POST /api/events/[eventId]/teams/[teamId]/join` (6 test cases)
  - ✅ Join team successfully
  - ❌ Team at capacity
  - ❌ User already on team
  - ❌ User not registered
  - ✅ Participant teamId updated
  - ❌ Invalid team ID

**Project Submission:**
- `POST /api/events/[eventId]/projects` (10 test cases)
  - ✅ Create project
  - ❌ Not on a team
  - ❌ Team already has project
  - ❌ Invalid GitHub URL
  - ❌ Missing required fields
  - ✅ AI summary triggered
  - ❌ After submission deadline
  - ✅ Project status set to draft
  - ✅ Technologies array populated
  - ❌ Not a team member

- `POST /api/events/[eventId]/projects/[projectId]` (submit/unsubmit) (6 test cases)
  - ✅ Submit project
  - ✅ Unsubmit project
  - ❌ Submit after deadline
  - ❌ Not a team member
  - ❌ Invalid project ID
  - ✅ AI summary generated on submit

**Judging:**
- `POST /api/judging/[eventId]/score` (8 test cases)
  - ✅ Submit score
  - ❌ Not a judge
  - ❌ Not assigned to project
  - ❌ Score out of range (1-10)
  - ❌ Missing criteria
  - ✅ Duplicate score (update existing)
  - ✅ Total score calculated correctly
  - ❌ Invalid project ID

**Total:** ~48 test cases covering 5 critical APIs

**File Structure:**
```
src/__tests__/
├── api/
│   ├── register.test.ts
│   ├── teams.test.ts
│   ├── projects.test.ts
│   └── judging.test.ts
└── utils/
    ├── test-helpers.ts
    └── mock-data.ts
```

**Success Criteria:**
- 40+ passing tests
- All critical paths covered
- Test coverage report shows 40%+ on API routes
- Tests run in CI (stretch)

---

### Phase 4.5: Mobile Audit & Fixes (HIGH IMPACT - 3-4 hours)

**Why Fifth:** 60%+ of hackathon participants use mobile for browsing/registration.

**Strategy:**
1. Test all pages at 375px width (iPhone SE)
2. Fix layout breaks
3. Optimize touch targets (44px minimum)
4. Test forms on mobile (keyboard behavior)

**Pages to Audit:**
- Landing pages
- Registration form
- Event Hub
- Team browsing
- Project submission form
- Judging interface

**Common Issues to Fix:**
- Horizontal scroll
- Text too small
- Buttons too close together
- Form inputs without proper `inputMode`
- Fixed-width elements breaking layout
- Missing `viewport` meta tag

**Testing Tool:**
```bash
# Use Chrome DevTools mobile emulation
# Or test on real device via ngrok/Tailscale
```

**Success Criteria:**
- All pages work at 375px width
- No horizontal scroll
- All touch targets >= 44px
- Form inputs have correct keyboard on mobile
- Lighthouse mobile score > 80

---

### Phase 4.6: Dark Mode (LOW IMPACT - 2 hours)

**Why Last:** Nice to have, but doesn't affect core functionality.

**Strategy:**
1. Add theme toggle to settings
2. Persist preference in localStorage
3. Create dark palette in theme config
4. Test all components in dark mode

**Implementation:**
```tsx
// src/contexts/ThemeContext.tsx (NEW)
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setMode(saved as 'light' | 'dark');
  }, []);
  
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'dark' ? darkPalette : lightPalette),
    },
  });
  
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
```

**Dark Palette:**
```typescript
const darkPalette = {
  primary: {
    main: '#00ED64', // Spring Green
    dark: '#00684A',  // Forest Green
  },
  background: {
    default: '#001E2B', // Slate Blue
    paper: '#023430',   // Evergreen
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
  },
};
```

**Success Criteria:**
- Theme toggle in settings
- Preference persists across sessions
- All components legible in dark mode
- No contrast issues (WCAG AA compliance)

---

## Timeline

**Phase 4.1:** Database Indexes (2 hours) — Start here  
**Phase 4.2:** Type Safety (2 hours)  
**Phase 4.3:** Loading & Error States (3-4 hours)  
**Phase 4.4:** API Tests (4-5 hours) — Can be done in parallel  
**Phase 4.5:** Mobile Audit (3-4 hours)  
**Phase 4.6:** Dark Mode (2 hours) — Optional stretch goal  

**Total:** 16-19 hours (realistic)  
**Critical Path:** 12-14 hours (without dark mode)

---

## Success Metrics

**Before Sprint 4:**
- Build time: ~45s
- No tests (0% coverage)
- `any` types: ~30 occurrences
- Mobile: broken layouts
- Error handling: silent failures

**After Sprint 4:**
- Build time: <60s
- 40+ passing tests (40% API coverage)
- `any` types: 0 in component props
- Mobile: all pages functional at 375px
- Error handling: boundaries + loading states + retry

**Launch Readiness:**
- ✅ All async operations have loading states
- ✅ Error boundaries on critical pages
- ✅ Type-safe component props
- ✅ 40+ API tests passing
- ✅ Mobile responsive (iPhone SE+)
- ✅ Database indexes for hot paths
- 🎁 Dark mode (bonus)

---

## Next Steps

1. **Start Phase 4.1:** Add database indexes
2. Run query performance tests
3. Move to Phase 4.2 (type safety)
4. Parallel work: API tests can be done separately

**Ready to start Phase 4.1?**
