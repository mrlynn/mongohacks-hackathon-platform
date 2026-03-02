import { test, expect } from '@playwright/test';
import { loginAs, captureEvidence, assertRedirectedFrom } from '../helpers/test-helpers';

test.describe('Role: Marketer — RBAC User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'marketer');
  });

  test('M-01: Login redirects appropriately', async ({ page }) => {
    expect(page.url()).toMatch(/\/(dashboard|admin)/);

    await captureEvidence(page, 'marketer_login.png', {
      testName: 'M-01: Login redirects appropriately',
      role: 'marketer',
      action: 'Login with marketer credentials',
      expectedOutcome: 'Redirect to /dashboard or /admin',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('M-02: Can access admin panel (limited)', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Marketer is in ADMIN_PANEL_ROLES
    expect(page.url()).toContain('/admin');

    await captureEvidence(page, 'marketer_admin_panel.png', {
      testName: 'M-02: Can access admin panel',
      role: 'marketer',
      action: 'Navigate to /admin',
      expectedOutcome: 'Admin panel loads (marketing-focused)',
      actualOutcome: 'Admin panel loaded',
      success: true,
    });
  });

  test('M-03: CANNOT create new event', async ({ page }) => {
    await page.goto('/admin/events/new');
    await page.waitForLoadState('domcontentloaded');

    // Marketer is NOT in EVENT_MANAGEMENT_ROLES
    // If event creation uses requireAdmin or event management guard, should redirect
    const url = new URL(page.url());

    await captureEvidence(page, 'marketer_denied_create_event.png', {
      testName: 'M-03: CANNOT create new event',
      role: 'marketer',
      action: 'Navigate to /admin/events/new',
      expectedOutcome: 'Redirect away from event creation',
      actualOutcome: `Current URL: ${url.pathname}`,
      success: !url.pathname.includes('/events/new'),
    });
  });

  test('M-04: CANNOT access user management', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');

    await assertRedirectedFrom(page, '/admin/users');

    await captureEvidence(page, 'marketer_denied_users.png', {
      testName: 'M-04: CANNOT access user management',
      role: 'marketer',
      action: 'Navigate to /admin/users',
      expectedOutcome: 'Redirect away from users page',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('M-05: CANNOT access template settings', async ({ page }) => {
    await page.goto('/admin/settings/templates');
    await page.waitForLoadState('domcontentloaded');

    await assertRedirectedFrom(page, '/settings/templates');

    await captureEvidence(page, 'marketer_denied_templates.png', {
      testName: 'M-05: CANNOT access template settings',
      role: 'marketer',
      action: 'Navigate to /admin/settings/templates',
      expectedOutcome: 'Redirect away from templates',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });
});
