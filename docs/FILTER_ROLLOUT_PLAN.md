# Filter System Rollout Plan

## Overview
Apply the Events page filter pattern to 5 remaining admin pages:
1. Users
2. Teams
3. Projects
4. Judges
5. Partners

---

## Pattern Template (from EventsView)

### 1. Add DEFAULT_FILTERS constant
```typescript
const DEFAULT_FILTERS = {
  search: "",
  // ... field-specific filters ...
  sortField: "createdAt",
  sortDirection: "desc" as "asc" | "desc",
};
```

### 2. Replace useState with useFilterState
```typescript
// OLD:
const [search, setSearch] = useState("");

// NEW:
const {
  filters,
  updateFilter,
  clearFilters,
  activeFilters,
} = useFilterState(DEFAULT_FILTERS);
```

### 3. Replace filtering logic with useMemo
```typescript
const filteredAndSortedData = useMemo(() => {
  let result = [...data];

  // Search
  if (filters.search) {
    result = result.filter(/* search logic */);
  }

  // Apply other filters...

  // Sort
  result.sort(/* sort logic */);

  return result;
}, [data, filters]);
```

### 4. Replace toolbar with FilterToolbar
```typescript
<FilterToolbar
  searchValue={filters.search}
  onSearchChange={(value) => updateFilter("search", value)}
  searchPlaceholder="Search..."
  sortField={filters.sortField}
  sortDirection={filters.sortDirection}
  onSortFieldChange={(field) => updateFilter("sortField", field)}
  onSortDirectionChange={(dir) => updateFilter("sortDirection", dir)}
  sortOptions={[/* field options */]}
  activeFilters={activeFilters}
  onRemoveFilter={(key) => updateFilter(key, DEFAULT_FILTERS[key])}
  onClearAllFilters={clearFilters}
  rightActions={/* existing buttons */}
>
  {/* Filter components */}
</FilterToolbar>
```

### 5. Add results count
```typescript
<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
  Showing {filteredData.length} of {data.length} items
</Typography>
```

---

## Page-Specific Filter Designs

### 1. Users (/admin/users)
**Current state:** Basic text search only

**Filters to add:**
- ✅ Search: name, email, role (existing)
- 🆕 Role filter: MultiSelectFilter (participant, judge, organizer, admin, super_admin)
- 🆕 Join date range: DateRangeFilter
- 🆕 Sort: name, email, role, createdAt

**Estimated time:** 15-20 minutes

---

### 2. Teams (/admin/teams)
**Current state:** No filters

**Data structure:** `{ _id, name, eventId, leaderId, members[], lookingForMembers, skills[], createdAt }`

**Filters to add:**
- 🆕 Search: team name, leader name, skills
- 🆕 Event filter: MultiSelectFilter (from events list)
- 🆕 Team size: RangeFilter (1-10 members)
- 🆕 Looking for members: StatusFilter (yes/no)
- 🆕 Skills: MultiSelectFilter (extract unique skills)
- 🆕 Sort: name, memberCount, createdAt

**Estimated time:** 20-25 minutes

---

### 3. Projects (/admin/projects)
**Current state:** No filters

**Data structure:** `{ _id, name, teamId, eventId, techStack[], categories[], demoUrl, status, createdAt }`

**Filters to add:**
- 🆕 Search: project name, team name, description
- 🆕 Event filter: MultiSelectFilter
- 🆕 Tech stack: MultiSelectFilter (extract unique technologies)
- 🆕 Categories: MultiSelectFilter
- 🆕 Status: StatusFilter (draft, submitted)
- 🆕 Has demo: StatusFilter (yes/no)
- 🆕 Sort: name, createdAt, event

**Estimated time:** 25-30 minutes

---

### 4. Judges (/admin/judges)
**Current state:** No filters

**Data structure:** `{ _id, userId, eventIds[], expertise[], assignedProjects[], availability, createdAt }`

**Filters to add:**
- 🆕 Search: judge name, email, expertise
- 🆕 Event filter: MultiSelectFilter (assigned events)
- 🆕 Expertise: MultiSelectFilter (unique expertise areas)
- 🆕 Assignment count: RangeFilter (0-50 projects)
- 🆕 Availability: StatusFilter (available, busy)
- 🆕 Sort: name, assignmentCount, createdAt

**Estimated time:** 20-25 minutes

---

### 5. Partners (/admin/partners)
**Current state:** No filters

**Data structure:** `{ _id, name, tier, logo, website, eventIds[], status, createdAt }`

**Filters to add:**
- 🆕 Search: partner name, website
- 🆕 Tier filter: StatusFilter (platinum, gold, silver, bronze)
- 🆕 Event filter: MultiSelectFilter (associated events)
- 🆕 Status: StatusFilter (active, inactive)
- 🆕 Sort: name, tier, createdAt

**Estimated time:** 15-20 minutes

---

## Implementation Order (Priority)

1. **Users** - Most used, simplest filters (15min)
2. **Teams** - Medium complexity, high value (25min)
3. **Projects** - Most complex, high value (30min)
4. **Partners** - Simple, medium value (15min)
5. **Judges** - Medium complexity, medium value (25min)

**Total estimated time:** ~2 hours

---

## Workflow (Per Page)

1. Create enhanced version in workspace
2. Review key changes with user
3. User approves
4. Copy to actual file
5. Test in browser
6. Commit + push
7. Move to next page

**Quality gates:**
- ✅ No TypeScript errors
- ✅ Builds successfully
- ✅ Filters work in browser
- ✅ URL params sync correctly
- ✅ Results count accurate
- ✅ Export respects filters

---

## Ready to Start?

**Option A:** Do all 5 pages in one batch (2 hours, 5 commits)
**Option B:** Do one page now, test it, then continue (safer)
**Option C:** Create all files, review together, then commit all

**My recommendation:** Option B (one at a time, test between)
