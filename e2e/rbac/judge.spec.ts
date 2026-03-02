import { test, expect } from '@playwright/test';
import { loginAs, captureEvidence, assertRedirectedFrom } from '../helpers/test-helpers';

test.describe('Role: Judge — RBAC User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'judge');
  });

  test('J-01: Login redirects to dashboard', async ({ page }) => {
    expect(page.url()).toMatch(/\/(dashboard|judging)/);

    await captureEvidence(page, 'judge_login.png', {
      testName: 'J-01: Login redirects to dashboard',
      role: 'judge',
      action: 'Login with judge credentials',
      expectedOutcome: 'Redirect to /dashboard or /judging',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('J-02: Can access dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('/dashboard');

    await captureEvidence(page, 'judge_dashboard.png', {
      testName: 'J-02: Can access dashboard',
      role: 'judge',
      action: 'Navigate to /dashboard',
      expectedOutcome: 'Dashboard loads',
      actualOutcome: 'Dashboard loaded successfully',
      success: true,
    });
  });

  test('J-03: CANNOT access admin panel', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Judge is NOT in ADMIN_PANEL_ROLES → redirected to /dashboard
    const url = new URL(page.url());
    expect(url.pathname).not.toMatch(/^\/admin/);

    await captureEvidence(page, 'judge_denied_admin.png', {
      testName: 'J-03: CANNOT access admin panel',
      role: 'judge',
      action: 'Navigate to /admin',
      expectedOutcome: 'Redirect to /dashboard',
      actualOutcome: `Redirected to ${url.pathname}`,
      success: true,
    });
  });

  test('J-04: CANNOT access user management', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');

    await assertRedirectedFrom(page, '/admin/users');

    await captureEvidence(page, 'judge_denied_users.png', {
      testName: 'J-04: CANNOT access user management',
      role: 'judge',
      action: 'Navigate to /admin/users',
      expectedOutcome: 'Redirect away from users',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('J-05: CANNOT access partner portal', async ({ page }) => {
    await page.goto('/partner');
    await page.waitForLoadState('domcontentloaded');

    // Judge is NOT in PARTNER_PORTAL_ROLES
    const url = new URL(page.url());
    expect(url.pathname).not.toContain('/partner');

    await captureEvidence(page, 'judge_denied_partner.png', {
      testName: 'J-05: CANNOT access partner portal',
      role: 'judge',
      action: 'Navigate to /partner',
      expectedOutcome: 'Redirect away from /partner',
      actualOutcome: `Redirected to ${url.pathname}`,
      success: true,
    });
  });
});
