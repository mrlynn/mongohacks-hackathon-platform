# Changelog

All notable changes to the MongoHacks Hackathon Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [2.1.0] - 2026-02-28

### Added

#### Registration Flow Enhancements
- **3-step progressive disclosure wizard** using Material UI Stepper
  - Step 1: Account creation (email, password, OAuth buttons)
  - Step 2: Profile information (name, bio, skills, GitHub username, experience level)
  - Step 3: Event-specific custom questions with dynamic rendering
- **Session storage persistence** across wizard steps to prevent data loss
- **Password strength meter** (0-100 score with visual indicator and color feedback)
- **Debounced email validation** (300ms delay to avoid excessive API calls, real-time format checking)
- **GitHub OAuth integration** with auto-populate:
  - Automatically fills: name, email, avatar, username, bio, company, location from GitHub profile
  - Seamless profile creation with one click
- **Registration confirmation emails** with event details:
  - Calendar ICS attachment (compatible with Google Calendar and Outlook)
  - Event logistics and dashboard link
  - Next steps guidance
- New components:
  - `RegistrationWizard.tsx` - Stepper container with step navigation
  - `StepOne.tsx`, `StepTwo.tsx`, `StepThree.tsx` - Individual wizard steps
  - `PasswordStrengthMeter.tsx` - Visual strength indicator
  - `OAuthButtons.tsx` - GitHub OAuth button component
- Refactored `RegistrationClient.tsx` from 787 lines to 228 lines (improved maintainability)

#### Email Verification System
- **Token-based email verification** (crypto.randomBytes(32), 24-hour expiry)
- **Verification flow**:
  - Registration automatically generates token and sends verification email
  - User clicks verification link → validates token → marks email as verified
  - Redirects to `/verify-success` confirmation page
- **Resend verification functionality** via `POST /api/auth/resend-verification`
  - Works for logged-in users or with email parameter
  - Security: doesn't reveal whether email exists (prevents enumeration)
- **Action gates** (403 Forbidden if email not verified):
  - Project submission (`POST /api/events/[eventId]/projects`)
  - Team creation (`POST /api/events/[eventId]/teams`)
  - Atlas cluster provisioning (`POST /api/atlas/clusters`)
  - Returns consistent error code: `EMAIL_NOT_VERIFIED`
- **Auth enforcement** across all login methods:
  - Credentials provider checks ban/delete status
  - Magic link provider checks ban/delete status
  - 2FA verification checks ban/delete status
  - Banned users see error message with ban reason
- New UI components:
  - `UnverifiedEmailBanner` - Warning alert with resend button
  - `/verify-success` page - Confirmation screen with dashboard/events links
- New email template: `emailVerificationEmail(name, verificationUrl)` with branded design

#### User Management & Moderation
- **Ban/unban users** via `POST /api/admin/users/[userId]/ban`
  - Toggle ban status with optional reason parameter
  - Tracks `bannedAt` timestamp and `bannedReason`
  - Banned users cannot log in (all auth providers blocked)
  - Error message displays ban reason to user
- **Soft delete** via `DELETE /api/admin/users/[userId]`
  - Marks `deletedAt` timestamp but preserves all data
  - Also sets `banned: true` to prevent login
  - Cascades soft delete to Participant record
  - Maintains audit trail for compliance
- **Security controls**:
  - Cannot ban or delete super_admins (immune to moderation)
  - Only super_admins can ban/delete admins (hierarchical permissions)
  - Confirmation dialogs prevent accidental actions
- **Admin UI enhancements** in `UsersView.tsx`:
  - Ban button (orange, BlockIcon) with toggle functionality
  - Delete button (red, DeleteIcon) with confirmation dialog
  - Both disabled for super_admin users
  - Success/error toast notifications for user feedback

#### AI Builder Prompt Generator
- **Generate copy-paste ready prompts** for coding assistants (Claude, ChatGPT, GitHub Copilot)
- **Template-based generation** (no AI calls for base prompt - deterministic and cost-effective)
- **Three workflow variants**:
  - `full-scaffold` - Complete project setup (frontend, backend, database, deployment)
  - `backend-first` - API routes, database schema, business logic, seed data
  - `frontend-first` - Component tree, pages, UI components, state management
- **Prompt structure** includes:
  - Context block (project info, event theme, team details, time budget)
  - Tech stack block (frontend, backend, database, APIs, deployment)
  - Implementation plan (phased timeline from ProjectIdea)
  - Constraints block (judging priorities, event rules, criteria)
  - Variant-specific output instructions
- **Optional GPT-4o enhancement** (~$0.01-0.02 per use):
  - Adds stack-specific architecture patterns
  - 3-5 concrete database schema suggestions with field names/types
  - Specific API endpoint paths with HTTP methods
  - "Quick Wins" section (3 things to build in first hour)
  - "Common Pitfalls" section (3 mistakes to avoid for this stack)
