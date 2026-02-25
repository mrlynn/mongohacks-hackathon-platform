# MongoDB Design System Branding

**Applied:** February 25, 2026

## Color Palette Changes

### Before (Generic)
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#6366f1` | Indigo (generic) |
| Secondary | `#ec4899` | Pink (off-brand) |
| Success | `#10b981` | Emerald (off-brand) |

### After (MongoDB Design System)
| Color | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#00ED64` | MongoDB Green (brand primary) |
| **Secondary** | `#0068F9` | MongoDB Blue (interactive) |
| **Success** | `#00ED64` | MongoDB Green |
| **Info** | `#0068F9` | MongoDB Blue |
| **Warning** | `#FFB302` | MongoDB Yellow |
| **Error** | `#E74C3C` | MongoDB Red |
| **Accent** | `#B039F8` | MongoDB Purple |

## MongoDB Color Palette

### Green (Primary Brand)
- **Light:** `#00ED64` — Primary brand color
- **Dark:** `#00684A` — MongoDB Forest

### Blue (Interactive)
- **Light:** `#4A90FF`
- **Main:** `#0068F9` — Buttons, links, CTAs
- **Dark:** `#0052C2`

### Slate (Backgrounds)
- **Main:** `#001E2B` — Dark backgrounds, text
- **Dark:** `#001419` — Deeper dark

### Purple (Accent)
- **Light:** `#C766FF`
- **Main:** `#B039F8` — Highlights, badges
- **Dark:** `#8B2FC9`

### Grays (Neutral)
- **100:** `#F9FBFA` — Page backgrounds
- **200:** `#E7EEEC` — Borders
- **300:** `#B8C4C2` — Dividers
- **600:** `#3D4F58` — Secondary text
- **800:** `#0E1B24` — Dark elements

## Typography

**Font Family:** `'Euclid Circular A', 'Akzidenz', 'Helvetica Neue', Arial, sans-serif`

MongoDB's brand typeface is **Euclid Circular A**. This font is used across all MongoDB products and marketing materials.

**Font Weights:**
- Headings: **600** (Semi-bold)
- Buttons: **600** (Semi-bold)
- Body text: **400** (Regular)
- Secondary text: **500** (Medium)

**Letter Spacing:**
- H1/H2: Slightly tighter (`-0.02em`, `-0.01em`)
- Buttons: Slightly wider (`0.02em`)

## Component Styling

### Cards
- Border radius: **12px**
- Shadow: `0 4px 8px rgba(0, 30, 43, 0.08)`
- Background: White (`#FFFFFF`)

### Buttons
- Border radius: **6px**
- Font weight: **600**
- Padding: **10px 16px**
- Shadow (contained): `0 2px 4px rgba(0, 30, 43, 0.12)`
- Hover shadow: `0 4px 8px rgba(0, 30, 43, 0.16)`

### Chips
- Border radius: **6px**
- Font weight: **500**

## Design Resources

- **MongoDB Design System:** https://www.mongodb.design/
- **LeafyGreen UI (React):** https://github.com/mongodb/leafygreen-ui
- **Color Palette Reference:** https://www.mongodb.design/component/palette/live-example
- **Typography Guide:** https://www.mongodb.design/component/typography/live-example

## Usage in Components

```tsx
import { hackathonTheme } from '@/styles/theme';
import { ThemeProvider } from '@mui/material/styles';

// Wrap your app
<ThemeProvider theme={hackathonTheme}>
  <YourApp />
</ThemeProvider>

// Use theme colors
<Button color="primary">     // MongoDB Green
<Button color="secondary">   // MongoDB Blue
<Chip color="success">       // MongoDB Green
<Alert severity="info">      // MongoDB Blue
```

## Brand Guidelines

✅ **Do:**
- Use MongoDB Green (`#00ED64`) for primary actions
- Use MongoDB Blue (`#0068F9`) for interactive elements
- Maintain sufficient contrast ratios (WCAG AA minimum)
- Use brand typography (Euclid Circular A)
- Apply consistent spacing and shadows

❌ **Don't:**
- Mix with non-MongoDB colors (no pink, generic indigo, etc.)
- Use light green on light backgrounds (contrast issues)
- Override brand fonts without design approval
- Use inconsistent border radii

---

**Next Steps:**
1. Install Euclid Circular A font (if available)
2. Review all components for color usage
3. Update any hardcoded colors to use theme
4. Test accessibility (contrast ratios)
5. Consider migrating to LeafyGreen UI components for full brand consistency
