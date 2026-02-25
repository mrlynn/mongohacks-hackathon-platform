# Landing Page System

Complete guide to creating beautiful MongoDB-branded event landing pages.

## Overview

The landing page system allows admins to create professional, customizable landing pages for each hackathon event. Choose from three professionally-designed templates, customize content, and publish with a custom URL.

## Features

✅ **Three Professional Templates** - Modern, Bold, Tech  
✅ **Visual Builder** - WYSIWYG-style content editor  
✅ **Custom URLs** - Clean slug-based URLs (e.g., `/mongodb-hackathon-2024`)  
✅ **Draft/Publish Workflow** - Preview before going live  
✅ **Responsive Design** - Mobile-first, works on all devices  
✅ **MongoDB Branding** - Official colors, fonts, and style  

## Quick Start

### 1. Access Landing Page Builder

From the admin events list:
1. Click the **green web icon** next to any event
2. Opens the landing page builder

### 2. Choose a Template

**Modern** - Clean & Professional
- Soft MongoDB green (#00684A)
- Minimal, elegant design
- Great for: Corporate hackathons, professional events

**Bold** - Vibrant & Energetic
- Gradient blues & purples (#0068F9 → #B039F8)
- Explosive, high-energy design
- Great for: Student hackathons, innovation challenges

**Tech** - Dark & Futuristic
- Dark background with neon green (#00ED64)
- Terminal/code aesthetic
- Great for: Developer-focused events, tech conferences

### 3. Customize Content

**Hero Section:**
- Headline (main title)
- Subheadline (tagline)
- CTA button text
- Background image URL (optional)

**About Section:**
- Long-form description of the event

**Prizes (optional):**
- Title (e.g., "1st Place")
- Value (e.g., "$5,000")
- Description

**Schedule (optional):**
- Time (e.g., "9:00 AM")
- Title (e.g., "Opening Ceremony")
- Description

**Sponsors (optional):**
- Name
- Logo URL
- Tier (Gold, Silver, Bronze)

**FAQ (optional):**
- Question
- Answer

### 4. Set URL Slug

- Auto-generated from event name
- Can be customized (alphanumeric + hyphens only)
- Must be unique across all events
- Example: `mongodb-hackathon-2024`

### 5. Preview & Publish

**Save Draft**
- Saves all changes without publishing
- Page is not publicly visible

**Preview**
- Opens preview mode in new tab
- Shows how page will look when published
- URL includes `?preview=true`

**Publish**
- Makes page publicly visible
- Page accessible at `/{slug}`
- Toggle "Published" switch to unpublish later

## Templates in Detail

### Modern Template

**Colors:**
- Primary: #00684A (forest green)
- Accent: #13AA52 (light green)
- Background: White / light gray

**Features:**
- Clean hero with overlay
- Card-based sections
- Subtle shadows and elevation
- Professional typography

**Best for:**
- Corporate hackathons
- Professional developer events
- Enterprise-sponsored challenges

---

### Bold Template

**Colors:**
- Primary: #0068F9 (electric blue)
- Secondary: #B039F8 (vibrant purple)
- Gradients throughout

**Features:**
- Explosive hero with animation effects
- Angular/diagonal section dividers
- Prize cards with metallic gradients (gold/silver/bronze)
- High-energy CTAs

**Best for:**
- Student hackathons
- Innovation challenges
- Youth-focused events

---

### Tech Template

**Colors:**
- Background: #0a0e27 (deep space blue)
- Accent: #00ED64 (neon green)
- Text: #B0FFB0 (light green)

**Features:**
- Dark terminal aesthetic
- Monospace font (Courier New)
- Command-line style text (`> headline_`)
- Neon green glowing effects
- Matrix/cyberpunk vibe

**Best for:**
- Developer-focused hackathons
- Technical conferences
- Cybersecurity events

## URL Structure

**Landing Pages:**
- `/{slug}` - Public landing page (published only)
- `/{slug}?preview=true` - Preview mode (draft or published)

**Admin Pages:**
- `/admin/events` - Events list with landing page icons
- `/admin/events/{eventId}/landing-page` - Landing page builder

**API Endpoints:**
- `GET /api/landing-pages/{slug}` - Fetch landing page data
- `PUT /api/admin/events/{eventId}/landing-page` - Save landing page
- `GET /api/admin/events/{eventId}/landing-page` - Load landing page

## Slug Best Practices

**Good slugs:**
- `mongodb-hackathon-2024`
- `build-with-ai`
- `green-tech-challenge`

**Bad slugs:**
- `MongoDB Hackathon!!!` (spaces, special chars)
- `hack` (too generic)
- `event-1` (not descriptive)

**Rules:**
- Lowercase letters, numbers, hyphens only
- No spaces or special characters
- Must be unique across platform
- Descriptive (helps with SEO)

## Content Tips

### Writing Effective Headlines

**Modern Template:**
- Professional, clear, benefit-driven
- Example: "Build the Future with MongoDB"

**Bold Template:**
- Energetic, action-oriented, exciting
- Example: "Code. Compete. Conquer."

**Tech Template:**
- Clever, technical, command-line style
- Example: `> hackathon.execute()`

### Crafting Subheadlines

- Clarify what the event is about
- Include key details (duration, location type)
- Keep it under 20 words
- Example: "48 hours to build innovative apps using MongoDB Atlas"

### Prize Descriptions

- Be specific about what winners receive
- Include both monetary value and non-monetary perks
- Example: "$5,000 cash + MongoDB swag + mentorship from MongoDB engineers"

### Schedule Items

- Use consistent time format (12-hour or 24-hour)
- Group by day if multi-day event
- Include timezone for virtual events
- Optional descriptions add context

### FAQ Content

- Answer common questions before they're asked
- Cover: eligibility, team size, prizes, judging, tech stack
- Keep answers concise (2-3 sentences max)
- Add personality to match template vibe

## Technical Details

### Event Model Extension

```typescript
landingPage: {
  template: "modern" | "bold" | "tech",
  slug: string, // Unique, indexed
  published: boolean,
  customContent: {
    hero: {
      headline: string,
      subheadline: string,
      ctaText: string,
      backgroundImage: string
    },
    about: string,
    prizes: Array<{ title, description, value }>,
    schedule: Array<{ time, title, description }>,
    sponsors: Array<{ name, logo, tier }>,
    faq: Array<{ question, answer }>
  }
}
```

### Database Indexes

- `landingPage.slug` - Unique index for fast lookups
- `landingPage.published` - Filter published pages

### Validation

- Slug uniqueness checked on save
- Returns 409 Conflict if slug already exists
- Preview mode bypasses published check

## Future Enhancements

- [ ] Rich text editor for about section
- [ ] Image upload for hero backgrounds
- [ ] Template preview cards
- [ ] Duplicate landing page feature
- [ ] Landing page analytics
- [ ] Social media preview cards (OpenGraph)
- [ ] Registration form integration
- [ ] A/B testing support

## Troubleshooting

**Landing page builder not loading?**
- Check if event exists
- Verify admin/organizer role
- Check browser console for errors

**Slug already taken error?**
- Try a more specific slug
- Add year: `hackathon-2024`
- Add location: `mongodb-hackathon-sf`

**Preview not showing changes?**
- Click "Save Draft" first
- Hard refresh preview tab (Cmd+Shift+R)
- Check browser cache

**Published page returns 404?**
- Verify "Published" toggle is ON
- Check slug doesn't have special characters
- Confirm landing page was saved

## Support

For issues or feature requests:
- GitHub: [repository]/issues
- Email: support@mongohacks.com
- Discord: #support channel

---

**Built with:** Next.js 15, Material UI, MongoDB Atlas
**License:** MIT
