import { test, expect } from '@playwright/test';
import { loginAs, captureEvidence, assertRedirectedFrom } from '../helpers/test-helpers';

test.describe('Role: Partner — RBAC User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'partner');
  });

  test('P-01: Login redirects to partner portal or dashboard', async ({ page }) => {
    expect(page.url()).toMatch(/\/(dashboard|partner)/);

    await captureEvidence(page, 'partner_login.png', {
      testName: 'P-01: Login redirects to partner portal or dashboard',
      role: 'partner',
      action: 'Login with partner credentials',
      expectedOutcome: 'Redirect to /partner or /dashboard',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('P-02: Can access partner portal', async ({ page }) => {
    await page.goto('/partner');
    await page.waitForLoadState('domcontentloaded');

    // Partner is in PARTNER_PORTAL_ROLES
    expect(page.url()).toContain('/partner');

    await captureEvidence(page, 'partner_portal.png', {
      testName: 'P-02: Can access partner portal',
      role: 'partner',
      action: 'Navigate to /partner',
      expectedOutcome: 'Partner portal loads',
      actualOutcome: 'Partner portal loaded',
      success: true,
    });
  });

  test('P-03: CANNOT access admin panel (should redirect)', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Partner is NOT in ADMIN_PANEL_ROLES → requireAdminPanel redirects to /dashboard
    const url = new URL(page.url());
    expect(url.pathname).not.toMatch(/^\/admin/);

    await captureEvidence(page, 'partner_denied_admin.png', {
      testName: 'P-03: CANNOT access admin panel',
      role: 'partner',
      action: 'Navigate to /admin',
      expectedOutcome: 'Redirect away from /admin',
      actualOutcome: `Redirected to ${url.pathname}`,
      success: true,
    });
  });

  test('P-04: CANNOT access user management', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');

    await assertRedirectedFrom(page, '/admin/users');

    await captureEvidence(page, 'partner_denied_users.png', {
      testName: 'P-04: CANNOT access user management',
      role: 'partner',
      action: 'Navigate to /admin/users',
      expectedOutcome: 'Redirect away from users',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('P-05: CANNOT create events', async ({ page }) => {
    await page.goto('/admin/events/new');
    await page.waitForLoadState('domcontentloaded');

    await assertRedirectedFrom(page, '/admin/events/new');

    await captureEvidence(page, 'partner_denied_create_event.png', {
      testName: 'P-05: CANNOT create events',
      role: 'partner',
      action: 'Navigate to /admin/events/new',
      expectedOutcome: 'Redirect away from event creation',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });
});
