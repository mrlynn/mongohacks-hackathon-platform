import { test, expect } from '@playwright/test';
import { loginAs, captureEvidence, assertRedirectedFrom } from '../helpers/test-helpers';

test.describe('Role: Organizer — RBAC User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'organizer');
  });

  test('O-01: Login redirects to admin panel', async ({ page }) => {
    // Organizer is in ADMIN_PANEL_ROLES, so likely goes to /admin or /dashboard
    expect(page.url()).toMatch(/\/(dashboard|admin)/);

    await captureEvidence(page, 'organizer_login.png', {
      testName: 'O-01: Login redirects appropriately',
      role: 'organizer',
      action: 'Login with organizer credentials',
      expectedOutcome: 'Redirect to /dashboard or /admin',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('O-02: Can access admin panel (limited)', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Organizer is in ADMIN_PANEL_ROLES — should stay on /admin
    expect(page.url()).toContain('/admin');

    await captureEvidence(page, 'organizer_admin_panel.png', {
      testName: 'O-02: Can access admin panel',
      role: 'organizer',
      action: 'Navigate to /admin',
      expectedOutcome: 'Admin panel loads (limited view)',
      actualOutcome: 'Admin panel loaded',
      success: true,
    });
  });

  test('O-03: Can access events management', async ({ page }) => {
    await page.goto('/admin/events');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('/admin/events');

    await captureEvidence(page, 'organizer_events.png', {
      testName: 'O-03: Can access events management',
      role: 'organizer',
      action: 'Navigate to /admin/events',
      expectedOutcome: 'Events page loads',
      actualOutcome: 'Events page loaded',
      success: true,
    });
  });

  test('O-04: Can navigate to create event', async ({ page }) => {
    await page.goto('/admin/events/new');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toContain('/admin/events/new');

    await captureEvidence(page, 'organizer_create_event.png', {
      testName: 'O-04: Can navigate to create event',
      role: 'organizer',
      action: 'Navigate to /admin/events/new',
      expectedOutcome: 'Create event form loads',
      actualOutcome: 'Create event page loaded',
      success: true,
    });
  });

  test('O-05: CANNOT access user management', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');

    // Organizer is NOT in ADMIN_ROLES, so requireAdmin should redirect
    // admin/users likely uses requireAdmin guard
    await assertRedirectedFrom(page, '/admin/users');

    await captureEvidence(page, 'organizer_denied_users.png', {
      testName: 'O-05: CANNOT access user management',
      role: 'organizer',
      action: 'Navigate to /admin/users',
      expectedOutcome: 'Redirect away from users page',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });

  test('O-06: CANNOT access template settings', async ({ page }) => {
    await page.goto('/admin/settings/templates');
    await page.waitForLoadState('domcontentloaded');

    await assertRedirectedFrom(page, '/settings/templates');

    await captureEvidence(page, 'organizer_denied_templates.png', {
      testName: 'O-06: CANNOT access template settings',
      role: 'organizer',
      action: 'Navigate to /admin/settings/templates',
      expectedOutcome: 'Redirect away from templates',
      actualOutcome: `Redirected to ${new URL(page.url()).pathname}`,
      success: true,
    });
  });
});
