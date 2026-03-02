import { test, expect } from '@playwright/test';
import { loginAs, captureEvidence, assertRedirectedFrom } from '../helpers/test-helpers';

test.describe('Role: Admin — RBAC User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('A-01: Login redirects to dashboard or admin', async ({ page }) => {
    expect(page.url()).toMatch(/\/(dashboard|admin)/);

    await captureEvidence(page, 'admin_login.png', {
      testName: 'A-01: Login redirects to dashboard or admin',
      role: 'admin',
      action: 'Login with admin credentials',
      expectedOutcome: 'Redirect to /dashboard or /admin',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('A-02: Can access admin panel', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('/admin');

    await captureEvidence(page, 'admin_admin_panel.png', {
      testName: 'A-02: Can access admin panel',
      role: 'admin',
      action: 'Navigate to /admin',
      expectedOutcome: 'Admin panel loads without redirect',
      actualOutcome: 'Admin panel loaded successfully',
      success: true,
    });
  });

  test('A-03: CANNOT access template settings (super_admin only)', async ({ page }) => {
    await page.goto('/admin/settings/templates');
    await page.waitForLoadState('domcontentloaded');

    // Admin should be redirected away from template settings
    // Per admin-guard.ts: requireSuperAdmin redirects non-super_admin to /admin
    await assertRedirectedFrom(page, '/settings/templates');

    await captureEvidence(page, 'admin_denied_templates.png', {
      testName: 'A-03: CANNOT access template settings',
      role: 'admin',
      action: 'Navigate to /admin/settings/templates',
      expectedOutcome: 'Redirect away from templates page',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('A-04: Can access user management', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('/admin/users');

    await captureEvidence(page, 'admin_users.png', {
      testName: 'A-04: Can access user management',
      role: 'admin',
      action: 'Navigate to /admin/users',
      expectedOutcome: 'Users page loads',
      actualOutcome: 'Users page loaded successfully',
      success: true,
    });
  });

  test('A-05: Can access events management', async ({ page }) => {
    await page.goto('/admin/events');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('/admin/events');

    await captureEvidence(page, 'admin_events.png', {
      testName: 'A-05: Can access events management',
      role: 'admin',
      action: 'Navigate to /admin/events',
      expectedOutcome: 'Events page loads',
      actualOutcome: 'Events page loaded successfully',
      success: true,
    });
  });

  test('A-06: Can navigate to create event', async ({ page }) => {
    await page.goto('/admin/events/new');
    await page.waitForLoadState('domcontentloaded');

    // Should stay on create event page
    expect(page.url()).toContain('/admin/events/new');

    await captureEvidence(page, 'admin_create_event.png', {
      testName: 'A-06: Can navigate to create event',
      role: 'admin',
      action: 'Navigate to /admin/events/new',
      expectedOutcome: 'Create event form loads',
      actualOutcome: 'Create event page loaded',
      success: true,
    });
  });
});
