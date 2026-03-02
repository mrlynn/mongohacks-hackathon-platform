import { test, expect } from '@playwright/test';
import { loginAs, captureEvidence, TEST_USERS } from '../helpers/test-helpers';

test.describe('Role: Super Admin — RBAC User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'super_admin');
  });

  test('SA-01: Login redirects to dashboard or admin', async ({ page }) => {
    // After loginAs, we should be on /dashboard or /admin
    expect(page.url()).toMatch(/\/(dashboard|admin)/);

    await captureEvidence(page, 'super_admin_login.png', {
      testName: 'SA-01: Login redirects to dashboard or admin',
      role: 'super_admin',
      action: 'Login with super_admin credentials',
      expectedOutcome: 'Redirect to /dashboard or /admin',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('SA-02: Can access admin panel', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Should stay on /admin (not redirected)
    expect(page.url()).toContain('/admin');

    // Verify admin dashboard content loads
    const heading = page.locator('h1, h2, h3, h4').first();
    await expect(heading).toBeVisible();

    await captureEvidence(page, 'super_admin_admin_panel.png', {
      testName: 'SA-02: Can access admin panel',
      role: 'super_admin',
      action: 'Navigate to /admin',
      expectedOutcome: 'Admin panel loads without redirect',
      actualOutcome: 'Admin panel loaded successfully',
      success: true,
    });
  });

  test('SA-03: Can access template settings (super_admin only)', async ({ page }) => {
    await page.goto('/admin/settings/templates');
    await page.waitForLoadState('domcontentloaded');

    // Super admin should NOT be redirected away
    expect(page.url()).toContain('/admin/settings');

    await captureEvidence(page, 'super_admin_templates.png', {
      testName: 'SA-03: Can access template settings',
      role: 'super_admin',
      action: 'Navigate to /admin/settings/templates',
      expectedOutcome: 'Page loads without redirect',
      actualOutcome: `Stayed on ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('SA-04: Can access user management', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');

    // Should stay on /admin/users
    expect(page.url()).toContain('/admin/users');

    await captureEvidence(page, 'super_admin_users.png', {
      testName: 'SA-04: Can access user management',
      role: 'super_admin',
      action: 'Navigate to /admin/users',
      expectedOutcome: 'Users page loads',
      actualOutcome: 'Users page loaded successfully',
      success: true,
    });
  });

  test('SA-05: Can access events management', async ({ page }) => {
    await page.goto('/admin/events');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('/admin/events');

    await captureEvidence(page, 'super_admin_events.png', {
      testName: 'SA-05: Can access events management',
      role: 'super_admin',
      action: 'Navigate to /admin/events',
      expectedOutcome: 'Events page loads',
      actualOutcome: 'Events page loaded successfully',
      success: true,
    });
  });
});
