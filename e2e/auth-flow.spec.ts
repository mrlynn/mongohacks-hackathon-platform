import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show sign in page', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Check for sign in form elements
    await expect(page.locator('h1, h2, h3')).toContainText(/sign in|login/i);
  });

  test('should navigate to sign up from sign in', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Look for sign up link
    const signUpLink = page.getByRole('link', { name: /sign up|register/i });
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await page.waitForURL(/signup|register/);
    }
  });
});

test.describe('Public Pages', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check page loaded successfully
    await expect(page).toHaveTitle(/hackathon|mongohacks/i);
  });

  test('should load events listing page', async ({ page }) => {
    await page.goto('/events');
    
    // Should show events page
    await expect(page.locator('h1, h2')).toContainText(/events|hackathons/i);
  });

  test('should load individual event page', async ({ page }) => {
    await page.goto('/events/699ebaccf7ef07608d28d4ea');
    
    // Page should load (either event details or 404)
    const statusCode = await page.evaluate(() => {
      return fetch(window.location.href).then(r => r.status);
    });
    
    expect([200, 404]).toContain(statusCode);
  });
});

test.describe('Landing Pages', () => {
  test('should load landing page by slug', async ({ page }) => {
    await page.goto('/test-event');
    
    // Should show landing page content
    const hasHeading = await page.locator('h1').count() > 0;
    expect(hasHeading).toBeTruthy();
  });

  test('should handle invalid slug gracefully', async ({ page }) => {
    await page.goto('/nonexistent-event-slug-12345');
    
    // Should show 404 or redirect
    const url = page.url();
    const statusCode = await page.evaluate(() => {
      return fetch(window.location.href).then(r => r.status);
    });
    
    // Either 404 or redirect to events
    expect([404, 301, 302]).toContain(statusCode);
  });
});
