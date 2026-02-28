# Spec Updates - February 28, 2026

## Summary
Today we shipped 5 major features requiring spec.md documentation:
1. Registration Flow Enhancements (wizard, OAuth, validation)
2. Email Verification System (complete with action gates)
3. User Management (ban/delete for admins)
4. AI Builder Prompt Generator
5. Bug fixes (project idea generator)

---

## Recommended spec.md Updates

### Section 2: User Management & Authentication

**ADD after "Admin impersonation":**

#### Email Verification
- Token-based verification (24-hour expiry)
- Verification email with branded template
- Resend functionality (POST /api/auth/resend-verification)
- Action gates on project submission, team creation, Atlas provisioning
- Auth enforcement: all providers check banned/deleted status

**User Model Fields Added:**
```typescript
emailVerified?: boolean;
emailVerificationToken?: string;  // select: false
emailVerificationExpiry?: Date;
```

#### User Moderation
- Ban/unban users (POST /api/admin/users/[userId]/ban)
- Soft delete (DELETE /api/admin/users/[userId])
- Ban reason tracking
- Security: Cannot ban/delete super_admins
- Hierarchical control: Only super_admins can moderate admins
- Admin UI: Ban/Delete buttons with confirmations

**User Model Fields Added:**
```typescript
banned?: boolean;
bannedAt?: Date;
bannedReason?: string;
deletedAt?: Date;
```

---

### Section 3: Registration & Participants

**ADD after "Dynamic, configurable registration forms":**

#### Enhanced Registration UX
- 3-step progressive disclosure wizard (Material UI Stepper)
  - Step 1: Account (email, password, OAuth)
  - Step 2: Profile (name, bio, skills, GitHub)
  - Step 3: Custom questions
- Session storage persistence
- Password strength meter (0-100 score, visual indicator)
- Debounced email validation (300ms)
- GitHub OAuth with auto-populate (name, email, bio, company, location)
- Registration confirmation emails with calendar ICS

**User Model Fields Added:**
```typescript
githubUsername?: string;
bio?: string;
company?: string;
location?: string;
```

**New Components:**
- RegistrationWizard.tsx, StepOne/Two/Three.tsx
- PasswordStrengthMeter.tsx
- OAuthButtons.tsx

---

### Section 9: AI-Powered Project Suggestions

**ADD new subsection:**

#### Builder Prompt Generation
Generate copy-paste prompts for coding assistants (Claude, ChatGPT, Copilot).

**Features:**
- Template-based generation (no AI calls for base prompt)
- 3 workflow variants: full-scaffold, backend-first, frontend-first
- Optional GPT-4o enhancement (~$0.01-0.02): adds architecture patterns, quick wins, pitfalls
- Copy to clipboard + download as .md
- Markdown preview with syntax highlighting
- Analytics tracking (generation/copy/download counts)

**API Routes:**
- GET /api/project-suggestions/[id]/builder-prompt?variant=full-scaffold
- POST /api/project-suggestions/[id]/builder-prompt (enhanced)
- POST /api/project-suggestions/[id]/builder-prompt/track (analytics)

**ProjectIdea Model Extension:**
```typescript
builderPrompts?: {
  fullScaffold?: { generatedAt, enhanced, downloadCount, copyCount };
  backendFirst?: { ... };
  frontendFirst?: { ... };
};
```

**New Components:**
- BuilderPromptPanel.tsx
- VariantSelector.tsx
- PromptPreview.tsx
- PromptActions.tsx

---

### Section 16: Email System

**ADD new templates:**

#### New Email Templates
- **emailVerificationEmail(name, verificationUrl)**
  - Branded template with CTA
  - 24-hour expiration notice
  - Benefits explanation
- **registrationConfirmationEmail(name, eventName, date, location, dashboardUrl)**
  - Event details
  - Calendar ICS generator
  - Google/Outlook calendar links

**Email Sending Pattern:**
- Fire-and-forget (doesn't block responses)
- Registration sends 2 emails: confirmation + verification

---

## Bug Fixes Section

**Project Idea Generator:**
- Fixed undefined array handling (.join() on undefined)
- Added defensive defaults: eventCategories || []
- Safe fallbacks: teamSize || 1, timeCommitment || 24
- Fallback strings: 'Open Theme', 'Any', 'Mixed'

---

## Deployment Stats

- **Date**: February 28, 2026
- **Commits**: 10 (c9b5240..10be98d)
- **Files**: 31 changed
- **Lines**: ~3,600 added
- **Build**: 4.7s, 0 errors
- **Routes**: 5 new API routes
- **Cost**: ~$2.50 total, 97% cache hit

**New Routes:**
- /api/auth/verify-email
- /api/auth/resend-verification
- /api/admin/users/[userId]/ban
- /api/project-suggestions/[id]/builder-prompt
- /verify-success

---

## Action Items

[ ] Review this update document
[ ] Merge updates into main spec.md
[ ] Update feature status indicators
[ ] Add new routes to API reference
[ ] Update README if needed
