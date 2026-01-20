import { test, expect } from '@playwright/test';

test.describe('Registration Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText("Don't have an account? Sign up").click();
    await expect(page.getByRole('heading', { level: 2, name: /create your account/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page.getByRole('alert')).toContainText('Please fill in all fields');
  });

  test('should validate password length', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Angel');
    await page.getByLabel('Email address').fill('jparga@griddynamics.com');
    await page.getByLabel('Password').fill('123');
    await page.getByLabel('Confirm Password').fill('123');
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page.getByRole('alert')).toContainText('Password must be at least 6 characters');
  });

  test('should validate password mismatch', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Angel');
    await page.getByLabel('Email address').fill('jparga@griddynamics.com');
    await page.getByLabel('Password').fill('123456');
    await page.getByLabel('Confirm Password').fill('1234567');
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page.getByRole('alert')).toContainText('Passwords do not match');
  });

  test('should register successfully and navigate to dashboard', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Angel');
    await page.getByLabel('Email address').fill('jparga@griddynamics.com');
    await page.getByLabel('Password').fill('123456');
    await page.getByLabel('Confirm Password').fill('123456');

    const submit = page.getByRole('button', { name: /sign up/i });
    await expect(submit).toBeEnabled();
    await submit.click();

    // During simulated login, button text changes to "Cargando..."
    await expect(submit).toHaveText(/Cargando.../i);

    // After mock login completes, user should see dashboard layout
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should have accessible labels', async ({ page }) => {
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
  });
});
