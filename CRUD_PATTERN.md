# CRUD Pattern - Consistent Data Views

## Overview

All CRUD screens in the MongoHacks platform follow a consistent pattern:
- **Table View** - Dense, scannable rows
- **Card View** - Rich, detailed cards
- **CSV Export** - One-click data export

This provides flexibility for different use cases while maintaining UX consistency.

## Components

### 1. ViewToggle

Toggle between table and card layouts.

```tsx
import ViewToggle from "@/components/shared-ui/ViewToggle";

const [view, setView] = useState<"table" | "card">("table");

<ViewToggle view={view} onChange={setView} />
```

### 2. ExportButton

Export data to CSV with custom column mapping.

```tsx
import ExportButton from "@/components/shared-ui/ExportButton";

const csvColumns = [
  { key: "name" as const, label: "Name" },
  { key: "email" as const, label: "Email" },
];

<ExportButton 
  data={items} 
  filename="export" 
  columns={csvColumns} 
/>
```

### 3. CSV Export Utility

Generic CSV export function.

```tsx
import { exportToCSV } from "@/lib/utils/csv";

exportToCSV(data, "filename", columns);
```

## Implementation Pattern

### Standard Layout

```tsx
"use client";

import { useState } from "react";
import { Box, Table, Grid, Card } from "@mui/material";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";

export default function DataView({ items }: { items: Item[] }) {
  const [view, setView] = useState<"table" | "card">("table");

  const csvColumns = [
    { key: "field1" as const, label: "Label 1" },
    { key: "field2" as const, label: "Label 2" },
  ];

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <ViewToggle view={view} onChange={setView} />
        <ExportButton data={items} filename="data" columns={csvColumns} />
      </Box>

      {/* Table View */}
      {view === "table" && (
        <TableContainer component={Paper}>
          <Table>
            {/* ... table content ... */}
          </Table>
        </TableContainer>
      )}

      {/* Card View */}
      {view === "card" && (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card>
                {/* ... card content ... */}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
```

## Implemented Views

### ✅ Events (Admin)

**Location:** `/app/admin/events/EventsView.tsx`

**Features:**
- Table: Name, theme, dates, status, capacity, type, actions
- Card: Event details with MongoDB green theme
- CSV: All event fields including location data
- Actions: Results, registrations, landing page, view, edit, delete

### ✅ Users (Admin)

**Location:** `/app/admin/users/UsersView.tsx`

**Features:**
- Table: Name, email, role dropdown, joined date
- Card: User profile card with role selector
- CSV: User details export
- Inline role management (dropdown select)

### ✅ Registrations (Admin)

**Location:** `/app/admin/events/[eventId]/registrations/RegistrationsView.tsx`

**Features:**
- Table: Name, email, skills, experience, date, team status
- Card: Full participant profile with bio
- CSV: Registration data with transformed fields
- Skill chips with overflow indicator (+N)

## Design Guidelines

### Table View

**When to use:**
- Scanning many records quickly
- Comparing values across rows
- Bulk operations
- Admin workflows

**Best practices:**
- Keep columns to 6-8 max
- Use chips for status/categories
- Right-align action icons
- Consistent column widths

### Card View

**When to use:**
- Browsing/discovery
- Rich content (images, descriptions)
- Mobile-first interfaces
- User-facing views

**Best practices:**
- 3-4 cards per row on desktop (Grid xs={12} sm={6} md={4})
- Consistent card heights
- Clear visual hierarchy
- Action buttons at bottom

## CSV Export

### Transformation

Handle complex data before export:

```tsx
const csvData = items.map((item) => ({
  ...item,
  // Arrays → string
  skills: item.skills.join("; "),
  // Dates → formatted
  createdAt: new Date(item.createdAt).toLocaleDateString(),
  // Booleans → Yes/No
  hasTeam: item.teamId ? "Yes" : "No",
}));
```

### Column Mapping

Always provide explicit column labels:

```tsx
const csvColumns = [
  { key: "name", label: "Full Name" },        // Rename
  { key: "email", label: "Email Address" },    // Descriptive
  { key: "createdAt", label: "Join Date" },   // User-friendly
];
```

## Adding New CRUD Views

### 1. Create View Component

```bash
# For a new entity (e.g., Teams)
touch src/app/admin/teams/TeamsView.tsx
```

### 2. Implement Pattern

```tsx
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";

export default function TeamsView({ teams }: { teams: Team[] }) {
  const [view, setView] = useState<"table" | "card">("table");
  
  const csvColumns = [/* define columns */];
  
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <ViewToggle view={view} onChange={setView} />
        <ExportButton data={teams} filename="teams" columns={csvColumns} />
      </Box>
      
      {/* Table + Card views */}
    </Box>
  );
}
```

### 3. Use in Page

```tsx
import TeamsView from "./TeamsView";

export default function TeamsPage() {
  const teams = await getTeams();
  return <TeamsView teams={teams} />;
}
```

## Future Enhancements

**Potential additions:**
- [ ] List view (compact single column)
- [ ] Filtering/sorting controls
- [ ] Pagination for large datasets
- [ ] Bulk selection checkboxes
- [ ] Column visibility toggles
- [ ] Save view preference (localStorage)
- [ ] Print-friendly view

## Benefits

**Consistency:**
- Same UX across all admin screens
- Reduced learning curve
- Predictable interactions

**Flexibility:**
- Table for power users
- Cards for visual browsing
- Export for external tools

**Maintainability:**
- Shared components
- Single source of truth
- Easy to extend

**Accessibility:**
- Semantic HTML
- Keyboard navigation
- Screen reader friendly

---

**Status:** ✅ Implemented  
**Last Updated:** 2026-02-25  
**Coverage:** Events, Users, Registrations
