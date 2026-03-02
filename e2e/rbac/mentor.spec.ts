import { test, expect } from '@playwright/test';
import { loginAs, captureEvidence, assertRedirectedFrom } from '../helpers/test-helpers';

test.describe('Role: Mentor — RBAC User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'mentor');
  });

  test('MN-01: Login redirects to dashboard', async ({ page }) => {
    expect(page.url()).toMatch(/\/dashboard/);

    await captureEvidence(page, 'mentor_login.png', {
      testName: 'MN-01: Login redirects to dashboard',
      role: 'mentor',
      action: 'Login with mentor credentials',
      expectedOutcome: 'Redirect to /dashboard',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('MN-02: Can access events listing', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('/events');

    await captureEvidence(page, 'mentor_events.png', {
      testName: 'MN-02: Can access events listing',
      role: 'mentor',
      action: 'Navigate to /events',
      expectedOutcome: 'Events page loads',
      actualOutcome: 'Events page loaded',
      success: true,
    });
  });

  test('MN-03: CANNOT access admin panel', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    const url = new URL(page.url());
    expect(url.pathname).not.toMatch(/^\/admin/);

    await captureEvidence(page, 'mentor_denied_admin.png', {
      testName: 'MN-03: CANNOT access admin panel',
      role: 'mentor',
      action: 'Navigate to /admin',
      expectedOutcome: 'Redirect to /dashboard',
      actualOutcome: `Redirected to ${url.pathname}`,
      success: true,
    });
  });

  test('MN-04: CANNOT access partner portal', async ({ page }) => {
    await page.goto('/partner');
    await page.waitForLoadState('domcontentloaded');

    const url = new URL(page.url());
    expect(url.pathname).not.toContain('/partner');

    await captureEvidence(page, 'mentor_denied_partner.png', {
      testName: 'MN-04: CANNOT access partner portal',
      role: 'mentor',
      action: 'Navigate to /partner',
      expectedOutcome: 'Redirect away from /partner',
      actualOutcome: `Redirected to ${url.pathname}`,
      success: true,
    });
  });

  test('MN-05: CANNOT access user management', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');

    await assertRedirectedFrom(page, '/admin/users');

    await captureEvidence(page, 'mentor_denied_users.png', {
      testName: 'MN-05: CANNOT access user management',
      role: 'mentor',
      action: 'Navigate to /admin/users',
      expectedOutcome: 'Redirect away from users',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });
});
