# Scripts Directory

Utility scripts for MongoHacks platform development and testing.

## Available Scripts

### `seed-test-users.ts`

Creates test user accounts for all 8 platform roles.

**Usage:**
```bash
npx tsx scripts/seed-test-users.ts
```

**What it creates:**
- super_admin: `super@mongohacks.test` / `SuperAdmin123!`
- admin: `admin@mongohacks.test` / `Admin123!`
- organizer: `organizer@mongohacks.test` / `Organizer123!`
- marketer: `marketer@mongohacks.test` / `Marketer123!`
- partner: `partner@mongohacks.test` / `Partner123!`
- judge: `judge@mongohacks.test` / `Judge123!`
- mentor: `mentor@mongohacks.test` / `Mentor123!`
- participant: `participant@mongohacks.test` / `Participant123!`

**Notes:**
- Skips users that already exist
- All users have `emailVerified: true` (bypasses email verification)
- Safe to run multiple times (idempotent)

**Cleanup:**
```bash
# Remove all test accounts
mongo mongohacks --eval 'db.users.deleteMany({ email: { $regex: /@mongohacks\.test$/ } })'
```

---

## Prerequisites

- Node.js 18+ with `tsx` installed (`npm install -D tsx`)
- MongoDB connection configured in `.env.local`
- `@/lib/db/connection` and `@/lib/db/models/User` available

---

## Adding New Scripts

When adding new scripts:
1. Use TypeScript (`.ts` extension)
2. Import from `@/` alias (Next.js path alias)
3. Add documentation to this README
4. Handle errors gracefully
5. Use `process.exit(0)` on success, `process.exit(1)` on failure

---

**Last Updated:** March 1, 2026
