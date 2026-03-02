import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || './test-evidence';

export interface TestCredentials {
  email: string;
  password: string;
  role: string;
}

export const TEST_USERS: Record<string, TestCredentials> = {
  super_admin: { email: 'super@mongohacks.test', password: 'SuperAdmin123!', role: 'super_admin' },
  admin: { email: 'admin@mongohacks.test', password: 'Admin123!', role: 'admin' },
  organizer: { email: 'organizer@mongohacks.test', password: 'Organizer123!', role: 'organizer' },
  marketer: { email: 'marketer@mongohacks.test', password: 'Marketer123!', role: 'marketer' },
  partner: { email: 'partner@mongohacks.test', password: 'Partner123!', role: 'partner' },
  judge: { email: 'judge@mongohacks.test', password: 'Judge123!', role: 'judge' },
  mentor: { email: 'mentor@mongohacks.test', password: 'Mentor123!', role: 'mentor' },
  participant: { email: 'participant@mongohacks.test', password: 'Participant123!', role: 'participant' },
};

/**
 * Login as a specific role using the password login form.
 * After login, waits for redirect to dashboard/admin/partner.
 */
export async function loginAs(page: Page, role: keyof typeof TEST_USERS) {
  const { email, password } = TEST_USERS[role];

  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  // Fill MUI TextFields using input type selectors (most reliable for MUI)
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 10_000 });
  await emailInput.click();
  await emailInput.fill(email);

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.click();
  await passwordInput.fill(password);

  // Click sign in button
  await page.getByRole('button', { name: /sign in/i }).first().click();

  // Wait for successful redirect (away from /login)
  // The app uses window.location.href for redirect, so wait for navigation
  // Use 30s timeout — parallel tests can cause slow responses from the dev server
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 30_000 });
}

/**
 * Login with explicit email/password (for custom credentials).
 */
export async function loginWithCredentials(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 10_000 });
  await emailInput.click();
  await emailInput.fill(email);

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.click();
  await passwordInput.fill(password);

  await page.getByRole('button', { name: /sign in/i }).first().click();

  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 30_000 });
}

/**
 * Capture a screenshot with associated metadata JSON.
 */
export async function captureEvidence(
  page: Page,
  filename: string,
  metadata: {
    testName: string;
    role: string;
    action: string;
    expectedOutcome: string;
    actualOutcome: string;
    success: boolean;
  },
) {
  // Ensure directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const screenshotPath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const metadataPath = screenshotPath.replace('.png', '.json');
  fs.writeFileSync(
    metadataPath,
    JSON.stringify(
      {
        ...metadata,
        timestamp: new Date().toISOString(),
        url: page.url(),
      },
      null,
      2,
    ),
  );
}

/**
 * Assert that the page was redirected away from a given path.
 */
export async function assertRedirectedFrom(page: Page, forbiddenPath: string, waitMs = 2_000) {
  await page.waitForTimeout(waitMs);
  const currentUrl = new URL(page.url());
  expect(currentUrl.pathname).not.toContain(forbiddenPath);
}

/**
 * Assert that the page URL matches a pattern.
 */
export async function assertUrlMatches(page: Page, pattern: RegExp, waitMs = 2_000) {
  await page.waitForTimeout(waitMs);
  expect(page.url()).toMatch(pattern);
}

/**
 * Check if an element is visible and enabled (actionable).
 */
export async function isActionable(page: Page, selector: string): Promise<boolean> {
  try {
    const el = page.locator(selector);
    return (await el.isVisible()) && (await el.isEnabled());
  } catch {
    return false;
  }
}
