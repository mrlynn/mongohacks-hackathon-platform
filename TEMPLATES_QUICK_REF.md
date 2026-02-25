# Landing Page Templates - Quick Reference

## Visual Guide

### 🌿 Modern Template
```
┌─────────────────────────────────────┐
│  🌲 CLEAN FOREST GREEN HERO 🌲     │
│                                     │
│     Build the Future with MongoDB  │
│     Professional • Trustworthy     │
│                                     │
│        [Register Now]              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           About Section             │
│  📝 Long-form description text      │
│      Elegant typography             │
└─────────────────────────────────────┘

┌────────┬────────┬────────┐
│  🏆    │  🥈    │  🥉    │
│ $5,000 │ $3,000 │ $1,000 │
│ 1st    │ 2nd    │ 3rd    │
└────────┴────────┴────────┘
```

**Colors:**
- `#00684A` - Forest green (main)
- `#13AA52` - Light green (accent)
- White backgrounds
- Professional gray text

**Use When:**
- Corporate hackathons
- Enterprise sponsors
- Professional developer events
- Established organizations

---

### 💥 Bold Template
```
┌─────────────────────────────────────┐
│  ⚡ EXPLOSIVE GRADIENT HERO ⚡      │
│  🔵🔷🟣 BLUE → PURPLE GRADIENT      │
│                                     │
│    CODE. COMPETE. CONQUER.         │
│    High Energy • Exciting          │
│                                     │
│       【REGISTER NOW】             │
└─────────────────────────────────────┘

╔═══════════════════════════════════╗
║  /////  About Section  /////      ║
║  Angular dividers                 ║
║  Diagonal shapes                  ║
╚═══════════════════════════════════╝

┌──────────┬──────────┬──────────┐
│  🥇      │  🥈      │  🥉      │
│ GOLD     │ SILVER   │ BRONZE   │
│ GRADIENT │ GRADIENT │ GRADIENT │
│ $10,000  │  $5,000  │  $2,500  │
└──────────┴──────────┴──────────┘
```

**Colors:**
- `#0068F9` - Electric blue
- `#B039F8` - Vibrant purple
- Gradients everywhere
- High contrast

**Use When:**
- Student hackathons
- Innovation challenges
- Youth-focused events
- High-energy competitions

---

### 🖥️ Tech Template
```
┌─────────────────────────────────────┐
│ █ DARK TERMINAL BACKGROUND █       │
│ 🟢 NEON GREEN GLOWING TEXT 🟢      │
│                                     │
│  > hackathon.execute()_            │
│  // Dark • Futuristic              │
│                                     │
│       $ register_now               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ > About                             │
│ ┃ Monospace terminal text           │
│ ┃ Code-style formatting             │
│ ┃ Green on dark background          │
└─────────────────────────────────────┘

┌────────┬────────┬────────┐
│ [1st]  │ [2nd]  │ [3rd]  │
│ $5,000 │ $3,000 │ $1,000 │
│ ░░░░░░ │ ░░░░░░ │ ░░░░░░ │
└────────┴────────┴────────┘
```

**Colors:**
- `#0a0e27` - Deep space blue (background)
- `#00ED64` - Neon green (accent)
- `#B0FFB0` - Light green (text)
- Monospace font (Courier New)

**Use When:**
- Developer conferences
- CTF/security events
- Technical hackathons
- Cyberpunk-themed events

---

## Decision Tree

```
Need a landing page?
│
├─ Professional/Corporate event?
│  └─ ✅ Modern Template
│
├─ Youth/Student event?
│  └─ ✅ Bold Template
│
└─ Developer/Tech-focused?
   └─ ✅ Tech Template
```

## Color Palette Reference

### Modern
```css
--primary: #00684A;      /* Forest green */
--primary-light: #13AA52; /* Light green */
--background: #FFFFFF;
--text: #001E2B;
```

### Bold
```css
--primary: #0068F9;      /* Electric blue */
--secondary: #B039F8;    /* Vibrant purple */
--gradient: linear-gradient(135deg, #0068F9, #B039F8);
--text: #FFFFFF;
```

### Tech
```css
--background: #0a0e27;   /* Deep space */
--primary: #00ED64;      /* Neon green */
--text: #B0FFB0;         /* Light green */
--font: 'Courier New', monospace;
```

## Content Length Recommendations

**Headline:**
- Modern: 5-8 words (professional)
- Bold: 3-5 words (punchy)
- Tech: 2-4 words (command-style)

**Subheadline:**
- All: 10-20 words max
- Focus on value proposition

**About:**
- Modern: 150-250 words
- Bold: 100-150 words
- Tech: 75-125 words (keep it tight)

**Prizes:**
- 3-5 prize tiers recommended
- Include value + description

**Schedule:**
- 5-10 key events
- Include time + description

**FAQ:**
- 5-8 questions max
- Cover: eligibility, prizes, team size, judging

## Example Content

### Modern Template Example

**Headline:** "Build Innovative Solutions with MongoDB"

**Subheadline:** "Join 500+ developers for a 48-hour hackathon focused on creating impactful applications using MongoDB Atlas"

**CTA:** "Register Your Team"

---

### Bold Template Example

**Headline:** "CODE. COMPETE. CONQUER."

**Subheadline:** "48 hours. Unlimited creativity. Epic prizes."

**CTA:** "LET'S GO!"

---

### Tech Template Example

**Headline:** `> hackathon.init()`

**Subheadline:** `// 48h to ship production-grade code`

**CTA:** `$ register_now`

---

## Quick Setup Steps

1. **Go to:** `/admin/events`
2. **Click:** Green web icon (🌐)
3. **Choose:** Template
4. **Set:** URL slug
5. **Fill:** Hero section (required)
6. **Add:** About text (required)
7. **Optional:** Prizes, Schedule, FAQ
8. **Preview:** Check how it looks
9. **Publish:** Go live!

**Time to complete:** 15-30 minutes

---

## Pro Tips

✅ **Do:**
- Use high-quality hero images (1920x1080+)
- Keep copy concise and benefit-driven
- Match tone to template (professional vs. energetic vs. technical)
- Preview on mobile before publishing
- Use consistent time formats in schedule

❌ **Don't:**
- Use generic stock photos
- Write walls of text
- Mix formal and casual language
- Forget to set a descriptive slug
- Skip the about section

---

## Support

**Quick Links:**
- Full Guide: `LANDING_PAGES.md`
- Status Report: `LANDING_PAGE_STATUS.md`
- Issues: GitHub Issues tab

**Need Help?**
- Check documentation first
- Review example content above
- Test preview mode before publishing
- Contact: support@mongohacks.com
