# Registration Flow Enhancements - Specification

**Created:** 2026-02-28  
**Status:** Planning Phase  
**Owner:** Platform Team  
**Priority:** High (User Acquisition & Conversion)

---

## Executive Summary

Enhance the public registration flow to increase conversion rates, reduce friction, and improve user onboarding. Current basic flow works but lacks modern UX patterns that drive higher completion rates.

**Expected Impact:**
- 📈 **Conversion Rate:** 40% → 65% (+25% lift)
- ⏱️ **Time to Register:** Reduced by 30-40%
- 🎯 **Quality Signups:** Higher with email verification
- 🔄 **Return Users:** Better with OAuth (no password management)

**Timeline:** 3 phases, ~10-15 hours total

---

## Current State

### What Exists ✅
- Basic registration form at `/events/{eventId}/register`
- User + Participant record creation
- Auto-sign-in after registration
- Terms acceptance checkbox
- Landing page CTAs linked
- SMTP email configured (Gmail + nodemailer)

### Current Flow
```
Landing Page → Register Form → Auto Sign-In → Event Hub
```

### Infrastructure Available
- ✅ NextAuth v5 (ready for OAuth providers)
- ✅ Material UI components (Stepper, TextField, etc.)
- ✅ Email service (`src/lib/email/email-service.ts`)
- ✅ Email templates (`src/lib/email/templates.ts`)
- ✅ MongoDB (store partial progress)
- ✅ Domain ready (`devhacks.dev` for OAuth callbacks)

---

## Enhancement Phases

### 🔥 Phase 1: Reduce Friction (2-3 hours)

**Goal:** Remove barriers to signup completion

#### 1.1 Progressive Disclosure (Multi-Step Wizard)
**Status:** ⬜ Not Started  
**Priority:** P0 (Highest Impact)  
**Time Estimate:** 1-2 hours  

**Implementation:**
- [ ] Install/import Material UI Stepper component
- [ ] Create 3-step wizard layout component
- [ ] **Step 1:** Email + Password (required)
  - [ ] Real-time email validation
  - [ ] Password strength meter
  - [ ] "Already have an account?" link
- [ ] **Step 2:** Profile (required)
  - [ ] Name, bio, skills
  - [ ] Auto-suggest username from email
  - [ ] Avatar upload (optional)
- [ ] **Step 3:** Preferences (optional, skippable)
  - [ ] T-shirt size
  - [ ] Dietary restrictions
  - [ ] Accessibility needs
- [ ] Save partial progress to session storage
- [ ] Back/Next/Skip navigation
- [ ] Progress indicator (Step 1 of 3)

**Success Metrics:**
- Completion rate increase: 40% → 65%
- Time to complete: <2 minutes

**Files to Create/Modify:**
```
src/components/registration/RegistrationWizard.tsx (new)
src/components/registration/StepOne.tsx (new)
src/components/registration/StepTwo.tsx (new)
src/components/registration/StepThree.tsx (new)
src/app/(app)/events/[eventId]/register/page.tsx (modify)
```

---

#### 1.2 Smart Defaults & Real-Time Validation
**Status:** ⬜ Not Started  
**Priority:** P0  
**Time Estimate:** 1 hour  

**Implementation:**
- [ ] Install Zod validation library (if not present)
- [ ] Create validation schemas for each step
- [ ] Email format check (real-time, debounced 300ms)
- [ ] Password strength meter with visual feedback
  - [ ] Minimum 8 characters
  - [ ] Mix of letters, numbers, symbols
  - [ ] Color-coded: weak (red) → medium (yellow) → strong (green)
- [ ] Check for existing account (helpful redirect)
- [ ] Auto-detect timezone from browser (`Intl.DateTimeFormat`)
- [ ] Auto-suggest username from email (first part before @)
- [ ] Form field error messages (inline, not modal)

**Success Metrics:**
- Form errors reduced by 50%
- Re-submission attempts reduced

**Files to Create/Modify:**
```
src/lib/validation/registration-schemas.ts (new)
src/components/registration/PasswordStrengthMeter.tsx (new)
src/hooks/useRegistrationValidation.ts (new)
```

---

#### 1.3 OAuth Social Sign-Up (GitHub)
**Status:** ⬜ Not Started  
**Priority:** P1  
**Time Estimate:** 30 minutes (local), +30 min (production)  

