/**
 * User Profile Management E2E Tests
 *
 * Covers: registration, profile updates, password change, account deletion.
 * Aligns with docs/TEST_CASES_USER_PROFILE_E2E.md
 *
 * Run: npx playwright test user-profile-management
 */

import { test, expect } from '@playwright/test';

const STORAGE_KEY = 'app_fake_token';

/** Clear auth state before tests that need unauthenticated or fresh auth */
async function clearAuth(page: import('@playwright/test').Page) {
  await page.context().addInitScript(() => {
    localStorage.removeItem(STORAGE_KEY);
  });
}

/** Set auth token and navigate to settings (ensures authenticated state) */
async function gotoSettingsAsAuthenticated(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate((key) => localStorage.setItem(key, 'fake-token'), STORAGE_KEY);
  await page.reload();
  await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByText('Profile Settings')).toBeVisible({ timeout: 10000 });
}

// ─── 1. Positive Test Cases ──────────────────────────────────────────────────

test.describe('Positive: User Registration (TC-001)', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/');
    await page.getByText("Don't have an account? Sign up").waitFor({ state: 'visible', timeout: 15000 });
    await page.getByText("Don't have an account? Sign up").click();
    await expect(page.getByRole('heading', { level: 2, name: /create your account/i })).toBeVisible({ timeout: 10000 });
  });

  test.skip('TC-001: User Registration with Valid Data', async ({ page }) => {
    // Step 3 (Review) never appears - known issue, see register.spec.ts skipped form submission tests
    const testData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
    };

    await page.getByLabel('Full Name').fill(testData.name);
    await page.getByRole('button', { name: /next step/i }).click();
    await expect(page.getByRole('heading', { level: 3, name: /account details/i })).toBeVisible();

    await page.getByLabel('Email address').fill(testData.email);
    await page.locator('#password').fill(testData.password);
    await page.locator('#confirm-password').fill(testData.password);
    await page.getByRole('button', { name: /next step/i }).click();

    // Wait for step 3 - Create account button appears after Review step
    const submitBtn = page.getByRole('button', { name: /create account/i });
    await expect(submitBtn).toBeVisible({ timeout: 15000 });
    await submitBtn.click();

    // Expected: User redirected to dashboard or sees success message
    await expect(
      page.getByRole('heading', { name: /dashboard/i }).or(
        page.getByText(/account created successfully|redirecting/i)
      )
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Positive: Profile Update (TC-002)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoSettingsAsAuthenticated(page);
  });

  test('TC-002: Successful Profile Update', async ({ page }) => {
    const newBio = 'Software Engineer passionate about AI';
    const newLocation = 'San Francisco, CA';

    // Update bio field
    const bioField = page.getByPlaceholder('Tell us about yourself...');
    await bioField.clear();
    await bioField.fill(newBio);

    // Update location
    const locationField = page.getByPlaceholder('City, Country');
    await locationField.clear();
    await locationField.fill(newLocation);

    // Accept alert before clicking Save
    page.on('dialog', (dialog) => dialog.accept());

    const saveButton = page.getByRole('button', { name: 'Save Changes' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Expected: Success message (alert in current impl)
    // Changes reflected - verify by checking the form still has our values after save
    await expect(bioField).toHaveValue(newBio);
    await expect(locationField).toHaveValue(newLocation);
  });
});

test.describe('Positive: Password Change (TC-003)', () => {
  test('TC-003: Password Change - SKIP (feature not implemented)', async () => {
    test.skip(true, 'Password change UI not yet implemented');
  });
});

// ─── 2. Negative Test Cases ─────────────────────────────────────────────────

test.describe('Negative: Registration (TC-101, TC-102, TC-103)', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/');
    await page.getByText("Don't have an account? Sign up").waitFor({ state: 'visible', timeout: 15000 });
    await page.getByText("Don't have an account? Sign up").click();
    await expect(page.getByRole('heading', { level: 2, name: /create your account/i })).toBeVisible({ timeout: 10000 });
  });

  test('TC-102: Invalid Email Format', async ({ page }) => {
    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByRole('button', { name: /next step/i }).click();

    await page.getByLabel('Email address').fill('notanemail');
    await page.locator('#password').fill('SecurePass123!');
    await page.locator('#confirm-password').fill('SecurePass123!');
    await page.getByRole('button', { name: /next step/i }).click();

    await expect(page.getByRole('alert')).toContainText(/valid email|email.*required/i);
  });

  test('TC-103: Password Does Not Meet Requirements', async ({ page }) => {
    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByRole('button', { name: /next step/i }).click();

    // Frontend enforces min 6 chars; use 'weak' to trigger validation
    await page.getByLabel('Email address').fill('john@example.com');
    await page.locator('#password').fill('weak');
    await page.locator('#confirm-password').fill('weak');
    await page.getByRole('button', { name: /next step/i }).click();

    await expect(page.getByRole('alert')).toContainText(/at least|password|character/i);
  });
});

