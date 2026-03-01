import { test, expect } from '@playwright/test';

test.describe('Atlas Cluster Management - Empty State', () => {
  test('should show empty state when no cluster exists', async ({ page }) => {
    // GIVEN: User is logged in as organizer/admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'organizer@mongohacks.test');
    await page.fill('input[name="password"]', 'Organizer123!');
    await page.click('button[type="submit"]');
    
    // Wait for successful login
    await page.waitForURL('/dashboard');
    
    // GIVEN: User has a team (assume test data exists)
    // Navigate to team's Atlas page
    await page.goto('/teams/test-team-id/atlas');
    
    // THEN: Should see empty state
    await expect(page.locator('text=No Atlas Cluster')).toBeVisible();
    await expect(page.locator('text=Your team hasn\'t provisioned a MongoDB Atlas cluster yet.')).toBeVisible();
    
    // AND: Should see provision button if team leader
    await expect(page.locator('button:has-text("Provision Free Cluster")')).toBeVisible();
    
    // CAPTURE: Screenshot for evidence
    await page.screenshot({ path: 'test-evidence/atlas-empty-state.png' });
  });
  
  test('should NOT show phantom clusters', async ({ page }) => {
    // GIVEN: Database is empty (verified via direct query)
    // GIVEN: User is logged in
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@mongohacks.test');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // WHEN: User navigates to Atlas page
    await page.goto('/teams/test-team-id/atlas');
    
    // THEN: Should NOT see any cluster cards with the phantom ID
    const phantomId = '69a2b76edf6e529f3e10a134';
    const phantomCluster = page.locator(`[data-cluster-id="${phantomId}"]`);
    await expect(phantomCluster).not.toBeVisible();
    
    // AND: Should see empty state instead
    await expect(page.locator('text=No Atlas Cluster')).toBeVisible();
    
    // CAPTURE: Network request to verify API returns empty array
    const response = await page.waitForResponse(
      resp => resp.url().includes('/api/atlas/clusters') && resp.status() === 200
    );
    const data = await response.json();
    expect(data.clusters).toEqual([]);
    
    // CAPTURE: Screenshot
    await page.screenshot({ path: 'test-evidence/atlas-no-phantom.png' });
  });
  
  test('should have proper cache-control headers', async ({ page }) => {
    // GIVEN: User is logged in
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@mongohacks.test');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // WHEN: User navigates to Atlas page
    await page.goto('/teams/test-team-id/atlas');
    
    // THEN: API response should have no-cache headers
    const response = await page.waitForResponse(
      resp => resp.url().includes('/api/atlas/clusters')
    );
    
    const headers = response.headers();
    expect(headers['cache-control']).toContain('no-store');
    expect(headers['cache-control']).toContain('no-cache');
    expect(headers['pragma']).toBe('no-cache');
    
    // CAPTURE: Evidence
    console.log('Cache headers:', headers);
  });
});
