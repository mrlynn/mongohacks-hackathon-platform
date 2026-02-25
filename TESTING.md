# Testing Guide

## Overview

This project uses a comprehensive testing setup:

- **Unit/Integration Tests**: Jest + MongoDB Memory Server
- **E2E Tests**: Playwright
- **Test Database**: In-memory MongoDB for isolation

## Quick Start

```bash
# Run all unit/integration tests
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run E2E tests (requires dev server)
npm run test:e2e

# Run E2E tests with UI mode (visual debugging)
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm run test:all
```

## Test Structure

```
src/__tests__/
├── fixtures/          # Test data (users, events, etc.)
│   ├── users.ts
│   └── events.ts
├── utils/             # Test utilities
│   └── db.ts         # Database setup/teardown
└── api/               # API integration tests
    ├── registration.test.ts
    └── judging.test.ts

e2e/                   # End-to-end tests
├── user-journey.spec.ts
└── auth-flow.spec.ts
```

## Unit/Integration Tests

### Test Database

Tests use **MongoDB Memory Server** - an in-memory instance that:
- Starts fresh for each test suite
- Provides complete isolation
- Doesn't affect your development database
- Runs fast (no network I/O)

### Writing Tests

```typescript
import { setupTestDB, teardownTestDB, clearCollections, seedTestData } from "../utils/db";
import { testUsers } from "../fixtures/users";
import { testEvent } from "../fixtures/events";

describe("My Feature", () => {
  beforeAll(async () => {
    await setupTestDB(); // Start in-memory DB
  });

  afterAll(async () => {
    await teardownTestDB(); // Stop in-memory DB
  });

  beforeEach(async () => {
    await clearCollections(); // Clear data between tests
  });

  it("should do something", async () => {
    // Seed test data
    const seeded = await seedTestData({
      users: [testUsers.participant1],
      events: [testEvent],
    });

    // Test logic here
    expect(seeded.users).toHaveLength(1);
  });
});
```

### Test Fixtures

Pre-defined test data in `src/__tests__/fixtures/`:

**Users:**
- `testUsers.admin` - Admin user
- `testUsers.judge` - Judge user
- `testUsers.participant1` - Participant
- `testUsers.participant2` - Another participant

**Events:**
- `testEvent` - Standard open event
- `closedEvent` - Concluded event

**Password:** All test users have password `"password123"`

## E2E Tests (Playwright)

### Running E2E Tests

E2E tests require the dev server running. Playwright will auto-start it if not running.

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/user-journey.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode (pause execution)
npx playwright test --debug
```

### Test Coverage

**Public Pages:**
- ✅ Homepage loads
- ✅ Events listing page
- ✅ Individual event pages
- ✅ Landing pages by slug
- ✅ 404 handling

**Authentication:**
- ✅ Sign in page
- ✅ Sign up navigation

**User Journey:**
- ✅ Landing page → Register flow
- ✅ Events map display
- ✅ Dashboard after login

**Admin Pages:**
- ✅ Events management
- ✅ Landing page builder
- ✅ Registrations view
- ✅ Results/leaderboard

**Judge Pages:**
- ✅ Judging interface

### Authentication in Tests

Some tests require authenticated users. There are two approaches:

**Option 1: Setup authentication state**
```typescript
test('should access protected page', async ({ page }) => {
  // Login via UI first
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Now access protected page
  await page.goto('/admin/events');
});
```

**Option 2: Use storage state** (faster for multiple tests)
```typescript
// In playwright.config.ts
projects: [
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
  },
  {
    name: 'authenticated',
    use: { storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup'],
  },
],
```

## Current Test Coverage

### API Integration Tests

**Registration:**
- ✅ Register user for event
- ✅ Prevent duplicate registrations
- ✅ Reject registration after deadline

**Judging:**
- ✅ Create valid scores
- ✅ Validate score ranges (1-10)
- ✅ Prevent duplicate scores from same judge
- ✅ Calculate average scores correctly
- ✅ Auto-calculate total score

### E2E Tests

**Public:**
- ✅ All public pages load
- ✅ Landing pages work
- ✅ Events map displays

**Protected:**
- ✅ Auth flow works
- ✅ Protected pages redirect to login

## CI/CD Integration

Add to your GitHub Actions:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      
      # Unit/Integration tests
      - run: npm test
      
      # E2E tests
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      
      # Upload test results
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### MongoDB Memory Server Issues

**Error: "Couldn't find mongod binary"**
```bash
# Download MongoDB binaries
npm rebuild mongodb-memory-server --download
```

**Port conflicts:**
```bash
# Check if MongoDB is already running
lsof -i :27017
# Kill process if needed
kill -9 <PID>
```

### Playwright Issues

**Browser not installed:**
```bash
npx playwright install chromium
```

**Port 3000 already in use:**
```bash
# Kill existing Next.js dev server
lsof -i :3000
kill -9 <PID>
```

**Timeout errors:**
- Increase timeout in `playwright.config.ts`
- Check if dev server started successfully
- Verify database connection

### Jest Issues

**Module not found:**
```bash
# Clear Jest cache
npx jest --clearCache
```

**TypeScript errors:**
```bash
# Ensure tsconfig.json includes test files
# Check moduleNameMapper in jest.config.js
```

## Best Practices

**✅ Do:**
- Write tests for critical paths (registration, judging, scoring)
- Use fixtures for consistent test data
- Clear database between tests
- Test error cases (validation, auth failures)
- Keep tests isolated (no dependencies between tests)

**❌ Don't:**
- Use production database in tests
- Share state between tests
- Skip teardown (causes data leaks)
- Test implementation details (test behavior)
- Make tests dependent on execution order

## Adding New Tests

### 1. API Integration Test

```typescript
// src/__tests__/api/my-feature.test.ts
import { setupTestDB, teardownTestDB, clearCollections, seedTestData } from "../utils/db";

describe("My Feature API", () => {
  beforeAll(setupTestDB);
  afterAll(teardownTestDB);
  beforeEach(clearCollections);

  it("should work", async () => {
    const data = await seedTestData({ users: [testUsers.admin] });
    // Test logic
  });
});
```

### 2. E2E Test

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/my-page');
  await expect(page.locator('h1')).toBeVisible();
});
```

## Coverage Goals

**Current:**
- API Tests: ~40% coverage
- E2E Tests: Critical paths covered

**Target:**
- API Tests: 80% coverage
- E2E Tests: All user-facing flows

**Priority Areas to Add:**
- [ ] Team creation/joining flow
- [ ] Project submission with validation
- [ ] Admin role assignment
- [ ] CSV export functionality
- [ ] Landing page builder interactions
- [ ] Email validation flows

---

**Status:** ✅ Test infrastructure complete  
**Last Updated:** 2026-02-25  
**Version:** 1.0