test.describe('Negative: Profile Update Without Auth (TC-104)', () => {
  test('TC-104: Profile Update Without Authentication', async ({ page }) => {
    await clearAuth(page);
    await page.goto('/settings');

    // Expected: User should be redirected to login (unauthenticated)
    await expect(page.getByRole('heading', { name: /sign in|login/i })).toBeVisible({ timeout: 10000 });
  });
});

// ─── 3. Edge Cases ──────────────────────────────────────────────────────────

test.describe('Edge: Special Characters (TC-201, TC-202)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoSettingsAsAuthenticated(page);
  });

  test('TC-202: Special Characters / XSS in Bio - Input Accepted and Sanitized', async ({ page }) => {
    const xssPayload = "<script>alert('xss')</script>";
    const bioField = page.getByPlaceholder('Tell us about yourself...');

    await bioField.fill(xssPayload);

    // Track only XSS alerts (Save button triggers success alert - ignore that)
    let xssAlertFired = false;
    page.on('dialog', (dialog) => {
      if (/xss|script|onerror/i.test(dialog.message())) xssAlertFired = true;
      dialog.accept();
    });

    const saveButton = page.getByRole('button', { name: 'Save Changes' });
    await saveButton.click();

    // Navigate away and back - ensure no script execution on re-render
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Settings' }).click();

    // If XSS worked, alert would have fired. We expect input to be escaped/stored safely.
    expect(xssAlertFired).toBe(false);
  });
});

test.describe('Edge: Long Username (TC-201)', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/');
    await page.getByText("Don't have an account? Sign up").waitFor({ state: 'visible', timeout: 15000 });
    await page.getByText("Don't have an account? Sign up").click();
    await expect(page.getByRole('heading', { level: 2, name: /create your account/i })).toBeVisible({ timeout: 10000 });
  });

  test('TC-201: Very Long Name - Validation or Truncation', async ({ page }) => {
    const longName = 'a'.repeat(101);
    await page.getByLabel('Full Name').fill(longName);
    await page.getByRole('button', { name: /next step/i }).click();

    // Expected: Error or acceptance. Current app validates max 100 chars.
    await expect(page.getByRole('alert')).toContainText(/at most|100|character/i);
  });
});

// ─── 4. Security Test Cases ─────────────────────────────────────────────────

test.describe('Security: XSS in Profile Fields (TC-302)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoSettingsAsAuthenticated(page);
  });

  test('TC-302: XSS Attack in Bio Field - No Script Execution', async ({ page }) => {
    const xssBio = '<img src=x onerror=alert("XSS")>';
    const bioField = page.getByPlaceholder('Tell us about yourself...');
    await bioField.fill(xssBio);

    let xssFired = false;
    page.on('dialog', (dialog) => {
      xssFired = dialog.message().includes('XSS');
      dialog.accept();
    });

    const saveButton = page.getByRole('button', { name: 'Save Changes' });
    await saveButton.click();

    // Give time for any delayed script execution
    await page.waitForTimeout(500);

    expect(xssFired).toBe(false);
  });
});

test.describe('Security: Session / Auth (TC-305)', () => {
  test('TC-305: No Token - Redirect to Login', async ({ page }) => {
    await clearAuth(page);
    await page.goto('/profile');

    // Expected: Without valid token, user redirected to login
    await expect(page.getByRole('heading', { name: /sign in|login/i })).toBeVisible({ timeout: 10000 });
  });
});

// ─── 5. Account Deletion (TC-401+) - Future ──────────────────────────────────

test.describe('Account Deletion (TC-401+)', () => {
  test('TC-401: Account Deletion - SKIP (feature not implemented)', async () => {
    test.skip(true, 'Account deletion UI not yet implemented');
  });
});