- **UI features**:
  - Copy to clipboard (one-click)
  - Download as `.md` file (named after project)
  - Markdown preview with syntax highlighting (Prism)
  - Token count estimation (~4 chars per token)
  - Visual variant selector (3-chip toggle)
- **Analytics tracking**:
  - Generation timestamp
  - Enhancement status (enhanced vs base)
  - Copy count per variant
  - Download count per variant
- New API routes:
  - `GET /api/project-suggestions/[id]/builder-prompt?variant=full-scaffold`
  - `POST /api/project-suggestions/[id]/builder-prompt` (enhanced version)
  - `POST /api/project-suggestions/[id]/builder-prompt/track` (analytics)
- New components:
  - `BuilderPromptPanel.tsx` - Main container with state management
  - `VariantSelector.tsx` - 3-chip variant toggle
  - `PromptPreview.tsx` - Markdown preview with syntax highlighting
  - `PromptActions.tsx` - Copy/download/enhance buttons
- New service: `builder-prompt-service.ts` with `generateBuilderPrompt()` function

### Fixed

#### Project Idea Generator
- **Fixed `Cannot read properties of undefined (reading 'length')` error** on first button press
- **Root cause**: `buildPrompt()` was calling `.join()` on potentially undefined arrays
- **Solutions implemented**:
  - Added defensive array handling: `eventCategories || []` for all input arrays
  - Added safe defaults in API route:
    - `teamSize: inputs.teamSize || 1`
    - `timeCommitment: inputs.timeCommitment || 24`
    - `complexityPreference: inputs.complexityPreference || 'moderate'`
  - Added fallback strings for empty arrays:
    - Categories: 'Open Theme'
    - Sponsor Products: 'Any'
    - Skill Levels: 'Mixed'
    - Team Composition: 'Full-stack'
    - Languages/Frameworks/DBs: 'Any'
    - Interest Areas: 'Any'
- **Impact**: Prevents crashes on incomplete form submissions, handles missing event metadata gracefully

### Changed

- **User Model** extended with new fields:
  - `emailVerified?: boolean` (default: false)
  - `emailVerificationToken?: string` (select: false, secure)
  - `emailVerificationExpiry?: Date` (24-hour TTL)
  - `githubUsername?: string` (from OAuth)
  - `bio?: string` (from OAuth or registration)
  - `company?: string` (from OAuth)
  - `location?: string` (from OAuth)
  - `banned?: boolean` (default: false)
  - `bannedAt?: Date`
  - `bannedReason?: string`
  - `deletedAt?: Date` (soft delete marker)
- **Participant Model** extended with:
  - `deletedAt?: Date` (cascade soft delete from User)
- **ProjectIdea Model** extended with:
  - `builderPrompts?: { fullScaffold, backendFirst, frontendFirst }` (metadata tracking)
- **Email System** now sends 2 emails on registration:
  - Registration confirmation (event details + calendar ICS)
  - Email verification (24-hour token link)
- **Auth providers** now check `banned` and `deletedAt` status before allowing login

### Database Indexes Added
- `User.banned` - Fast ban status lookups
- `User.deletedAt` - Soft delete queries
- `User.emailVerificationToken` - Sparse index for token validation

### API Routes Added
- `GET /api/auth/verify-email?token=xxx` - Email verification endpoint
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/admin/users/[userId]/ban` - Ban/unban user
- `DELETE /api/admin/users/[userId]` - Soft delete user
- `GET /api/project-suggestions/[id]/builder-prompt` - Generate builder prompt
- `POST /api/project-suggestions/[id]/builder-prompt` - Enhanced builder prompt
- `POST /api/project-suggestions/[id]/builder-prompt/track` - Track analytics

### Pages Added
- `/verify-success` - Email verification success confirmation

### Performance
- Build time: 4.7s (successful, 0 errors)
- Total routes: 172 (5 new)
- Cache hit rate: 97% (excellent efficiency)

### Deployment Stats
- **Date**: February 28, 2026
- **Commits**: 10 (c9b5240..10be98d)
- **Files changed**: 31
- **Lines added**: ~3,600
- **Session cost**: ~$2.50 total

---

## [2.0.0] - 2026-02-XX

### Initial Release
- Complete hackathon management platform
- Event creation and management
- Participant registration and profiles
- Team formation with AI matching
- Project submission and gallery
- AI-powered judging assistance
- RAG knowledge assistant
- Atlas cluster provisioning
- Landing page builder
- Admin analytics dashboard
- Email notification system

---

[Unreleased]: https://github.com/mrlynn/mongohacks-hackathon-platform/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/mrlynn/mongohacks-hackathon-platform/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/mrlynn/mongohacks-hackathon-platform/releases/tag/v2.0.0
