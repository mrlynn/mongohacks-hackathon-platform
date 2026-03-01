# Automated Test Scripts - RBAC User Journeys

**MongoHacks Hackathon Platform - Automated Testing Guide**  
**Last Updated:** March 1, 2026  
**Target Audience:** AI Engineers, QA Automation Engineers

---

## Table of Contents

1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Data Prerequisites](#test-data-prerequisites)
4. [Scripted Walkthroughs by Role](#scripted-walkthroughs-by-role)
5. [Evidence Collection Requirements](#evidence-collection-requirements)
6. [Error Handling & Logging](#error-handling--logging)
7. [Test Report Format](#test-report-format)

---

## Overview

### Purpose

This document provides detailed, automation-ready test scripts for validating RBAC (Role-Based Access Control) across all 8 user roles in the MongoHacks platform.

### Automation Approach

Each test script is structured as:
```
GIVEN   [initial state/prerequisites]
WHEN    [action taken]
THEN    [expected outcome]
ASSERT  [verification checks]
CAPTURE [evidence to collect]
```

### Recommended Tools

- **Browser Automation:** Playwright, Puppeteer, or Selenium
- **API Testing:** Axios, node-fetch
- **Screenshot Tool:** Built-in browser automation screenshot
- **Assertion Library:** Jest, Chai
- **Reporting:** Allure, Mochawesome, or custom JSON

---

## Test Environment Setup

### Prerequisites

```bash
# 1. Install dependencies
npm install playwright @playwright/test

# 2. Set environment variables
export BASE_URL="http://localhost:3000"
export TEST_ENV="local"
export SCREENSHOT_DIR="./test-evidence"
export REPORT_DIR="./test-reports"

# 3. Create test accounts
npx tsx scripts/seed-test-users.ts

# 4. Verify database connection
echo "MONGODB_URI=$MONGODB_URI" >> .env.test

# 5. Create test event (for journey tests)
# This needs to exist for many tests to work
# Store eventId in environment: TEST_EVENT_ID
```

### Test Data Setup

```typescript
// Create a test event for journeys
const testEventData = {
  name: "Test Hackathon 2026",
  slug: "test-hackathon-2026",
  description: "Automated testing event",
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),   // 9 days from now
  location: "Test City, TC",
  status: "upcoming",
  registrationOpen: true
};

// Store this eventId for all tests
const TEST_EVENT_ID = "...";
const TEST_EVENT_SLUG = "test-hackathon-2026";
```

---

## Test Data Prerequisites

Before running automated tests, ensure:

### Required Test Accounts (via seed script)

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| super_admin | super@mongohacks.test | SuperAdmin123! | Platform management tests |
| admin | admin@mongohacks.test | Admin123! | Admin panel tests |
| organizer | organizer@mongohacks.test | Organizer123! | Event management tests |
| marketer | marketer@mongohacks.test | Marketer123! | Analytics & marketing tests |
| partner | partner@mongohacks.test | Partner123! | Partner portal tests |
| judge | judge@mongohacks.test | Judge123! | Judging workflow tests |
| mentor | mentor@mongohacks.test | Mentor123! | Mentor feature tests |
| participant | participant@mongohacks.test | Participant123! | Full hackathon journey |

### Required Test Data

- **1 Test Event** (created, status: upcoming, registrationOpen: true)
- **1 Test Team** (created by participant, needs eventId)
- **1 Test Project** (submitted by participant/team)
- **1 Partner Record** (linked to partner@mongohacks.test)

---

## Scripted Walkthroughs by Role

---

### Role 1: Super Admin

**Test Suite:** `super_admin.spec.ts`

#### Test 1.1: Login & Dashboard Access

```typescript
test('Super Admin: Login and access dashboard', async ({ page }) => {
  // GIVEN: User is on login page
  await page.goto(`${BASE_URL}/login`);
  
  // WHEN: User logs in with super_admin credentials
  await page.fill('input[name="email"]', 'super@mongohacks.test');
  await page.fill('input[name="password"]', 'SuperAdmin123!');
  await page.click('button[type="submit"]');
  
  // THEN: User is redirected to dashboard or admin panel
  await page.waitForURL(/\/(dashboard|admin)/);
  
  // ASSERT: User sees admin navigation
  const adminLink = await page.locator('a[href="/admin"]');
  expect(await adminLink.isVisible()).toBe(true);
  
  // CAPTURE: Screenshot of logged-in state
  await page.screenshot({ path: `${SCREENSHOT_DIR}/super_admin_login.png` });
});
```

#### Test 1.2: Access Global Settings (Super Admin Only)

```typescript
test('Super Admin: Access template settings', async ({ page }) => {
  // GIVEN: Super admin is logged in
  await loginAs(page, 'super@mongohacks.test', 'SuperAdmin123!');
  
  // WHEN: User navigates to /admin/settings/templates
  await page.goto(`${BASE_URL}/admin/settings/templates`);
  
  // THEN: Page loads successfully (no redirect)
  await page.waitForSelector('h1:has-text("Templates")');
  
  // ASSERT: User can see template list or create button
  const createButton = await page.locator('button:has-text("Create"), a:has-text("New Template")');
  expect(await createButton.count()).toBeGreaterThan(0);
  
  // CAPTURE: Screenshot showing access granted
  await page.screenshot({ path: `${SCREENSHOT_DIR}/super_admin_templates.png` });
});
```

#### Test 1.3: User Moderation (Ban/Delete)

```typescript
test('Super Admin: Ban a user', async ({ page }) => {
  // GIVEN: Super admin is logged in and on users page
  await loginAs(page, 'super@mongohacks.test', 'SuperAdmin123!');
  await page.goto(`${BASE_URL}/admin/users`);
  
  // WHEN: Admin clicks ban button for a non-admin user (participant)
  const participantRow = await page.locator('tr:has-text("participant@mongohacks.test")');
  await participantRow.locator('button[aria-label*="Ban"], button:has-text("Ban")').click();
  
  // THEN: Confirmation dialog appears
  await page.waitForSelector('text=/ban this user/i');
  
  // WHEN: Admin confirms ban
  const confirmButton = await page.locator('button:has-text("Confirm"), button:has-text("Ban")').last();
  await confirmButton.click();
  
  // ASSERT: Success message appears
  await page.waitForSelector('text=/banned successfully/i');
  
  // CAPTURE: Screenshot of success state
  await page.screenshot({ path: `${SCREENSHOT_DIR}/super_admin_ban_user.png` });
  
  // CLEANUP: Unban the user for future tests
  await page.reload();
  const bannedRow = await page.locator('tr:has-text("participant@mongohacks.test")');
  await bannedRow.locator('button:has-text("Unban")').click();
  await page.locator('button:has-text("Confirm")').click();
});
```

#### Test 1.4: Ban Another Admin (Should Succeed for Super Admin)

```typescript
test('Super Admin: Can ban another admin', async ({ page }) => {
  // GIVEN: Super admin is logged in and on users page
  await loginAs(page, 'super@mongohacks.test', 'SuperAdmin123!');
  await page.goto(`${BASE_URL}/admin/users`);
  
  // WHEN: Super admin tries to ban admin user
  const adminRow = await page.locator('tr:has-text("admin@mongohacks.test")');
  const banButton = await adminRow.locator('button[aria-label*="Ban"]');
  
  // ASSERT: Ban button is enabled (not disabled)
  expect(await banButton.isDisabled()).toBe(false);
  
  // CAPTURE: Screenshot showing button state
  await page.screenshot({ path: `${SCREENSHOT_DIR}/super_admin_can_ban_admin.png` });
  
  // NOTE: Don't actually ban to avoid breaking other tests
});
```

#### Test 1.5: View All Events

```typescript
test('Super Admin: View all events', async ({ page }) => {
  // GIVEN: Super admin is logged in
  await loginAs(page, 'super@mongohacks.test', 'SuperAdmin123!');
  
  // WHEN: User navigates to /admin/events
  await page.goto(`${BASE_URL}/admin/events`);
  
  // THEN: Events table loads
  await page.waitForSelector('table, [role="table"]');
  
  // ASSERT: At least the test event is visible
  const testEvent = await page.locator('text="Test Hackathon 2026"');
  expect(await testEvent.count()).toBeGreaterThan(0);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/super_admin_events_list.png` });
});
```

---

### Role 2: Admin

**Test Suite:** `admin.spec.ts`

#### Test 2.1: Login & Dashboard Access

```typescript
test('Admin: Login and access admin panel', async ({ page }) => {
  // GIVEN: User is on login page
  await page.goto(`${BASE_URL}/login`);
  
  // WHEN: User logs in with admin credentials
  await page.fill('input[name="email"]', 'admin@mongohacks.test');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  
  // THEN: User is redirected to dashboard or admin panel
  await page.waitForURL(/\/(dashboard|admin)/);
  
  // ASSERT: User sees admin navigation
  const adminLink = await page.locator('a[href="/admin"]');
  expect(await adminLink.isVisible()).toBe(true);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/admin_login.png` });
});
```

#### Test 2.2: Restricted Access to Platform Settings

```typescript
test('Admin: CANNOT access template settings', async ({ page }) => {
  // GIVEN: Admin is logged in
  await loginAs(page, 'admin@mongohacks.test', 'Admin123!');
  
  // WHEN: User tries to navigate to /admin/settings/templates
  await page.goto(`${BASE_URL}/admin/settings/templates`);
  
  // THEN: User is redirected away (not on templates page)
  await page.waitForTimeout(1000); // Wait for redirect
  const currentUrl = page.url();
  
  // ASSERT: URL does not contain "templates"
  expect(currentUrl).not.toContain('/templates');
  expect(currentUrl).toMatch(/\/(admin|dashboard)/); // Redirected to safe location
  
  // CAPTURE: Screenshot showing redirect
  await page.screenshot({ path: `${SCREENSHOT_DIR}/admin_denied_templates.png` });
});
```

#### Test 2.3: User Moderation (Can Ban Participants, Not Admins)

```typescript
test('Admin: Can ban participant but NOT another admin', async ({ page }) => {
  // GIVEN: Admin is logged in and on users page
  await loginAs(page, 'admin@mongohacks.test', 'Admin123!');
  await page.goto(`${BASE_URL}/admin/users`);
  
  // WHEN: Admin views participant user
  const participantRow = await page.locator('tr:has-text("participant@mongohacks.test")');
  const participantBanButton = await participantRow.locator('button[aria-label*="Ban"]');
  
  // ASSERT: Ban button is enabled for participant
  expect(await participantBanButton.isDisabled()).toBe(false);
  
  // WHEN: Admin views super_admin user
  const superAdminRow = await page.locator('tr:has-text("super@mongohacks.test")');
  const superAdminBanButton = await superAdminRow.locator('button[aria-label*="Ban"]');
  
  // ASSERT: Ban button is disabled for super_admin
  expect(await superAdminBanButton.isDisabled()).toBe(true);
  
  // CAPTURE: Screenshot showing both states
  await page.screenshot({ path: `${SCREENSHOT_DIR}/admin_ban_restrictions.png` });
});
```

#### Test 2.4: Create Event

```typescript
test('Admin: Create new event', async ({ page }) => {
  // GIVEN: Admin is logged in
  await loginAs(page, 'admin@mongohacks.test', 'Admin123!');
  
  // WHEN: User navigates to create event page
  await page.goto(`${BASE_URL}/admin/events/new`);
  
  // THEN: Form loads successfully
  await page.waitForSelector('form');
  
  // WHEN: User fills out event form
  await page.fill('input[name="name"]', 'Admin Test Event');
  await page.fill('input[name="slug"]', 'admin-test-event');
  await page.fill('textarea[name="description"]', 'Event created by admin user for testing');
  await page.fill('input[name="location"]', 'Admin City, AC');
  
  // Set dates (7 days from now)
  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const endDate = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
  await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
  await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);
  
  // WHEN: User submits form
  await page.click('button[type="submit"]');
  
  // THEN: Success message or redirect to event list
  await page.waitForURL(/\/admin\/events/);
  
  // ASSERT: New event appears in list
  const newEvent = await page.locator('text="Admin Test Event"');
  expect(await newEvent.count()).toBeGreaterThan(0);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/admin_create_event.png` });
  
  // CLEANUP: Store eventId for cleanup later
  // (In real test, you'd query DB to find and delete this event)
});
```

---

### Role 3: Organizer

**Test Suite:** `organizer.spec.ts`

#### Test 3.1: Login & Limited Admin Panel Access

```typescript
test('Organizer: Access admin panel with limited sidebar', async ({ page }) => {
  // GIVEN: User is on login page
  await page.goto(`${BASE_URL}/login`);
  
  // WHEN: User logs in with organizer credentials
  await page.fill('input[name="email"]', 'organizer@mongohacks.test');
  await page.fill('input[name="password"]', 'Organizer123!');
  await page.click('button[type="submit"]');
  
  // THEN: User is redirected to admin panel
  await page.waitForURL(/\/admin/);
  
  // ASSERT: Limited sidebar is visible
  const sidebar = await page.locator('[role="navigation"], aside');
  expect(await sidebar.isVisible()).toBe(true);
  
  // ASSERT: Events link is visible
  const eventsLink = await page.locator('a[href*="/admin/events"]');
  expect(await eventsLink.isVisible()).toBe(true);
  
  // ASSERT: User management link is NOT visible (organizer restriction)
  const usersLink = await page.locator('a[href*="/admin/users"]');
  expect(await usersLink.count()).toBe(0);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/organizer_limited_sidebar.png` });
});
```

#### Test 3.2: Create and Manage Event

```typescript
test('Organizer: Create event and manage registrations', async ({ page }) => {
  // GIVEN: Organizer is logged in
  await loginAs(page, 'organizer@mongohacks.test', 'Organizer123!');
  
  // WHEN: User creates a new event
  await page.goto(`${BASE_URL}/admin/events/new`);
  await page.fill('input[name="name"]', 'Organizer Test Event');
  await page.fill('input[name="slug"]', 'organizer-test-event');
  await page.fill('textarea[name="description"]', 'Event created by organizer');
  await page.fill('input[name="location"]', 'Org City, OC');
  
  const startDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  const endDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
  await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
  await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);
  
  await page.click('button[type="submit"]');
  
  // THEN: Event is created
  await page.waitForURL(/\/admin\/events/);
  
  // WHEN: User navigates to event edit page
  await page.click('text="Organizer Test Event"');
  await page.waitForURL(/\/admin\/events\/[a-f0-9]+\/edit/);
  
  // ASSERT: Edit form loads
  const nameInput = await page.locator('input[name="name"]');
  expect(await nameInput.inputValue()).toBe('Organizer Test Event');
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/organizer_manage_event.png` });
});
```

#### Test 3.3: Restricted Access to User Management

```typescript
test('Organizer: CANNOT access user management', async ({ page }) => {
  // GIVEN: Organizer is logged in
  await loginAs(page, 'organizer@mongohacks.test', 'Organizer123!');
  
  // WHEN: User tries to navigate to /admin/users
  await page.goto(`${BASE_URL}/admin/users`);
  
  // THEN: User is redirected away
  await page.waitForTimeout(1000);
  const currentUrl = page.url();
  
  // ASSERT: Not on users page
  expect(currentUrl).not.toContain('/users');
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/organizer_denied_users.png` });
});
```

---

### Role 4: Marketer

**Test Suite:** `marketer.spec.ts`

#### Test 4.1: Access Analytics Dashboard

```typescript
test('Marketer: Access analytics dashboard', async ({ page }) => {
  // GIVEN: Marketer is logged in
  await loginAs(page, 'marketer@mongohacks.test', 'Marketer123!');
  
  // WHEN: User navigates to /admin/analytics
  await page.goto(`${BASE_URL}/admin/analytics`);
  
  // THEN: Page loads successfully
  await page.waitForSelector('h1:has-text("Analytics"), [data-testid="analytics-dashboard"]');
  
  // ASSERT: Charts/metrics are visible
  const metrics = await page.locator('[data-testid="metric"], .metric, .chart');
  expect(await metrics.count()).toBeGreaterThan(0);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/marketer_analytics.png` });
});
```

#### Test 4.2: Edit Landing Page

```typescript
test('Marketer: Edit event landing page', async ({ page }) => {
  // GIVEN: Marketer is logged in and test event exists
  await loginAs(page, 'marketer@mongohacks.test', 'Marketer123!');
  
  // WHEN: User navigates to landing page editor
  await page.goto(`${BASE_URL}/admin/events/${TEST_EVENT_ID}/landing-page`);
  
  // THEN: Editor loads
  await page.waitForSelector('form, [contenteditable], textarea');
  
  // WHEN: User edits hero headline
  const headlineInput = await page.locator('input[name*="headline"], textarea[name*="headline"]');
  await headlineInput.fill('Updated Headline for Testing');
  
  // WHEN: User saves changes
  await page.click('button:has-text("Save"), button[type="submit"]');
  
  // ASSERT: Success message appears
  await page.waitForSelector('text=/saved|updated/i');
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/marketer_edit_landing.png` });
});
```

#### Test 4.3: Restricted Access to Event Creation

```typescript
test('Marketer: CANNOT create new event', async ({ page }) => {
  // GIVEN: Marketer is logged in
  await loginAs(page, 'marketer@mongohacks.test', 'Marketer123!');
  
  // WHEN: User tries to navigate to /admin/events/new
  await page.goto(`${BASE_URL}/admin/events/new`);
  
  // THEN: User is redirected away
  await page.waitForTimeout(1000);
  const currentUrl = page.url();
  
  // ASSERT: Not on create event page
  expect(currentUrl).not.toContain('/new');
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/marketer_denied_create_event.png` });
});
```

---

### Role 5: Partner (Sponsor)

**Test Suite:** `partner.spec.ts`

#### Test 5.1: Login & Partner Portal Access

```typescript
test('Partner: Login and access partner portal', async ({ page }) => {
  // GIVEN: User is on login page
  await page.goto(`${BASE_URL}/login`);
  
  // WHEN: User logs in with partner credentials
  await page.fill('input[name="email"]', 'partner@mongohacks.test');
  await page.fill('input[name="password"]', 'Partner123!');
  await page.click('button[type="submit"]');
  
  // THEN: User is redirected to partner portal
  await page.waitForURL(/\/partner/);
  
  // ASSERT: Partner dashboard is visible
  const heading = await page.locator('h1:has-text("Partner"), h1:has-text("Sponsor")');
  expect(await heading.count()).toBeGreaterThan(0);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/partner_portal.png` });
});
```

#### Test 5.2: Restricted Access to Admin Panel

```typescript
test('Partner: CANNOT access admin panel (redirects to /partner)', async ({ page }) => {
  // GIVEN: Partner is logged in
  await loginAs(page, 'partner@mongohacks.test', 'Partner123!');
  
  // WHEN: User tries to navigate to /admin
  await page.goto(`${BASE_URL}/admin`);
  
  // THEN: User is redirected to /partner
  await page.waitForURL(/\/partner/);
  
  // ASSERT: On partner portal, not admin
  expect(page.url()).toContain('/partner');
  expect(page.url()).not.toContain('/admin');
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/partner_denied_admin.png` });
});
```

#### Test 5.3: Manage Prizes

```typescript
test('Partner: Add and manage prizes', async ({ page }) => {
  // GIVEN: Partner is logged in
  await loginAs(page, 'partner@mongohacks.test', 'Partner123!');
  
  // WHEN: User navigates to prizes management
  await page.goto(`${BASE_URL}/partner/prizes`);
  
  // THEN: Prizes page loads
  await page.waitForSelector('h1:has-text("Prizes"), button:has-text("Add"), button:has-text("Create")');
  
  // WHEN: User clicks add prize
  await page.click('button:has-text("Add Prize"), button:has-text("Create Prize")');
  
  // THEN: Prize form appears
  await page.waitForSelector('form, [role="dialog"]');
  
  // WHEN: User fills prize details
  await page.fill('input[name="title"]', 'Test Partner Prize');
  await page.fill('textarea[name="description"]', 'Prize for testing automation');
  await page.fill('input[name="value"]', '1000');
  
  // WHEN: User submits
  await page.click('button[type="submit"]');
  
  // ASSERT: Prize appears in list
  await page.waitForSelector('text="Test Partner Prize"');
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/partner_add_prize.png` });
});
```

---

### Role 6: Judge

**Test Suite:** `judge.spec.ts`

#### Test 6.1: Access Judging Interface

```typescript
test('Judge: Access judging dashboard', async ({ page }) => {
  // GIVEN: Judge is logged in
  await loginAs(page, 'judge@mongohacks.test', 'Judge123!');
  
  // WHEN: User navigates to /judging
  await page.goto(`${BASE_URL}/judging`);
  
  // THEN: Judging interface loads
  await page.waitForSelector('h1:has-text("Judging"), [data-testid="judging-dashboard"]');
  
  // ASSERT: Assigned projects or "no assignments" message visible
  const content = await page.locator('text=/projects|no assignments|assign/i');
  expect(await content.count()).toBeGreaterThan(0);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/judge_dashboard.png` });
});
```

#### Test 6.2: Restricted Access to Admin Panel

```typescript
test('Judge: CANNOT access admin panel', async ({ page }) => {
  // GIVEN: Judge is logged in
  await loginAs(page, 'judge@mongohacks.test', 'Judge123!');
  
  // WHEN: User tries to navigate to /admin
  await page.goto(`${BASE_URL}/admin`);
  
  // THEN: User is redirected to dashboard
  await page.waitForTimeout(1000);
  const currentUrl = page.url();
  
  // ASSERT: Not on admin page
  expect(currentUrl).not.toContain('/admin');
  expect(currentUrl).toMatch(/\/(dashboard|judging)/);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/judge_denied_admin.png` });
});
```

---

### Role 7: Mentor

**Test Suite:** `mentor.spec.ts`

#### Test 7.1: View Events

```typescript
test('Mentor: View events list', async ({ page }) => {
  // GIVEN: Mentor is logged in
  await loginAs(page, 'mentor@mongohacks.test', 'Mentor123!');
  
  // WHEN: User navigates to /events
  await page.goto(`${BASE_URL}/events`);
  
  // THEN: Events page loads
  await page.waitForSelector('h1:has-text("Events"), [data-testid="events-list"]');
  
  // ASSERT: At least test event is visible
  const testEvent = await page.locator('text="Test Hackathon 2026"');
  expect(await testEvent.count()).toBeGreaterThan(0);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mentor_events_list.png` });
});
```

#### Test 7.2: Restricted Access to Admin and Judging

```typescript
test('Mentor: CANNOT access admin or judging', async ({ page }) => {
  // GIVEN: Mentor is logged in
  await loginAs(page, 'mentor@mongohacks.test', 'Mentor123!');
  
  // WHEN: User tries to access /admin
  await page.goto(`${BASE_URL}/admin`);
  await page.waitForTimeout(1000);
  let currentUrl = page.url();
  
  // ASSERT: Redirected away from admin
  expect(currentUrl).not.toContain('/admin');
  
  // WHEN: User tries to access /judging
  await page.goto(`${BASE_URL}/judging`);
  await page.waitForTimeout(1000);
  currentUrl = page.url();
  
  // ASSERT: Redirected away from judging or sees "no access" message
  const noAccess = await page.locator('text=/no access|not authorized/i');
  const onDashboard = currentUrl.includes('/dashboard');
  
  expect(onDashboard || await noAccess.count() > 0).toBe(true);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mentor_restricted_access.png` });
});
```

---

### Role 8: Participant

**Test Suite:** `participant.spec.ts`

#### Test 8.1: Full Registration Flow

```typescript
test('Participant: Complete event registration', async ({ page }) => {
  // GIVEN: Participant is logged in
  await loginAs(page, 'participant@mongohacks.test', 'Participant123!');
  
  // WHEN: User navigates to events page
  await page.goto(`${BASE_URL}/events`);
  
  // WHEN: User selects test event
  await page.click('text="Test Hackathon 2026"');
  
  // THEN: Event detail page loads
  await page.waitForURL(new RegExp(`/events/${TEST_EVENT_SLUG}`));
  
  // WHEN: User clicks register button
  await page.click('button:has-text("Register"), a:has-text("Register")');
  
  // THEN: Registration form appears
  await page.waitForSelector('form, [data-testid="registration-form"]');
  
  // WHEN: User fills registration form
  // (Assuming 3-step wizard from registration enhancements)
  
  // Step 1: Account (already logged in, may skip)
  // Step 2: Profile
  await page.fill('textarea[name="bio"]', 'Experienced developer interested in MongoDB');
  
  // Skills (autocomplete - type and select)
  const skillsInput = await page.locator('input[name="skills"], [role="combobox"]');
  await skillsInput.fill('JavaScript');
  await page.keyboard.press('Enter');
  await skillsInput.fill('MongoDB');
  await page.keyboard.press('Enter');
  
  // Experience level
  await page.click('label:has-text("Intermediate"), input[value="intermediate"]');
  
  // Step 3: Custom questions (event-specific)
  // (Handle dynamically based on event config)
  
  // WHEN: User submits registration
  await page.click('button[type="submit"]:has-text("Submit"), button:has-text("Complete")');
  
  // ASSERT: Success message or redirect to dashboard
  await page.waitForSelector('text=/registered|success/i, [data-testid="success-message"]');
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/participant_registration.png` });
});
```

#### Test 8.2: Create Team

```typescript
test('Participant: Create a team', async ({ page }) => {
  // GIVEN: Participant is logged in and registered for event
  await loginAs(page, 'participant@mongohacks.test', 'Participant123!');
  
  // WHEN: User navigates to team creation
  await page.goto(`${BASE_URL}/events/${TEST_EVENT_ID}/teams`);
  
  // WHEN: User clicks create team
  await page.click('button:has-text("Create Team"), a:has-text("New Team")');
  
  // THEN: Team creation form appears
  await page.waitForSelector('form, [role="dialog"]');
  
  // WHEN: User fills team details
  await page.fill('input[name="name"]', 'Test Automation Team');
  await page.fill('textarea[name="description"]', 'Team created for automated testing');
  
  // WHEN: User submits
  await page.click('button[type="submit"]');
  
  // ASSERT: Team appears in list or user is redirected to team page
  await page.waitForSelector('text="Test Automation Team"');
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/participant_create_team.png` });
  
  // STORE: teamId for future tests
  const teamUrl = page.url();
  const teamId = teamUrl.match(/\/teams\/([a-f0-9]+)/)?.[1];
  process.env.TEST_TEAM_ID = teamId;
});
```

#### Test 8.3: Get AI Project Suggestions

```typescript
test('Participant: Generate AI project suggestions', async ({ page }) => {
  // GIVEN: Participant is logged in
  await loginAs(page, 'participant@mongohacks.test', 'Participant123!');
  
  // WHEN: User navigates to project suggestions
  await page.goto(`${BASE_URL}/project-suggestions`);
  
  // THEN: Suggestion form loads
  await page.waitForSelector('form, [data-testid="project-suggestion-form"]');
  
  // WHEN: User selects event
  await page.selectOption('select[name="eventId"]', TEST_EVENT_ID);
  
  // WHEN: User fills preferences (example - may vary by actual form)
  await page.fill('input[name="teamSize"]', '4');
  await page.click('label:has-text("Moderate"), input[value="moderate"]'); // Complexity
  
  // WHEN: User generates suggestions
  await page.click('button:has-text("Generate"), button[type="submit"]');
  
  // ASSERT: Suggestions appear (may take a few seconds for AI)
  await page.waitForSelector('[data-testid="project-idea"], .project-suggestion', { timeout: 30000 });
  
  // ASSERT: At least one suggestion
  const suggestions = await page.locator('[data-testid="project-idea"], .project-suggestion');
  expect(await suggestions.count()).toBeGreaterThan(0);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/participant_project_suggestions.png` });
});
```

#### Test 8.4: Submit Project

```typescript
test('Participant: Submit project', async ({ page }) => {
  // GIVEN: Participant is logged in and has a team
  await loginAs(page, 'participant@mongohacks.test', 'Participant123!');
  
  // WHEN: User navigates to project submission
  await page.goto(`${BASE_URL}/events/${TEST_EVENT_ID}/projects`);
  
  // WHEN: User clicks submit project
  await page.click('button:has-text("Submit Project"), a:has-text("New Project")');
  
  // THEN: Submission form appears
  await page.waitForSelector('form');
  
  // WHEN: User fills project details
  await page.fill('input[name="title"]', 'Test Automation Project');
  await page.fill('textarea[name="description"]', 'Project submitted via automated test');
  await page.fill('input[name="githubUrl"]', 'https://github.com/test/automation-project');
  await page.fill('input[name="demoUrl"]', 'https://demo.test-project.com');
  
  // WHEN: User submits
  await page.click('button[type="submit"]');
  
  // ASSERT: Success message
  await page.waitForSelector('text=/submitted|success/i');
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/participant_submit_project.png` });
});
```

#### Test 8.5: Restricted Access to Admin

```typescript
test('Participant: CANNOT access admin panel', async ({ page }) => {
  // GIVEN: Participant is logged in
  await loginAs(page, 'participant@mongohacks.test', 'Participant123!');
  
  // WHEN: User tries to navigate to /admin
  await page.goto(`${BASE_URL}/admin`);
  
  // THEN: User is redirected to dashboard
  await page.waitForTimeout(1000);
  const currentUrl = page.url();
  
  // ASSERT: Not on admin page
  expect(currentUrl).not.toContain('/admin');
  expect(currentUrl).toMatch(/\/dashboard/);
  
  // CAPTURE: Screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/participant_denied_admin.png` });
});
```

---

## Helper Functions

### Reusable Test Utilities

```typescript
// utils/test-helpers.ts