**Prerequisites:**
- [ ] GitHub OAuth app created (https://github.com/settings/developers)
- [ ] Callback URL configured: `http://localhost:3000/api/auth/callback/github` (dev)
- [ ] Callback URL configured: `https://devhacks.dev/api/auth/callback/github` (prod)
- [ ] Environment variables set (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`)

**Implementation:**
- [ ] Add GitHub provider to `src/lib/auth.ts`
- [ ] Auto-populate profile from GitHub data:
  - [ ] Name, email, avatar
  - [ ] Bio, company, location
  - [ ] GitHub username (link to profile)
- [ ] Add "Sign up with GitHub" button to registration page
- [ ] Style OAuth button (GitHub branding guidelines)
- [ ] Handle OAuth errors gracefully
- [ ] Link GitHub account post-registration (optional)

**Success Metrics:**
- 40% of registrations via OAuth (industry standard)
- Reduced password reset requests

**Files to Create/Modify:**
```
src/lib/auth.ts (modify - add GitHub provider)
src/components/registration/OAuthButtons.tsx (new)
.env.local (add GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
```

---

#### 1.4 OAuth Social Sign-Up (Google)
**Status:** ⬜ Not Started  
**Priority:** P2  
**Time Estimate:** 30 minutes  

**Prerequisites:**
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created (Web application)
- [ ] Callback URL configured: `http://localhost:3000/api/auth/callback/google` (dev)
- [ ] Callback URL configured: `https://devhacks.dev/api/auth/callback/google` (prod)
- [ ] Environment variables set (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)

**Implementation:**
- [ ] Add Google provider to `src/lib/auth.ts`
- [ ] Add "Sign up with Google" button
- [ ] Style OAuth button (Google branding guidelines)
- [ ] Handle OAuth errors gracefully

**Success Metrics:**
- Combined OAuth usage: 50-60% of registrations

**Files to Create/Modify:**
```
src/lib/auth.ts (modify - add Google provider)
src/components/registration/OAuthButtons.tsx (modify)
.env.local (add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
```

---

#### 1.5 Email Verification (Optional/Soft Gate)
**Status:** ⬜ Not Started  
**Priority:** P2  
**Time Estimate:** 1 hour  

**Implementation:**
- [ ] Generate verification token on registration
- [ ] Send verification email with magic link
- [ ] Create `/verify-email?token=xxx` route
- [ ] Allow access without verification (soft gate)
- [ ] Show "unverified" badge on profile
- [ ] Add "Resend verification email" option
- [ ] Auto-verify on email click
- [ ] Store verification status in User model

**Email Template:**
- [ ] Create `emailVerificationEmail()` in templates.ts
- [ ] Subject: "Verify your DevHacks email"
- [ ] Body: Welcome message + verify button + ignore notice
- [ ] Expiry: 24 hours

**Success Metrics:**
- 70%+ verification rate within 24 hours
- Reduced spam/fake signups

**Files to Create/Modify:**
```
src/lib/email/templates.ts (modify - add emailVerificationEmail)
src/app/verify-email/page.tsx (new)
src/api/auth/verify-email/route.ts (new)
src/lib/db/models/User.ts (modify - add emailVerified, verificationToken)
```

---

### 💎 Phase 2: Enhance Onboarding (3-4 hours)

**Goal:** Guide users to activation, reduce drop-off after registration

#### 2.1 Registration Confirmation Email
**Status:** ⬜ Not Started  
**Priority:** P0  
**Time Estimate:** 1 hour  

**Implementation:**
- [ ] Create `registrationConfirmationEmail()` template
- [ ] Trigger on successful registration
- [ ] Include event details:
  - [ ] Event name, date, time, location
  - [ ] Registration confirmation number
  - [ ] Link to event dashboard
- [ ] Add calendar invite (.ics attachment)
  - [ ] Use `ics` npm package
  - [ ] Include event dates
  - [ ] Add to Google Calendar link
  - [ ] Add to Outlook link
- [ ] "What to bring" checklist
- [ ] Links to resources (rules, Discord/Slack)

**Success Metrics:**
- Email open rate: >60%
- Calendar invite acceptance: >40%
- Reduced no-show rate

**Files to Create/Modify:**
```
src/lib/email/templates.ts (modify - add registrationConfirmationEmail)
src/lib/calendar/ics-generator.ts (new)
src/app/api/events/[eventId]/register/route.ts (modify - trigger email)
package.json (add "ics" dependency)
```

---

#### 2.2 Post-Registration Onboarding Flow
**Status:** ⬜ Not Started  
**Priority:** P1  
**Time Estimate:** 2 hours  

**Implementation:**
- [ ] Install product tour library (Intro.js or Tour.js)
- [ ] Create welcome modal (first visit only)
  - [ ] "Welcome to {Event Name}!"
  - [ ] Quick orientation (3-4 slides)
  - [ ] Dismissible but re-triggerable
- [ ] Add onboarding checklist:
  - [ ] ☐ Complete your profile
  - [ ] ☐ Join or create a team
  - [ ] ☐ Review the challenge brief
  - [ ] ☐ Connect on Discord/Slack
- [ ] Progress indicator: "You're 25% ready!"
- [ ] Show tooltips on first visit:
  - [ ] Team browser
  - [ ] Project submission
  - [ ] Resources section
- [ ] Persist completion state in user record

**Success Metrics:**
- Onboarding completion: >70%
- Time to first team join: reduced by 30%
- Support tickets reduced by 20%

**Files to Create/Modify:**
```
src/components/onboarding/WelcomeModal.tsx (new)
src/components/onboarding/OnboardingChecklist.tsx (new)
src/components/onboarding/ProductTour.tsx (new)
src/lib/db/models/User.ts (modify - add onboardingComplete)
src/app/(app)/events/[eventId]/page.tsx (modify - trigger onboarding)
package.json (add "intro.js" or "@sjmc11/tourguidejs")
```

---

#### 2.3 Team Matching / Find Teammates
**Status:** ⬜ Not Started  
**Priority:** P2  
**Time Estimate:** 2 hours  

**Implementation:**
- [ ] Create `/events/{eventId}/find-teammates` page
- [ ] Show participants looking for teams:
  - [ ] Profile cards with avatar, name, bio
  - [ ] Skills displayed as chips
  - [ ] "Looking for: Frontend dev, Designer"
  - [ ] "Send team invite" button
- [ ] Filter by skills/interests (reuse filter components!)
- [ ] Sort by: recently joined, most relevant skills
- [ ] Add "I'm looking for teammates" toggle to profile
- [ ] WebSocket for real-time updates (optional)

**Success Metrics:**
- 80%+ of solo participants find teams
- Team formation time: reduced by 50%
- Solo dropout rate: reduced by 30%

**Files to Create/Modify:**
```
src/app/(app)/events/[eventId]/find-teammates/page.tsx (new)
src/components/teams/TeammateCard.tsx (new)
src/components/teams/TeamInviteDialog.tsx (new)
src/lib/db/models/Participant.ts (modify - add lookingForTeam)
```

---

### 🚀 Phase 3: Conversion Optimization (4-5 hours)

**Goal:** Optimize funnel, drive viral growth, measure impact

#### 3.1 Landing Page → Registration Funnel Optimization
**Status:** ⬜ Not Started  
**Priority:** P2  
**Time Estimate:** 2 hours  

**Implementation:**
- [ ] Add social proof: "127 developers already registered"
  - [ ] Live registration count from database
  - [ ] Update every 30 seconds (WebSocket or polling)
- [ ] Countdown timer: "Early bird ends in 3 days"
  - [ ] Dynamic calculation
  - [ ] Hide when deadline passed
- [ ] Exit intent popup (desktop only)
  - [ ] Trigger when mouse leaves viewport
  - [ ] Offer: "Don't miss out! Register now"
  - [ ] Optional: discount code, swag preview
  - [ ] Dismissible, cookie-based (show once per 7 days)
- [ ] A/B test CTA variations:
  - [ ] "Register Now" vs "Join the Hackathon"
  - [ ] "Secure Your Spot" vs "Start Building"
  - [ ] Track click-through rates
- [ ] Add testimonials section
  - [ ] Pull from past participants
  - [ ] Include photo, quote, GitHub profile link

**Success Metrics:**
- Landing → Registration click-through: +15%
- Exit intent conversion: 5-10%
- Overall registration lift: +20-30%

**Files to Create/Modify:**
```
src/components/landing/SocialProof.tsx (new)
src/components/landing/CountdownTimer.tsx (new)
src/components/landing/ExitIntentModal.tsx (new)
src/components/landing/Testimonials.tsx (new)
src/hooks/useExitIntent.ts (new)
```

---

#### 3.2 Registration Analytics Dashboard
**Status:** ⬜ Not Started  
**Priority:** P2  
**Time Estimate:** 2 hours  

**Implementation:**
- [ ] Choose analytics provider:
  - [ ] Option A: PostHog (open-source, self-hosted)
  - [ ] Option B: Mixpanel (free tier)
  - [ ] Option C: Custom (MongoDB aggregations)
- [ ] Track funnel events:
  - [ ] Landing page view
  - [ ] Register button click
  - [ ] Step 1 completion
  - [ ] Step 2 completion
  - [ ] Step 3 completion (full registration)
- [ ] Track drop-off points (which fields cause abandonment)
- [ ] Track sources: Twitter, email, direct, referral
- [ ] Create admin dashboard at `/admin/analytics`
  - [ ] Funnel visualization (Sankey diagram)
  - [ ] Conversion rate by source
  - [ ] Time to complete registration (histogram)
  - [ ] Cohort analysis (early vs late registrants)
  - [ ] OAuth vs credentials split

**Success Metrics:**
- Data-driven optimization decisions
- Identify and fix drop-off points
- Improve conversion by 10-20%

**Files to Create/Modify:**
```
src/lib/analytics/tracker.ts (new)
src/app/(app)/admin/analytics/page.tsx (new)
src/components/analytics/FunnelChart.tsx (new)
src/components/analytics/SourceBreakdown.tsx (new)
package.json (add analytics dependency)
```

---

#### 3.3 Referral System
**Status:** ⬜ Not Started  
**Priority:** P3  
**Time Estimate:** 2 hours  

**Implementation:**
- [ ] Generate unique referral code per user
- [ ] Create referral tracking system:
  - [ ] Store referrer ID on new user
  - [ ] Track referral chain (multi-level)
- [ ] Add referral UI to user dashboard:
  - [ ] Shareable link
  - [ ] Copy-to-clipboard button
  - [ ] Social share buttons (Twitter, LinkedIn)
- [ ] Leaderboard: Top referrers
  - [ ] Display on event page
  - [ ] Monthly reset option
- [ ] Incentives:
  - [ ] "Invite 3 friends, get early access to swag"
  - [ ] Bonus for team referrals (register as a team)
  - [ ] Raffle entry for top referrers
- [ ] Admin tools:
  - [ ] View referral chains
  - [ ] Export referral data
  - [ ] Manually award incentives

**Success Metrics:**
- 20%+ of registrations via referral
- Viral coefficient: >1.2
- Organic growth acceleration

**Files to Create/Modify:**
```
src/lib/referrals/referral-service.ts (new)
src/components/referrals/ReferralDashboard.tsx (new)
src/components/referrals/ReferralLeaderboard.tsx (new)
src/lib/db/models/Referral.ts (new)
src/lib/db/models/User.ts (modify - add referralCode, referredBy)
```

---

## Implementation Checklist

### Phase 1: Reduce Friction ✅ (Priority)
- [ ] 1.1 Progressive Disclosure Wizard (1-2 hours)
- [ ] 1.2 Smart Validation & Defaults (1 hour)
- [ ] 1.3 GitHub OAuth (30 min local + 30 min prod)
- [ ] 1.4 Google OAuth (30 min)
- [ ] 1.5 Email Verification (1 hour)

**Phase 1 Total:** 4-5 hours  
**Phase 1 Impact:** Highest (conversion +25%)

---

### Phase 2: Enhance Onboarding ✨
- [ ] 2.1 Registration Confirmation Email (1 hour)
- [ ] 2.2 Post-Registration Onboarding (2 hours)
- [ ] 2.3 Team Matching / Find Teammates (2 hours)

**Phase 2 Total:** 5 hours  
**Phase 2 Impact:** High (activation +30%)

---

### Phase 3: Conversion Optimization 📊
- [ ] 3.1 Landing Page Funnel Optimization (2 hours)
- [ ] 3.2 Registration Analytics Dashboard (2 hours)
- [ ] 3.3 Referral System (2 hours)

**Phase 3 Total:** 6 hours  
**Phase 3 Impact:** Medium (long-term growth)

---

## Prerequisites & Dependencies

### Environment Variables Needed
```env
# OAuth (Phase 1)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth (already configured)
NEXTAUTH_URL=https://devhacks.dev  # production
NEXTAUTH_SECRET=your_secret_here

# Email (already configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=michael@netpad.io
SMTP_PASS=rriqphmmbtehmpyv
FROM_EMAIL=noreply@netpad.io

# Analytics (Phase 3, optional)
POSTHOG_KEY=your_posthog_key  # or Mixpanel
```

### NPM Packages to Install
```bash
# Phase 1
npm install zod  # validation schemas (if not present)

# Phase 2
npm install ics  # calendar invites
npm install @sjmc11/tourguidejs  # product tour

# Phase 3 (optional)
npm install posthog-js  # analytics
```

### Domain Configuration
- [ ] DNS: Point `devhacks.dev` to deployment (Vercel/other)
- [ ] HTTPS: Enabled (automatic on `.dev` TLD)
- [ ] Deployment: Vercel/Netlify with custom domain

---

## Testing Checklist

### Unit Tests
- [ ] Registration wizard step validation
- [ ] Password strength calculation
- [ ] Email format validation
- [ ] OAuth profile mapping
- [ ] Referral code generation

### Integration Tests
- [ ] Full registration flow (3 steps)
- [ ] OAuth sign-up (GitHub, Google)
- [ ] Email verification flow
- [ ] Onboarding checklist state
- [ ] Calendar invite generation

### E2E Tests
- [ ] Landing page → Register → Dashboard
- [ ] OAuth → Auto-populate profile
- [ ] Registration → Confirmation email sent
- [ ] First login → Onboarding triggered
- [ ] Referral link → Track referrer

### Manual Testing
- [ ] Mobile responsive (all steps)
- [ ] Desktop browsers (Chrome, Firefox, Safari)
- [ ] OAuth flow on production domain
- [ ] Email delivery (spam folder check)
- [ ] Timezone detection accuracy

---

## Success Metrics & KPIs

### Primary Metrics
| Metric | Current | Target | Phase |
|--------|---------|--------|-------|
| **Conversion Rate** | ~40% | 65% | 1 |
| **Time to Register** | ~5 min | <2 min | 1 |
| **OAuth Adoption** | 0% | 40-50% | 1 |
| **Email Verification** | 0% | 70% | 1 |
| **Onboarding Completion** | N/A | 70% | 2 |
| **Team Formation Time** | ~60 min | <30 min | 2 |
| **No-Show Rate** | ~30% | <15% | 2 |
| **Referral Share** | 0% | 20% | 3 |

### Secondary Metrics
- Form error rate (reduced by 50%)
- Password reset requests (reduced by 60% with OAuth)
- Support tickets (reduced by 20%)
- Return user registration (2x faster)

---

## Rollout Strategy

### Option A: Sequential (Recommended)
1. **Week 1:** Phase 1 (reduce friction) → immediate impact
2. **Week 2:** Phase 2 (onboarding) → improve activation
3. **Week 3:** Phase 3 (optimization) → long-term growth

### Option B: Parallel (Faster)
- Developer A: Phase 1.1-1.2 (wizard + validation)
- Developer B: Phase 1.3-1.4 (OAuth)
- Developer C: Phase 2.1-2.2 (emails + onboarding)

### Option C: MVP First (Minimum Viable)
**Quick Win (4-5 hours):**
1. Progressive disclosure wizard (1.1)
2. Smart validation (1.2)
3. GitHub OAuth (1.3)
4. Registration confirmation email (2.1)

**Ship MVP, measure impact, iterate.**

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **OAuth provider downtime** | High | Fallback to credentials, status page |
| **Email delivery issues** | Medium | Use transactional email service (SendGrid/Resend) |
| **Domain not configured** | High | Test OAuth locally first, deploy when ready |
| **User resistance to wizard** | Low | A/B test single-page vs multi-step |
| **Referral gaming** | Medium | Rate limits, manual review, fraud detection |

---

## Documentation

### For Users
- [ ] Registration help guide (FAQ)
- [ ] OAuth troubleshooting (permission errors)
- [ ] Email verification instructions
- [ ] Referral program terms

### For Developers
- [ ] OAuth setup guide (GitHub, Google)
- [ ] Email template customization
- [ ] Analytics integration guide
- [ ] Referral system API documentation

---

## Future Enhancements (Post-Launch)

**Not in scope for initial rollout:**
- LinkedIn OAuth (lower priority for developer audience)
- SMS verification (cost, not needed for hackathons)
- CAPTCHA (add if spam becomes an issue)
- Magic link sign-in (NextAuth already supports via email)
- Progressive profiling (collect data over time, not upfront)
- Personalized recommendations (team/project suggestions based on ML)

---

## Status Tracking

**Last Updated:** 2026-02-28  
**Progress:** 0/10 enhancements complete (0%)  
**Phase 1 Progress:** 0/5 items (0%)  
**Phase 2 Progress:** 0/3 items (0%)  
**Phase 3 Progress:** 0/3 items (0%)

**Next Action:** Choose starting point (recommended: 1.1 Progressive Disclosure)

---

## Related Documents

- **Current Registration:** `src/app/(app)/events/[eventId]/register/page.tsx`
- **Email Service:** `src/lib/email/email-service.ts`
- **Email Templates:** `src/lib/email/templates.ts`
- **NextAuth Config:** `src/lib/auth.ts`
- **User Model:** `src/lib/db/models/User.ts`

---

## Questions for Review

**Before starting:**
- [ ] Which phase should we prioritize first?
- [ ] OAuth: GitHub only, or add Google too?
- [ ] Email verification: Required or optional?
- [ ] Analytics: PostHog, Mixpanel, or custom?
- [ ] Domain: When will `devhacks.dev` be deployed?
- [ ] Timeline: Sprint (1 week) or marathon (3 weeks)?

---

**END OF SPEC**
