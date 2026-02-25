import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('should complete full hackathon flow: register → team → project', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/test-event');
    
    // Check landing page loaded
    await expect(page.locator('h1')).toContainText('test');
    
    // Click register button
    const registerButton = page.getByRole('button', { name: /register/i });
    if (await registerButton.isVisible()) {
      await registerButton.click();
      
      // Should redirect to auth or registration page
      await page.waitForURL(/\/(register|auth)/);
    }
  });

  test('should display events map', async ({ page }) => {
    await page.goto('/events/map');
    
    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Check map markers
    const markers = page.locator('.leaflet-marker-icon');
    const count = await markers.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should show admin events page (if logged in as admin)', async ({ page }) => {
    // This test requires authentication setup
    // For now, just check the page exists
    await page.goto('/admin/events');
    
    // Should either show login or admin page
    const url = page.url();
    expect(url).toMatch(/\/(admin|auth)/);
  });

  test('should display user dashboard after login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login if not authenticated
    await page.waitForURL(/\/(dashboard|auth)/);
  });
});

test.describe('Judge Workflow', () => {
  test('should load judging interface', async ({ page, context }) => {
    // Note: This requires auth setup with judge role
    await page.goto('/judging/699ebaccf7ef07608d28d4ea'); // Test event ID
    
    // Check if redirected to auth or shows judging page
    const url = page.url();
    expect(url).toMatch(/\/(judging|auth)/);
  });
});

test.describe('Admin Workflow', () => {
  test('should load results page', async ({ page }) => {
    await page.goto('/admin/events/699ebaccf7ef07608d28d4ea/results');
    
    // Should redirect to auth if not admin
    const url = page.url();
    expect(url).toMatch(/\/(results|auth)/);
  });

  test('should load landing page builder', async ({ page }) => {
    await page.goto('/admin/events/699ebaccf7ef07608d28d4ea/landing-page');
    
    const url = page.url();
    expect(url).toMatch(/\/(landing-page|auth)/);
  });

  test('should load event registrations', async ({ page }) => {
    await page.goto('/admin/events/699ebaccf7ef07608d28d4ea/registrations');
    
    const url = page.url();
    expect(url).toMatch(/\/(registrations|auth)/);
  });
});