import { Page } from '@playwright/test';

/**
 * Login helper - reusable across all tests
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto(`${process.env.BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|admin|partner|judging)/);
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  await page.click('[aria-label*="user menu"], button:has-text("Logout"), a:has-text("Logout")');
  await page.waitForURL(/\/login/);
}

/**
 * Create test event helper
 */
export async function createTestEvent(page: Page, eventData: {
  name: string;
  slug: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}): Promise<string> {
  await page.goto(`${process.env.BASE_URL}/admin/events/new`);
  
  await page.fill('input[name="name"]', eventData.name);
  await page.fill('input[name="slug"]', eventData.slug);
  await page.fill('textarea[name="description"]', eventData.description);
  await page.fill('input[name="location"]', eventData.location);
  await page.fill('input[name="startDate"]', eventData.startDate.toISOString().split('T')[0]);
  await page.fill('input[name="endDate"]', eventData.endDate.toISOString().split('T')[0]);
  
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/events/);
  
  // Extract eventId from URL or response
  const url = page.url();
  const eventId = url.match(/\/events\/([a-f0-9]+)/)?.[1] || '';
  return eventId;
}

/**
 * Create test team helper
 */
export async function createTestTeam(page: Page, eventId: string, teamName: string): Promise<string> {
  await page.goto(`${process.env.BASE_URL}/events/${eventId}/teams`);
  await page.click('button:has-text("Create Team")');
  await page.fill('input[name="name"]', teamName);
  await page.fill('textarea[name="description"]', 'Automated test team');
  await page.click('button[type="submit"]');
  
  await page.waitForSelector(`text="${teamName}"`);
  const teamUrl = page.url();
  const teamId = teamUrl.match(/\/teams\/([a-f0-9]+)/)?.[1] || '';
  return teamId;
}

