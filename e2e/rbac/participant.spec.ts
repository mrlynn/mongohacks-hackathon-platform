import { test, expect } from '@playwright/test';
import { loginAs, captureEvidence, assertRedirectedFrom } from '../helpers/test-helpers';

test.describe('Role: Participant — RBAC User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'participant');
  });

  test('PT-01: Login redirects to dashboard', async ({ page }) => {
    expect(page.url()).toMatch(/\/dashboard/);

    await captureEvidence(page, 'participant_login.png', {
      testName: 'PT-01: Login redirects to dashboard',
      role: 'participant',
      action: 'Login with participant credentials',
      expectedOutcome: 'Redirect to /dashboard',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('PT-02: Can access dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('/dashboard');

    const heading = page.locator('h1, h2, h3, h4').first();
    await expect(heading).toBeVisible();

    await captureEvidence(page, 'participant_dashboard.png', {
      testName: 'PT-02: Can access dashboard',
      role: 'participant',
      action: 'Navigate to /dashboard',
      expectedOutcome: 'Dashboard loads',
      actualOutcome: 'Dashboard loaded successfully',
      success: true,
    });
  });

  test('PT-03: Can browse events', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('/events');

    await captureEvidence(page, 'participant_events.png', {
      testName: 'PT-03: Can browse events',
      role: 'participant',
      action: 'Navigate to /events',
      expectedOutcome: 'Events listing loads',
      actualOutcome: 'Events page loaded',
      success: true,
    });
  });

  test('PT-04: CANNOT access admin panel', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Participant is NOT in ADMIN_PANEL_ROLES → redirected to /dashboard
    const url = new URL(page.url());
    expect(url.pathname).not.toMatch(/^\/admin/);
    expect(url.pathname).toMatch(/\/(dashboard|login)/);

    await captureEvidence(page, 'participant_denied_admin.png', {
      testName: 'PT-04: CANNOT access admin panel',
      role: 'participant',
      action: 'Navigate to /admin',
      expectedOutcome: 'Redirect to /dashboard',
      actualOutcome: `Redirected to ${url.pathname}`,
      success: true,
    });
  });

  test('PT-05: CANNOT access partner portal', async ({ page }) => {
    await page.goto('/partner');
    await page.waitForLoadState('domcontentloaded');

    const url = new URL(page.url());
    expect(url.pathname).not.toContain('/partner');

    await captureEvidence(page, 'participant_denied_partner.png', {
      testName: 'PT-05: CANNOT access partner portal',
      role: 'participant',
      action: 'Navigate to /partner',
      expectedOutcome: 'Redirect away from /partner',
      actualOutcome: `Redirected to ${url.pathname}`,
      success: true,
    });
  });

  test('PT-06: CANNOT access user management', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');

    await assertRedirectedFrom(page, '/admin/users');

    await captureEvidence(page, 'participant_denied_users.png', {
      testName: 'PT-06: CANNOT access user management',
      role: 'participant',
      action: 'Navigate to /admin/users',
      expectedOutcome: 'Redirect away from users',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('PT-07: CANNOT access template settings', async ({ page }) => {
    await page.goto('/admin/settings/templates');
    await page.waitForLoadState('domcontentloaded');

    await assertRedirectedFrom(page, '/settings/templates');

    await captureEvidence(page, 'participant_denied_templates.png', {
      testName: 'PT-07: CANNOT access template settings',
      role: 'participant',
      action: 'Navigate to /admin/settings/templates',
      expectedOutcome: 'Redirect away from templates',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });
});