/**
 * Screenshot with metadata
 */
export async function captureEvidence(
  page: Page, 
  filename: string, 
  metadata: {
    testName: string;
    role: string;
    action: string;
    expectedOutcome: string;
    actualOutcome: string;
  }
) {
  const screenshotPath = `${process.env.SCREENSHOT_DIR}/${filename}`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  // Store metadata alongside screenshot
  const metadataPath = screenshotPath.replace('.png', '.json');
  const fs = require('fs');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Assert redirect
 */
export async function assertRedirect(
  page: Page, 
  expectedPattern: RegExp | string,
  timeoutMs: number = 2000
) {
  await page.waitForTimeout(timeoutMs);
  const currentUrl = page.url();
  
  if (typeof expectedPattern === 'string') {
    return currentUrl.includes(expectedPattern);
  } else {
    return expectedPattern.test(currentUrl);
  }
}

/**
 * Check if element is visible and enabled
 */
export async function isActionable(page: Page, selector: string): Promise<boolean> {
  try {
    const element = await page.locator(selector);
    return (await element.isVisible()) && (await element.isEnabled());
  } catch {
    return false;
  }
}

/**
 * Wait for and verify success message
 */
export async function waitForSuccess(page: Page, timeout: number = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(
      'text=/success|saved|created|updated|submitted/i, [role="alert"][aria-label*="success"]',
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * API call to verify database state
 */
export async function verifyDatabaseState(query: any): Promise<any> {
  // Make API call to test endpoint that queries database
  const response = await fetch(`${process.env.BASE_URL}/api/test/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });
  
  return response.json();
}
```

---

## Evidence Collection Requirements

### What to Capture

For each test, capture:

#### 1. Screenshots

**Timing:**
- **Before action** - Initial state
- **After action** - Result state
- **On error** - Error state with full page context

**Format:**
```
{ROLE}_{TEST_NAME}_{TIMESTAMP}.png
```

**Example:**
```
super_admin_ban_user_before_2026-03-01_06-15-00.png
super_admin_ban_user_after_2026-03-01_06-15-02.png
```

#### 2. Metadata JSON

For each screenshot, store:

```json
{
  "testName": "Super Admin: Ban a user",
  "role": "super_admin",
  "action": "Click ban button for participant user",
  "expectedOutcome": "Confirmation dialog appears",
  "actualOutcome": "Confirmation dialog appeared successfully",
  "timestamp": "2026-03-01T06:15:00.000Z",
  "url": "http://localhost:3000/admin/users",
  "success": true,
  "errorMessage": null
}
```

#### 3. Network Logs

Capture API requests/responses:

```typescript
page.on('response', async (response) => {
  if (response.url().includes('/api/')) {
    console.log(`API: ${response.status()} ${response.url()}`);
    
    // Log failed API calls
    if (response.status() >= 400) {
      const body = await response.text();
      console.error(`API Error: ${body}`);
    }
  }
});
```

#### 4. Console Errors

```typescript
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    console.error(`Browser Error: ${msg.text()}`);
  }
});
```

#### 5. Test Execution Log

For each test run:

```json
{
  "testSuite": "super_admin.spec.ts",
  "startTime": "2026-03-01T06:00:00.000Z",
  "endTime": "2026-03-01T06:05:30.000Z",
  "duration": "5m 30s",
  "tests": [
    {
      "name": "Super Admin: Login and access dashboard",
      "status": "passed",
      "duration": "2.3s",
      "screenshots": ["super_admin_login_2026-03-01_06-00-02.png"]
    },
    {
      "name": "Super Admin: Access template settings",
      "status": "passed",
      "duration": "1.8s",
      "screenshots": ["super_admin_templates_2026-03-01_06-00-05.png"]
    }
  ],
  "summary": {
    "total": 8,
    "passed": 7,
    "failed": 1,
    "skipped": 0
  }
}
```

---

## Error Handling & Logging

### Common Failure Scenarios

#### Scenario 1: Element Not Found

```typescript
test('Handle missing element gracefully', async ({ page }) => {
  try {
    await page.click('button:has-text("Submit")', { timeout: 5000 });
  } catch (error) {
    // CAPTURE: Screenshot of error state
    await captureEvidence(page, 'error_element_not_found.png', {
      testName: 'Test Name',
      role: 'participant',
      action: 'Click submit button',
      expectedOutcome: 'Button exists and is clickable',
      actualOutcome: `Element not found: ${error.message}`
    });
    
    // LOG: Error details
    console.error('Element not found:', {
      selector: 'button:has-text("Submit")',
      url: page.url(),
      html: await page.content()
    });
    
    // RE-THROW: Fail the test
    throw error;
  }
});
```

#### Scenario 2: Unexpected Redirect

```typescript
test('Detect unexpected redirect', async ({ page }) => {
  const expectedUrl = '/admin/users';
  await page.goto(`${BASE_URL}${expectedUrl}`);
  
  await page.waitForTimeout(1000);
  const actualUrl = page.url();
  
  if (!actualUrl.includes(expectedUrl)) {
    // CAPTURE: Screenshot showing unexpected location
    await captureEvidence(page, 'error_unexpected_redirect.png', {
      testName: 'Admin: Access users page',
      role: 'admin',
      action: 'Navigate to /admin/users',
      expectedOutcome: `Stay on ${expectedUrl}`,
      actualOutcome: `Redirected to ${actualUrl}`
    });
    
    // LOG: Redirect details
    console.error('Unexpected redirect:', {
      expected: expectedUrl,
      actual: actualUrl,
      role: 'admin',
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`Unexpected redirect: ${actualUrl}`);
  }
});
```

#### Scenario 3: API Error

```typescript
test('Handle API errors', async ({ page }) => {
  // Listen for failed API calls
  const apiErrors: any[] = [];
  
  page.on('response', async (response) => {
    if (response.status() >= 400 && response.url().includes('/api/')) {
      const body = await response.text();
      apiErrors.push({
        url: response.url(),
        status: response.status(),
        body: body
      });
    }
  });
  
  // Perform action that may cause API error
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  // CHECK: If API errors occurred
  if (apiErrors.length > 0) {
    await captureEvidence(page, 'error_api_failure.png', {
      testName: 'Submit form',
      role: 'participant',
      action: 'Submit project form',
      expectedOutcome: 'API returns 200/201',
      actualOutcome: `API failed: ${JSON.stringify(apiErrors)}`
    });
    
    throw new Error(`API errors: ${JSON.stringify(apiErrors, null, 2)}`);
  }
});
```

#### Scenario 4: Test Data Missing

```typescript
test('Verify test data exists before running', async ({ page }) => {
  // CHECK: Test event exists
  const eventId = process.env.TEST_EVENT_ID;
  
  if (!eventId) {
    throw new Error('TEST_EVENT_ID not set. Run test data setup first.');
  }
  
  // VERIFY: Event is accessible
  await page.goto(`${BASE_URL}/events/${eventId}`);
  const is404 = await page.locator('text=/not found|404/i').count() > 0;
  
  if (is404) {
    throw new Error(`Test event ${eventId} not found. Create test data first.`);
  }
});
```

---

## Test Report Format

### JSON Report Structure

After each test run, generate a comprehensive JSON report:

```json
{
  "testRun": {
    "id": "run_2026-03-01_060000",
    "environment": "local",
    "baseUrl": "http://localhost:3000",
    "startTime": "2026-03-01T06:00:00.000Z",
    "endTime": "2026-03-01T06:45:30.000Z",
    "duration": "45m 30s",
    "executor": "AI Test Automation Engineer"
  },
  "summary": {
    "totalSuites": 8,
    "totalTests": 64,
    "passed": 58,
    "failed": 6,
    "skipped": 0,
    "successRate": "90.6%"
  },
  "suites": [
    {
      "name": "super_admin.spec.ts",
      "role": "super_admin",
      "tests": [
        {
          "id": "test_001",
          "name": "Super Admin: Login and access dashboard",
          "status": "passed",
          "duration": "2.3s",
          "steps": [
            {
              "action": "Navigate to /login",
              "expected": "Login page loads",
              "actual": "Login page loaded successfully",
              "success": true
            },
            {
              "action": "Fill email and password",
              "expected": "Form accepts input",
              "actual": "Form filled successfully",
              "success": true
            },
            {
              "action": "Click submit",
              "expected": "Redirect to dashboard or admin",
              "actual": "Redirected to /admin",
              "success": true
            },
            {
              "action": "Verify admin navigation visible",
              "expected": "Admin link is visible",
              "actual": "Admin link found and visible",
              "success": true
            }
          ],
          "evidence": [
            "screenshots/super_admin_login_2026-03-01_06-00-02.png"
          ],
          "notes": null
        },
        {
          "id": "test_002",
          "name": "Super Admin: Access template settings",
          "status": "passed",
          "duration": "1.8s",
          "steps": [
            {
              "action": "Navigate to /admin/settings/templates",
              "expected": "Page loads without redirect",
              "actual": "Page loaded successfully",
              "success": true
            },
            {
              "action": "Verify template controls visible",
              "expected": "Create button or template list visible",
              "actual": "Create Template button found",
              "success": true
            }
          ],
          "evidence": [
            "screenshots/super_admin_templates_2026-03-01_06-00-05.png"
          ],
          "notes": null
        },
        {
          "id": "test_003",
          "name": "Super Admin: Ban a user",
          "status": "passed",
          "duration": "3.1s",
          "steps": [
            {
              "action": "Navigate to /admin/users",
              "expected": "Users table loads",
              "actual": "Table loaded with 8 users",
              "success": true
            },
            {
              "action": "Click ban button for participant",
              "expected": "Confirmation dialog appears",
              "actual": "Dialog appeared with ban confirmation",
              "success": true
            },
            {
              "action": "Confirm ban",
              "expected": "User is banned, success message shows",
              "actual": "Success: User banned",
              "success": true
            },
            {
              "action": "Cleanup: Unban user",
              "expected": "User is unbanned",
              "actual": "User unbanned successfully",
              "success": true
            }
          ],
          "evidence": [
            "screenshots/super_admin_ban_user_2026-03-01_06-00-08.png"
          ],
          "notes": null
        }
      ],
      "summary": {
        "total": 8,
        "passed": 8,
        "failed": 0,
        "duration": "15.2s"
      }
    },
    {
      "name": "admin.spec.ts",
      "role": "admin",
      "tests": [
        {
          "id": "test_009",
          "name": "Admin: CANNOT access template settings",
          "status": "failed",
          "duration": "2.1s",
          "steps": [
            {
              "action": "Navigate to /admin/settings/templates",
              "expected": "Redirect away from templates page",
              "actual": "Page loaded (SHOULD HAVE REDIRECTED)",
              "success": false
            }
          ],
          "evidence": [
            "screenshots/admin_denied_templates_2026-03-01_06-02-15.png"
          ],
          "notes": "BUG FOUND: Admin role can access template settings page. Expected redirect to /admin or /dashboard. This is a privilege escalation vulnerability."
        }
      ],
      "summary": {
        "total": 8,
        "passed": 7,
        "failed": 1,
        "duration": "14.8s"
      }
    }
  ],
  "issues": [
    {
      "id": "issue_001",
      "severity": "high",
      "title": "Admin can access super_admin-only template settings",
      "description": "Admin role successfully accessed /admin/settings/templates without being redirected. This page should be restricted to super_admin role only.",
      "affectedTest": "admin.spec.ts - Test #009",
      "evidence": "screenshots/admin_denied_templates_2026-03-01_06-02-15.png",
      "expectedBehavior": "Admin should be redirected to /admin or /dashboard when attempting to access /admin/settings/templates",
      "actualBehavior": "Page loaded successfully, showing template management UI",
      "reproSteps": [
        "Login as admin@mongohacks.test / Admin123!",
        "Navigate to /admin/settings/templates",
        "Observe: Page loads instead of redirecting"
      ],
      "suggestedFix": "Add requireSuperAdmin() guard to /admin/settings/templates page",
      "assignee": "Backend Team",
      "priority": "P0 - Critical Security Issue"
    },
    {
      "id": "issue_002",
      "severity": "medium",
      "title": "Participant cannot create team (missing event registration)",
      "description": "Participant was unable to create a team because they were not registered for the event. The UI should show a clear error message or disable the button.",
      "affectedTest": "participant.spec.ts - Test #042",
      "evidence": "screenshots/participant_create_team_error_2026-03-01_06-30-12.png",
      "expectedBehavior": "Clear error message: 'You must register for this event before creating a team'",
      "actualBehavior": "Generic error: 'Failed to create team'",
      "reproSteps": [
        "Login as unregistered participant",
        "Navigate to /events/{eventId}/teams",
        "Click Create Team",
        "Fill form and submit",
        "Observe: Generic error message"
      ],
      "suggestedFix": "Improve error handling in team creation API to return specific error codes. Update UI to show registration requirement.",
      "assignee": "Frontend Team",
      "priority": "P1 - High Priority UX Issue"
    }
  ],
  "metrics": {
    "averageTestDuration": "1.9s",
    "slowestTest": {
      "name": "Participant: Generate AI project suggestions",
      "duration": "28.3s"
    },
    "fastestTest": {
      "name": "Mentor: View events list",
      "duration": "0.8s"
    },
    "flakyTests": [],
    "coverage": {
      "roles": {
        "super_admin": "100% (8/8 tests)",
        "admin": "87.5% (7/8 tests)",
        "organizer": "100% (8/8 tests)",
        "marketer": "100% (8/8 tests)",
        "partner": "100% (8/8 tests)",
        "judge": "100% (8/8 tests)",
        "mentor": "100% (8/8 tests)",
        "participant": "87.5% (7/8 tests)"
      }
    }
  }
}
```

---

### HTML Report (Human-Readable)

Generate an HTML report using a template like:

```html
<!DOCTYPE html>
<html>
<head>
  <title>MongoHacks RBAC Test Report - 2026-03-01</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 20px; }
    .header { background: #00684A; color: white; padding: 20px; border-radius: 8px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .metric { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
    .metric h3 { margin: 0 0 10px; font-size: 14px; color: #666; }
    .metric .value { font-size: 32px; font-weight: bold; color: #00684A; }
    .passed { color: #13AA52; }
    .failed { color: #DA1E28; }
    .test-suite { background: white; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0; }
    .test-suite-header { background: #f9f9f9; padding: 15px; border-bottom: 1px solid #ddd; }
    .test { padding: 15px; border-bottom: 1px solid #eee; }
    .test:last-child { border-bottom: none; }
    .test.passed { border-left: 4px solid #13AA52; }
    .test.failed { border-left: 4px solid #DA1E28; }
    .issue { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .issue.high { background: #FFEBEE; border-left-color: #DA1E28; }
    .screenshot { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🦞 MongoHacks RBAC Test Report</h1>
    <p>Test Run: 2026-03-01 06:00:00 - 06:45:30 EST</p>
    <p>Executor: AI Test Automation Engineer</p>
  </div>

  <div class="summary">
    <div class="metric">
      <h3>Total Tests</h3>
      <div class="value">64</div>
    </div>
    <div class="metric">
      <h3>Passed</h3>
      <div class="value passed">58</div>
    </div>
    <div class="metric">
      <h3>Failed</h3>
      <div class="value failed">6</div>
    </div>
    <div class="metric">
      <h3>Success Rate</h3>
      <div class="value">90.6%</div>
    </div>
  </div>

  <h2>🚨 Issues Found (2)</h2>
  
  <div class="issue high">
    <h3>🔴 HIGH: Admin can access super_admin-only template settings</h3>
    <p><strong>Test:</strong> admin.spec.ts - Test #009</p>
    <p><strong>Description:</strong> Admin role successfully accessed /admin/settings/templates without being redirected...</p>
    <p><strong>Expected:</strong> Redirect to /admin or /dashboard</p>
    <p><strong>Actual:</strong> Page loaded successfully</p>
    <p><strong>Priority:</strong> P0 - Critical Security Issue</p>
    <img src="screenshots/admin_denied_templates_2026-03-01_06-02-15.png" class="screenshot" alt="Evidence">
  </div>

  <h2>📊 Test Suites</h2>

  <div class="test-suite">
    <div class="test-suite-header">
      <h3>super_admin.spec.ts</h3>
      <p>8 tests • 8 passed • 0 failed • 15.2s</p>
    </div>
    <div class="test passed">
      <h4>✅ Super Admin: Login and access dashboard (2.3s)</h4>
      <ul>
        <li>Navigate to /login → ✓ Login page loaded successfully</li>
        <li>Fill email and password → ✓ Form filled successfully</li>
        <li>Click submit → ✓ Redirected to /admin</li>
        <li>Verify admin navigation → ✓ Admin link found and visible</li>
      </ul>
      <img src="screenshots/super_admin_login_2026-03-01_06-00-02.png" class="screenshot" alt="Evidence">
    </div>
    <!-- More tests... -->
  </div>

  <!-- More test suites... -->
</body>
</html>
```

---

## Test Execution Commands

### Run All Tests

```bash
# Full test suite (all 8 roles)
npm run test:rbac

# With HTML report
npm run test:rbac -- --reporter=html

# Headed mode (watch browser)
npm run test:rbac -- --headed

# Debug mode
npm run test:rbac -- --debug
```

### Run Specific Role

```bash
# Single role
npm run test:rbac -- super_admin.spec.ts
npm run test:rbac -- participant.spec.ts

# Multiple roles
npm run test:rbac -- admin.spec.ts organizer.spec.ts
```

### Generate Report Only

```bash
# Re-generate HTML report from existing JSON
node scripts/generate-report.js test-reports/run_2026-03-01_060000.json
```

---

## Continuous Integration Setup

### GitHub Actions Workflow

```yaml
# .github/workflows/rbac-tests.yml
name: RBAC User Journey Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * *' # Daily at 6 AM EST

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm ci
          npx playwright install
      
      - name: Setup test database
        run: |
          docker-compose up -d mongodb
          sleep 10 # Wait for MongoDB to be ready
      
      - name: Seed test data
        run: npx tsx scripts/seed-test-users.ts
      
      - name: Run RBAC tests
        run: npm run test:rbac -- --reporter=json
      
      - name: Generate HTML report
        if: always()
        run: node scripts/generate-report.js
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            test-reports/
            test-evidence/
      
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('test-reports/latest.json'));
            const summary = `## 🧪 RBAC Test Results
            
            - ✅ Passed: ${report.summary.passed}
            - ❌ Failed: ${report.summary.failed}
            - Success Rate: ${report.summary.successRate}
            
            [View full report](${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: summary
            });
```

---

## Handoff Checklist for AI Engineer

Before starting automation:

- [ ] Review this entire document
- [ ] Understand test environment setup requirements
- [ ] Install Playwright or chosen automation framework
- [ ] Run `npx tsx scripts/seed-test-users.ts` to create test accounts
- [ ] Create at least one test event manually for initial tests
- [ ] Verify BASE_URL is set correctly
- [ ] Create screenshot and report directories
- [ ] Run one test manually to verify setup
- [ ] Review evidence collection requirements
- [ ] Understand JSON report format
- [ ] Plan test execution schedule (daily/weekly)

---

## Expected Deliverables

1. **Test Execution Reports** (JSON + HTML) for each run
2. **Screenshot Evidence** for all tests (passed and failed)
3. **Issues Log** with severity, reproduction steps, and suggested fixes
4. **Metrics Dashboard** showing success rate trends over time
5. **Weekly Summary** with top issues and recommendations

---

## Support & Questions

- **Platform Documentation:** `/docs/TEST_CREDENTIALS.md`
- **Slack Channel:** `#engineering`
- **Contact:** Platform Team

---

**Document Version:** 1.0  
**Last Updated:** March 1, 2026 6:00 AM EST  
**Maintained By:** Platform Team
## Test Report Format

### Test Execution Report Structure

```json
{
  "reportMetadata": {
    "reportId": "test-run-2026-03-01-06-00",
    "environment": "local",
    "baseUrl": "http://localhost:3000",
    "timestamp": "2026-03-01T06:00:00.000Z",
    "tester": "automated",
    "framework": "playwright",
    "version": "1.40.0"
  },
  "testSuites": [
    {
      "suite": "super_admin.spec.ts",
      "role": "super_admin",
      "startTime": "2026-03-01T06:00:00.000Z",
      "endTime": "2026-03-01T06:05:30.000Z",
      "duration": "5m 30s",
      "tests": [
        {
          "testId": "SA-001",
          "name": "Super Admin: Login and access dashboard",
          "status": "passed",
          "duration": "2.3s",
          "retries": 0,
          "evidence": {
            "screenshots": [
              "super_admin_login_before_2026-03-01_06-00-00.png",
              "super_admin_login_after_2026-03-01_06-00-02.png"
            ],
            "metadata": [
              "super_admin_login_before_2026-03-01_06-00-00.json",
              "super_admin_login_after_2026-03-01_06-00-02.json"
            ],
            "networkLogs": "super_admin_login_network_2026-03-01_06-00-00.json",
            "consoleLogs": "super_admin_login_console_2026-03-01_06-00-00.log"
          },
          "assertions": [
            {
              "description": "User sees admin navigation",
              "expected": "Admin link is visible",
              "actual": "Admin link is visible",
              "passed": true
            }
          ]
        },
        {
          "testId": "SA-002",
          "name": "Super Admin: Access template settings",
          "status": "passed",
          "duration": "1.8s",
          "retries": 0,
          "evidence": {
            "screenshots": [
              "super_admin_templates_2026-03-01_06-00-05.png"
            ],
            "metadata": [
              "super_admin_templates_2026-03-01_06-00-05.json"
            ]
          },
          "assertions": [
            {
              "description": "Page loads successfully",
              "expected": "No redirect, template list visible",
              "actual": "Template list visible",
              "passed": true
            }
          ]
        },
        {
          "testId": "SA-003",
          "name": "Super Admin: Ban a user",
          "status": "failed",
          "duration": "3.2s",
          "retries": 1,
          "error": {
            "message": "Element not found: button[aria-label*='Ban']",
            "stack": "Error: Element not found...",
            "screenshotOnError": "super_admin_ban_user_error_2026-03-01_06-00-10.png"
          },
          "evidence": {
            "screenshots": [
              "super_admin_ban_user_before_2026-03-01_06-00-08.png",
              "super_admin_ban_user_error_2026-03-01_06-00-10.png"
            ],
            "metadata": [
              "super_admin_ban_user_before_2026-03-01_06-00-08.json",
              "super_admin_ban_user_error_2026-03-01_06-00-10.json"
            ],
            "networkLogs": "super_admin_ban_user_network_2026-03-01_06-00-08.json"
          },
          "assertions": [
            {
              "description": "Ban button exists for participant user",
              "expected": "Button is visible and clickable",
              "actual": "Button not found in DOM",
              "passed": false
            }
          ],
          "issue": {
            "id": "ISSUE-001",
            "severity": "high",
            "component": "UsersView.tsx",
            "description": "Ban button missing from users table",
            "reproSteps": [
              "1. Login as super_admin",
              "2. Navigate to /admin/users",
              "3. Look for ban button in participant user row",
              "4. Button does not exist"
            ],
            "expectedBehavior": "Ban button should be visible for all users (except super_admin's own row)",
            "actualBehavior": "Ban button missing from table rows",
            "potentialCause": "Button may be conditionally rendered based on role, or component not imported"
          }
        }
      ],
      "summary": {
        "total": 5,
        "passed": 4,
        "failed": 1,
        "skipped": 0,
        "passRate": "80%"
      }
    }
  ],
  "overallSummary": {
    "totalSuites": 8,
    "totalTests": 42,
    "passed": 38,
    "failed": 3,
    "skipped": 1,
    "passRate": "90.5%",
    "duration": "45m 30s"
  },
  "issues": [
    {
      "id": "ISSUE-001",
      "testId": "SA-003",
      "role": "super_admin",
      "severity": "high",
      "component": "UsersView.tsx",
      "summary": "Ban button missing from users table",
      "status": "open",
      "assignedTo": null,
      "createdAt": "2026-03-01T06:00:10.000Z"
    },
    {
      "id": "ISSUE-002",
      "testId": "M-002",
      "role": "marketer",
      "severity": "medium",
      "component": "AdminLayout.tsx",
      "summary": "Marketer sees 'Users' link in sidebar (should be hidden)",
      "status": "open",
      "assignedTo": null,
      "createdAt": "2026-03-01T06:15:22.000Z"
    }
  ],
  "recommendations": [
    "Fix ISSUE-001 (high severity) before production release",
    "Review sidebar visibility logic for marketer role",
    "Add missing ban button to UsersView component",
    "Consider adding role-based tests to CI/CD pipeline"
  ]
}
```

---

### Issue Tracking Template

When a test fails, create an issue with this structure:

```markdown
# ISSUE-001: Ban Button Missing from Users Table

**Severity:** High  
**Component:** `UsersView.tsx`  
**Role:** super_admin  
**Test:** SA-003 (Super Admin: Ban a user)  
**Status:** Open  
**Detected:** 2026-03-01 06:00 AM EST  

---

## Summary

Ban button is missing from the users table when super_admin tries to moderate users.

---

## Expected Behavior

Ban button should be visible and clickable for all user rows (except the logged-in user's own row).

**Visual Reference:**
- Button label: "Ban" or icon with aria-label="Ban user"
- Location: Actions column in users table
- Enabled state: Disabled for super_admin's own row, enabled for all others

---

## Actual Behavior

Ban button does not exist in the DOM when viewing the users table at `/admin/users`.

---

## Reproduction Steps

1. Run seed script: `npx tsx scripts/seed-test-users.ts`
2. Login as `super@mongohacks.test` / `SuperAdmin123!`
3. Navigate to `/admin/users`
4. Inspect participant user row
5. **Result:** No ban button found

---

## Evidence

**Screenshots:**
- Before: `super_admin_ban_user_before_2026-03-01_06-00-08.png`
- Error state: `super_admin_ban_user_error_2026-03-01_06-00-10.png`

**Metadata:**
```json
{
  "testName": "Super Admin: Ban a user",
  "role": "super_admin",
  "action": "Click ban button for participant user",
  "expectedOutcome": "Confirmation dialog appears",
  "actualOutcome": "Element not found: button[aria-label*='Ban']",
  "timestamp": "2026-03-01T06:00:10.000Z",
  "url": "http://localhost:3000/admin/users"
}
```

**Network Logs:**
- GET `/api/admin/users` → 200 OK (users loaded successfully)

**Console Errors:**
- None

---

## Potential Causes

1. **Component not imported:** Ban button component missing from `UsersView.tsx`
2. **Conditional rendering:** Button hidden based on incorrect role check
3. **CSS issue:** Button exists but is `display: none` or `visibility: hidden`
4. **Feature flag:** Ban functionality disabled in current environment

---

## Suggested Fix

1. Verify `UsersView.tsx` includes ban button component:
   ```tsx
   <IconButton 
     aria-label="Ban user"
     onClick={() => handleBan(user._id)}
     disabled={user.role === 'super_admin'}
   >
     <BlockIcon />
   </IconButton>
   ```

2. Check role-based visibility logic:
   ```tsx
   {(userRole === 'super_admin' || 
     (userRole === 'admin' && user.role !== 'admin')) && (
     <BanButton userId={user._id} />
   )}
   ```

3. Verify component is rendered in table:
   ```tsx
   <TableCell>
     <BanButton userId={user._id} userRole={user.role} />
     <DeleteButton userId={user._id} userRole={user.role} />
   </TableCell>
   ```

---

## Related Tests

- SA-003: Super Admin: Ban a user (FAILED)
- A-003: Admin: Can ban participant but NOT another admin (May fail if button missing)

---

## Priority

**High** - User moderation is a core admin feature. Without ban functionality, platform security is compromised.

---

## Assignee

_To be assigned_

---

## Resolution

_Pending_
```

---

### Playwright Configuration Example

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Test timeout
  timeout: 30 * 1000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 5000
  },
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail fast on CI
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Reporter
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-reports/results.json' }],
    ['junit', { outputFile: 'test-reports/junit.xml' }],
    ['allure-playwright']
  ],
  
  // Shared settings for all projects
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on first retry
    video: 'retain-on-failure',
    
    // Trace on first retry
    trace: 'on-first-retry',
    
    // Custom storage state directory
    storageState: undefined
  },
  
  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    }
  ],
  
  // Web server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
});
```

---

### Running the Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Set environment variables
export BASE_URL="http://localhost:3000"
export TEST_EVENT_ID="<your-test-event-id>"
export SCREENSHOT_DIR="./test-evidence"
export REPORT_DIR="./test-reports"

# Create test accounts
npx tsx scripts/seed-test-users.ts

# Run all tests
npx playwright test

# Run specific role
npx playwright test super_admin.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report

# Run with specific browser
npx playwright test --project=chromium

# Run tests in parallel with 4 workers
npx playwright test --workers=4
```

---

### Test Execution Checklist

Before running automated tests:

- [ ] **Environment Setup**
  - [ ] MongoDB running and accessible
  - [ ] Next.js dev server running (`npm run dev`)
  - [ ] Environment variables set (BASE_URL, etc.)

- [ ] **Test Data**
  - [ ] Test accounts created (`npx tsx scripts/seed-test-users.ts`)
  - [ ] Test event created and `TEST_EVENT_ID` set
  - [ ] Test team created (optional, can be created during tests)

- [ ] **Directories**
  - [ ] `test-evidence/` directory exists
  - [ ] `test-reports/` directory exists
  - [ ] Proper write permissions

- [ ] **Browser Setup**
  - [ ] Playwright browsers installed (`npx playwright install`)
  - [ ] No conflicting browser instances

---

### CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml

name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build Next.js app
        run: npm run build
      
      - name: Start Next.js server
        run: npm run start &
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/mongohacks-test
      
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Seed test data
        run: npx tsx scripts/seed-test-users.ts
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/mongohacks-test
      
      - name: Run E2E tests
        run: npx playwright test
        env:
          BASE_URL: http://localhost:3000
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
      
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-evidence
          path: test-evidence/
          retention-days: 30
```

---

## Summary

### What This Document Provides

✅ **8 Complete Role Test Suites**
- Super Admin (5 tests)
- Admin (4 tests)
- Organizer (3 tests)
- Marketer (3 tests)
- Partner (3 tests)
- Judge (2 tests)
- Mentor (2 tests)
- Participant (5 tests)

✅ **~35 Automation-Ready Test Scripts**
- GIVEN-WHEN-THEN-ASSERT-CAPTURE format
- Full Playwright/TypeScript code
- Evidence collection built-in

✅ **Helper Functions & Utilities**
- Login/logout helpers
- Test data creation
- Evidence capture
- Error handling

✅ **Reporting & Issue Tracking**
- JSON test report format
- Issue tracking template (Markdown)
- Playwright configuration
- CI/CD integration example

---

### For the AI Engineer

**Next Steps:**

1. **Review this document** - Understand test structure and evidence requirements
2. **Set up environment** - Install Playwright, seed test accounts
3. **Run sample test** - Start with `super_admin.spec.ts` to verify setup
4. **Customize selectors** - Update selectors based on actual component structure
5. **Expand coverage** - Add more tests for edge cases and negative scenarios
6. **Integrate CI/CD** - Add tests to GitHub Actions or your CI pipeline
7. **Document issues** - Use issue template for any bugs found

**Tips:**

- Start with one role (Participant recommended - covers most features)
- Run tests in headed mode first (`--headed`) to see what's happening
- Use `--debug` flag for step-by-step execution
- Screenshot on every assertion for better debugging
- Keep test data isolated (use `@mongohacks.test` domain)
- Clean up test data after each run if needed

---

**Questions or Issues?**

Contact: Platform Team  
Slack: `#engineering`  
Docs: `/docs`

---

**Last Updated:** March 1, 2026 6:20 AM EST  
**Version:** 1.0.0  
**Status:** Ready for Automation
